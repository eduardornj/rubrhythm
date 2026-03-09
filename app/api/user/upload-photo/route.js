import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import { uploadToBlob, deleteFromBlob, isBlobUrl, generateBlobPath } from "@/lib/blob-storage";

export async function POST(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const photo = formData.get("photo");
    const userId = formData.get("userId");

    if (!photo || !userId) {
      return NextResponse.json({ error: "Photo and userId are required" }, { status: 400 });
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be less than 5 MB" }, { status: 400 });
    }

    if (!["image/jpeg", "image/png"].includes(photo.type)) {
      return NextResponse.json({ error: "Only JPEG or PNG files are allowed" }, { status: 400 });
    }

    // Delete old profile photo from Blob if exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (user?.image && isBlobUrl(user.image)) {
      await deleteFromBlob(user.image);
    }

    // Process and resize image to 200x200
    const buffer = Buffer.from(await photo.arrayBuffer());
    const compressedPhoto = await sharp(buffer)
      .resize({ width: 200, height: 200, fit: "cover" })
      .jpeg({ quality: 70 })
      .toBuffer();

    const blobPath = generateBlobPath("profiles", userId, 1, "jpg");

    const { url } = await uploadToBlob(compressedPhoto, blobPath, {
      contentType: "image/jpeg",
    });

    // Update user.image with the Blob CDN URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: url },
    });

    return NextResponse.json({ message: "Photo uploaded successfully", image: updatedUser.image });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json({ error: "Error uploading photo" }, { status: 500 });
  }
}
