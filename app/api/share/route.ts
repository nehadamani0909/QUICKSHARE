import { NextRequest, NextResponse } from "next/server";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const expiryValue = formData.get("expiry");
    const contentValue = formData.get("content");
    const fileValue = formData.get("file");
    const expiryMinutes =
      typeof expiryValue === "string"
        ? Number.parseInt(expiryValue, 10)
        : Number.NaN;
    const content = typeof contentValue === "string" ? contentValue.trim() : "";
    const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

    if (!Number.isFinite(expiryMinutes) || expiryMinutes <= 0) {
      return NextResponse.json(
        { error: "Expiry must be a positive number of minutes" },
        { status: 400 },
      );
    }

    if (!content && !file) {
      return NextResponse.json(
        { error: "Add text or choose a file to share" },
        { status: 400 },
      );
    }

    const expiresAt = new Date(Date.now() + expiryMinutes * 60_000);
    const fileUrl = file ? await uploadFileToCloudinary(file) : null;

    const share = await prisma.share.create({
      data: {
        content: content || null,
        fileUrl,
        expiresAt,
      },
    });

    return NextResponse.json({ link: `/share/${share.id}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
