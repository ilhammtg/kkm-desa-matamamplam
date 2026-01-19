"use server";

import { v2 as cloudinary } from "cloudinary";
import { getServerAuthSession } from "@/server/auth/session";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(formData: FormData) {
  // 1. Auth Check
  const session = await getServerAuthSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // 2. Get File
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  // 3. Convert to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 4. Upload Logic
  try {
    // Check if Cloudinary is configured
    const hasCloudinary = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudinary) {
      throw new Error("Cloudinary configuration is missing");
    }

    // --- Cloudinary Upload ---
    const base64Data = buffer.toString("base64");
    const fileType = file.type || "image/png"; 
    const dataURI = `data:${fileType};base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(dataURI, {
        folder: process.env.CLOUDINARY_FOLDER || "kkm-web", 
        resource_type: "image",
    });
    
    console.log("Cloudinary Raw Result:", JSON.stringify(result, null, 2));
    console.log("Cloudinary Upload Success URL:", result.secure_url);
    
    if (!result.secure_url) {
        throw new Error("Cloudinary did not return a secure_url");
    }

    return result.secure_url;

  } catch (error) {
    console.error("Upload Error:", error);
    throw new Error("Upload failed");
  }
}
