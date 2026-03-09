import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import fs from "fs/promises";
import path from "path";
import { STORAGE_PATHS, generateSecureFilename, ensureDirectoryExists } from "@/lib/storage-config";
import { auth } from "@/auth";

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

    // listingId é opcional para novos anúncios
    const uploadId = listingId || `temp-${Date.now()}`;

    const maxImages = 5;
    if (images.length > maxImages) {
      return NextResponse.json({ error: `You can upload up to ${maxImages} photos.` }, { status: 400 });
    }

    // Validate MIME type and file size
    for (const image of images) {
      if (!ALLOWED_MIME_TYPES.includes(image.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${image.type}. Allowed: JPEG, PNG, WebP.` },
          { status: 400 }
        );
      }
      if (image.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }
    }

    // Usar estrutura de pastas privadas
    const uploadDir = STORAGE_PATHS.listings.base;
    await ensureDirectoryExists(uploadDir);

    // Count existing files to determine the next index
    const existingFiles = await fs.readdir(uploadDir);
    const imageUrls = [];
    const index = existingFiles.filter(file => file.startsWith(`listing-${uploadId}-`)).length + 1;

    // Process only the first image (since frontend sends one at a time)
    const fileName = generateSecureFilename(`listing-${uploadId}-${index}.jpg`, 'listing');
    const filePath = path.join(uploadDir, fileName);

    const image = images[0];
    if (!image || !image.size) {
      return NextResponse.json({ error: "No valid image uploaded." }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retornar URL segura para acesso via API
    imageUrls.push(`/api/secure-files?path=users/listings/${fileName}&type=listings`);

    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json({ error: "Failed to upload images." }, { status: 500 });
  }
}
