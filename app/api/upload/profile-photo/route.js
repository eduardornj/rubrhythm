import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";
import { STORAGE_PATHS, generateSecureFilename, ensureDirectoryExists } from "@/lib/storage-config";

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

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG and WebP are allowed." }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Usar estrutura de pastas privadas para avatars
    const uploadsDir = STORAGE_PATHS.profiles.avatars;
    await ensureDirectoryExists(uploadsDir);

    // Generate secure filename
    const fileExtension = file.name.split(".").pop();
    const fileName = generateSecureFilename(`${userId}-${Date.now()}.${fileExtension}`, 'avatar');
    const filePath = join(uploadsDir, fileName);

    // Write file
    await writeFile(filePath, buffer);

    // Update user profile in database with secure URL
    const avatarUrl = `/api/secure-files?path=users/profiles/avatars/${fileName}&type=profiles`;
    await prisma.user.update({
      where: { id: userId },
      data: { image: avatarUrl }
    });

    return NextResponse.json({ 
      message: "Profile photo uploaded successfully",
      avatarUrl 
    }, { status: 200 });

  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return NextResponse.json({ error: "Failed to upload profile photo" }, { status: 500 });
  }
}