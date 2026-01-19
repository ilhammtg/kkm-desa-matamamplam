
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerAuthSession } from "@/server/auth/session";

export const runtime = "nodejs";

// Validate Env Vars
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    // 1. Check Env Vars explicitly
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.error("Critical: Cloudinary Env Vars missing");
      return NextResponse.json({ 
        error: "Server misconfiguration: Cloudinary environment variables are missing.",
        debug: { 
          hasCloudName: !!CLOUD_NAME, 
          hasApiKey: !!API_KEY, 
          hasSecret: !!API_SECRET 
        } 
      }, { status: 500 });
    }

    // 2. Auth Check
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Parse File
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const fileType = file.type || "image/png";
    const dataURI = `data:${fileType};base64,${base64Data}`;

    // 4. Upload to Cloudinary
    // Using a promise wrapper to catch everything properly
    const result: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(dataURI, {
            folder: process.env.CLOUDINARY_FOLDER || "kkm-web",
            resource_type: "image",
        }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });

    // 5. Verify Result
    console.log("CLOUDINARY_RESULT:", JSON.stringify(result, null, 2));

    let url: string | undefined =
      result?.secure_url ||
      (result?.url ? String(result.url).replace("http://", "https://") : undefined);

    if (!url && result?.public_id) {
      url = cloudinary.url(result.public_id, { secure: true, resource_type: "image" });
    }

    if (!url) {
      // Return a 500 but with the explicit debug info in the body so the client sees it
      return NextResponse.json(
        { 
          error: "Cloudinary did not return a usable URL (Check Vercel Logs)", 
          debug: { 
             public_id: result?.public_id,
             full_result: result 
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ secure_url: url });

  } catch (error: any) {
    console.error("[UPLOAD_POST_FATAL]", error);
    return NextResponse.json({ 
        error: error?.message || "Upload failed due to server error",
        detail: String(error)
    }, { status: 500 });
  }
}
