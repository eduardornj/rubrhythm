import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import prisma from "@lib/prisma.js";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function GET(request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await prisma.verificationRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return NextResponse.json({ error: "Falha ao buscar solicitações" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const idFile = formData.get("idFile");
    const selfieFile = formData.get("selfieFile");
    const userId = session.user.id;

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Validações
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (!idFile || !selfieFile) {
      return NextResponse.json({ error: "Both ID and selfie are required." }, { status: 400 });
    }
    if (idFile.size > maxSize || selfieFile.size > maxSize) {
      return NextResponse.json({ error: "Files must be less than 5 MB." }, { status: 400 });
    }
    if (!["image/jpeg", "image/png"].includes(idFile.type) || !["image/jpeg", "image/png"].includes(selfieFile.type)) {
      return NextResponse.json({ error: "Only JPEG or PNG files are allowed." }, { status: 400 });
    }

    // Gera nomes únicos para os arquivos
    const idFileName = `id-${userId}-${Date.now()}.jpg`;
    const selfieFileName = `selfie-${userId}-${Date.now()}.jpg`;
    const uploadDir = path.join(process.cwd(), "private", "storage", "verification-docs");

    // Cria o diretório se não existir
    await fs.mkdir(uploadDir, { recursive: true });

    // Comprime e salva o ID
    const idBuffer = Buffer.from(await idFile.arrayBuffer());
    const compressedId = await sharp(idBuffer).jpeg({ quality: 70 }).toBuffer();
    await fs.writeFile(path.join(uploadDir, idFileName), compressedId);

    // Comprime e salva a selfie
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer());
    const compressedSelfie = await sharp(selfieBuffer).jpeg({ quality: 70 }).toBuffer();
    await fs.writeFile(path.join(uploadDir, selfieFileName), compressedSelfie);

    // Cria o registro no banco
    await prisma.verificationRequest.create({
      data: {
        userId: userId,
        documentPath: `private/storage/verification-docs/${idFileName}`,
        selfiePath: `private/storage/verification-docs/${selfieFileName}`,
        status: "pending",
      },
    });

    return NextResponse.json({ message: "Verification submitted successfully!" });
  } catch (error) {
    console.error("Error submitting verification:", error);
    return NextResponse.json({ error: "Error submitting verification." }, { status: 500 });
  }
}