import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  console.log("Testing Cloudinary Upload...");
  try {
    const result = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
      folder: "test_upload",
    });
    console.log("Upload Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Upload Error:", error);
  }
}

testUpload();
