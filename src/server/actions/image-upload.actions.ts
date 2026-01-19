"use server";

import { v2 as cloudinary } from "cloudinary";
import { getServerAuthSession } from "@/server/auth/session";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const session = await getServerAuthSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file uploaded" };

  try {
    const hasCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudinary) {
      return { success: false, error: "Cloudinary configuration is missing" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const base64Data = buffer.toString("base64");
    const fileType = file.type || "image/png";
    const dataURI = `data:${fileType};base64,${base64Data}`;

    const result: any = await cloudinary.uploader.upload(dataURI, {
      folder: process.env.CLOUDINARY_FOLDER || "kkm-web",
      resource_type: "image",
    });

    const url = result?.secure_url || result?.url;
    if (!url) return { success: false, error: "Cloudinary did not return any URL" };

    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error?.message || "Upload failed" };
  }
}
