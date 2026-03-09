// app/api/images/[fileName]/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const STORAGE_BASE = path.join(process.cwd(), 'private', 'storage');

// Função para buscar arquivo recursivamente
async function findFile(fileName, baseDir) {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(baseDir, entry.name);

      if (entry.isDirectory()) {
        const found = await findFile(fileName, fullPath);
        if (found) return found;
      } else if (entry.name === fileName) {
        return fullPath;
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Erro ao buscar arquivo:', error);
    }
  }
  return null;
}

export async function GET(request, { params }) {
  try {
    const { fileName } = await params;

    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    // Basic security: reject path traversal attempts
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    // Buscar arquivo na estrutura organizada
    const filePath = await findFile(fileName, STORAGE_BASE);

    if (!filePath) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Ler o arquivo
    const fileBuffer = await fs.readFile(filePath);

    // Determinar o tipo de conteúdo baseado na extensão
    const extension = fileName.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream';

    switch (extension) {
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
    }

    // Retornar o arquivo com headers apropriados
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache por 1 ano
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}