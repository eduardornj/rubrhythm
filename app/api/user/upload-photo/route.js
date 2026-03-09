import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { STORAGE_PATHS, generateSecureFilename, ensureDirectoryExists } from "@/lib/storage-config";

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

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (photo.size > maxSize) {
      return NextResponse.json({ error: "File must be less than 5 MB" }, { status: 400 });
    }

    if (!["image/jpeg", "image/png"].includes(photo.type)) {
      return NextResponse.json({ error: "Only JPEG or PNG files are allowed" }, { status: 400 });
    }

    // Verifica se o usuário já tem uma foto e exclui a antiga
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (user.image) {
      const oldFilePath = path.join(process.cwd(), "public", user.image);
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn("Não foi possível excluir a foto antiga:", err);
      }
    }

    // Usar estrutura de pastas privadas
    const uploadDir = STORAGE_PATHS.profiles.base;
    await ensureDirectoryExists(uploadDir);
    
    const fileName = generateSecureFilename(`profile-${userId}.jpg`, 'profile');

    // Processa e redimensiona a imagem para 200x200
    const buffer = Buffer.from(await photo.arrayBuffer());
    const compressedPhoto = await sharp(buffer)
      .resize({ width: 200, height: 200, fit: "cover" })
      .jpeg({ quality: 70 })
      .toBuffer();
    await fs.writeFile(path.join(uploadDir, fileName), compressedPhoto);

    // Atualiza o campo `image` no modelo User com URL segura
    const secureUrl = `/api/secure-files?path=users/profiles/${fileName}&type=profiles`;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: secureUrl },
    });

    return NextResponse.json({ message: "Photo uploaded successfully", image: updatedUser.image });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json({ error: "Error uploading photo" }, { status: 500 });
  }
}