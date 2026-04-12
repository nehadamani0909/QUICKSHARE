import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const share = await prisma.share.findUnique({ where: { id } });

  if (!share) {
    return NextResponse.json(
      { error: "Not found or expired" },
      { status: 404 },
    );
  }

  if (new Date() > share.expiresAt) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  return NextResponse.json(share);
}
