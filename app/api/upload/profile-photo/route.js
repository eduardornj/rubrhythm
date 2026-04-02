import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";
import { uploadToBlob, deleteFromBlob, isBlobUrl, generateBlobPath } from "@/lib/blob-storage";

export async function POST(request) {
  const session = await auth();

  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("profilePhoto");
    const userId = formData.get("userId");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG and WebP are allowed." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Delete old profile photo from Blob if exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (user?.image && isBlobUrl(user.image)) {
      await deleteFromBlob(user.image);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split(".").pop();
    const blobPath = generateBlobPath("avatars", userId, 1, fileExtension);

    const { url } = await uploadToBlob(buffer, blobPath, {
      contentType: file.type,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { image: url },
    });

    return NextResponse.json({
      message: "Profile photo uploaded successfully",
      avatarUrl: url,
    }, { status: 200 });

  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return NextResponse.json({ error: "Failed to upload profile photo" }, { status: 500 });
  }
}
