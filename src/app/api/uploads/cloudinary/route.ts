import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerAuthSession } from "@/server/auth/session";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    // Auth
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const result: any = await cloudinary.uploader.upload(dataURI, {
      folder: process.env.CLOUDINARY_FOLDER || "kkm-web",
      resource_type: "image",
    });

    // ✅ log detail biar kelihatan di Vercel logs
    console.log("CLOUDINARY_RESULT:", {
      secure_url: result?.secure_url,
      url: result?.url,
      public_id: result?.public_id,
      asset_id: result?.asset_id,
      resource_type: result?.resource_type,
      type: result?.type,
      format: result?.format,
      bytes: result?.bytes,
    });

    let url: string | undefined =
      result?.secure_url ||
      (result?.url ? String(result.url).replace("http://", "https://") : undefined);

    if (!url && result?.public_id) {
      url = cloudinary.url(result.public_id, { secure: true, resource_type: "image" });
    }

    if (!url) {
      return NextResponse.json(
        { error: "Cloudinary did not return any usable URL", debug: { public_id: result?.public_id, url: result?.url, secure_url: result?.secure_url } },
        { status: 500 }
      );
    }

    return NextResponse.json({ secure_url: url });
  } catch (error: any) {
    console.error("[UPLOAD_POST_FATAL]", error?.stack || error);
    return NextResponse.json({ error: "Upload failed", detail: error?.message || String(error) }, { status: 500 });
  }
}
