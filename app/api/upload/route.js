import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToBlob, generateBlobPath } from "@/lib/blob-storage";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const images = formData.getAll("images");
    const listingId = formData.get("listingId");

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided." }, { status: 400 });
    }

    const uploadId = listingId || `temp-${Date.now()}`;

    if (images.length > 5) {
      return NextResponse.json({ error: "You can upload up to 5 photos." }, { status: 400 });
    }

    for (const image of images) {
      if (!ALLOWED_MIME_TYPES.includes(image.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${image.type}. Allowed: JPEG, PNG, WebP.` },
          { status: 400 }
        );
      }
      if (image.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
      }
    }

    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (!image || !image.size) continue;

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const blobPath = generateBlobPath('listings', uploadId, i + 1, 'webp');
      const { url } = await uploadToBlob(buffer, blobPath, { contentType: image.type });
      imageUrls.push(url);
    }

    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json({ error: "Failed to upload images." }, { status: 500 });
  }
}
