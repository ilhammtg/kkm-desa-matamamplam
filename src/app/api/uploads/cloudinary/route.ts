
import { uploadImage } from "@/server/actions/upload.actions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const url = await uploadImage(formData);
    
    return NextResponse.json({ secure_url: url });
  } catch (error) {
    console.error("[UPLOAD_POST]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
