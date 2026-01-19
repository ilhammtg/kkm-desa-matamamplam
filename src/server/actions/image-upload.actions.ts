"use server";

import { v2 as cloudinary } from "cloudinary";
import { getServerAuthSession } from "@/server/auth/session";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const session = await getServerAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file uploaded" };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const hasCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudinary) {
      return { success: false, error: "Cloudinary configuration is missing" };
    }

    const base64Data = buffer.toString("base64");
    const fileType = file.type || "image/png";
    const dataURI = `data:${fileType};base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: process.env.CLOUDINARY_FOLDER || "kkm-web",
      resource_type: "image",
    });

    if (!result.secure_url) {
      return { success: false, error: "Cloudinary did not return a secure_url" };
    }

    return { success: true, url: result.secure_url };
  } catch (error: any) {
    return { success: false, error: error?.message || "Upload failed" };
  }
}
