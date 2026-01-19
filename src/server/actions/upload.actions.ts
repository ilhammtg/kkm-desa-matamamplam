"use server";

import { v2 as cloudinary } from "cloudinary";
import { getServerAuthSession } from "@/server/auth/session";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { cwd } from "process";

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

    if (hasCloudinary) {
       // --- Cloudinary Upload ---
        const base64Data = buffer.toString("base64");
        const fileType = file.type || "image/png"; 
        const dataURI = `data:${fileType};base64,${base64Data}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: process.env.CLOUDINARY_FOLDER || "kkm-web", 
            resource_type: "image",
            async: false,
        });
        
        console.log("Cloudinary Upload Success:", result.secure_url);
        return result.secure_url;

    } else {
        // --- Local Filesystem Fallback ---
        // Ensure directory exists
        const uploadDir = join(cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}-${safeName}`;
        const filepath = join(uploadDir, filename);

        // Write file
        await writeFile(filepath, buffer);

        const localUrl = `/uploads/${filename}`;
        console.log("Local Upload Success:", localUrl);
        return localUrl;
    }

  } catch (error) {
    console.error("Upload Error:", error);
    throw new Error("Upload failed");
  }
}
