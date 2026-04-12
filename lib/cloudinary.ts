import { createHash } from "node:crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

function getCloudinaryConfig() {
  if (!cloudName) {
    throw new Error("Missing CLOUDINARY_CLOUD_NAME");
  }

  if (uploadPreset) {
    return {
      cloudName,
      apiKey,
      apiSecret,
      uploadPreset,
    };
  }

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary credentials. Set CLOUDINARY_UPLOAD_PRESET for unsigned uploads or CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET for signed uploads.",
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
  };
}

function signUpload(params: Record<string, string>, secret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${toSign}${secret}`).digest("hex");
}

export async function uploadFileToCloudinary(file: File) {
  const config = getCloudinaryConfig();
  const formData = new FormData();
  const timestamp = Math.floor(Date.now() / 1000).toString();

  formData.append("file", file);
  formData.append("timestamp", timestamp);

  if (config.uploadPreset) {
    formData.append("upload_preset", config.uploadPreset);
  } else if (config.apiKey && config.apiSecret) {
    const signature = signUpload({ timestamp }, config.apiSecret);
    formData.append("api_key", config.apiKey);
    formData.append("signature", signature);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok || typeof data.secure_url !== "string") {
    throw new Error(data.error?.message ?? "Cloudinary upload failed");
  }

  return data.secure_url as string;
}
