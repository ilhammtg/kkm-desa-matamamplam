import { NextResponse } from "next/server";
import { uploadImage } from "@/server/actions/image-upload.actions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const result = await uploadImage(formData);
    

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ secure_url: result.url });
  } catch (error) {
    console.error("[UPLOAD_POST]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
