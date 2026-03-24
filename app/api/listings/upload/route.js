import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { uploadToBlob, deleteManyFromBlob, generateBlobPath } from '@/lib/blob-storage';

const MAX_PHOTOS = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function getExtension(mimeType) {
  const map = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  return map[mimeType] || 'webp';
}

/**
 * POST /api/listings/upload
 * Upload photos to Vercel Blob storage
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const formData = await request.formData();
    const listingId = formData.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'listingId é obrigatório' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true, title: true, images: true }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing não encontrado' }, { status: 404 });
    }

    if (listing.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissão para fazer upload neste listing' }, { status: 403 });
    }

    // Extract files from FormData
    const files = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo foi enviado' }, { status: 400 });
    }

    const currentImages = listing.images ? JSON.parse(listing.images) : [];
    const totalAfterUpload = currentImages.length + files.length;

    if (totalAfterUpload > MAX_PHOTOS) {
      return NextResponse.json({
        error: `Limite de ${MAX_PHOTOS} fotos por listing. Atualmente: ${currentImages.length}, tentando adicionar: ${files.length}`,
        currentCount: currentImages.length,
        maxAllowed: MAX_PHOTOS
      }, { status: 400 });
    }

    // Validate file types and sizes
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({
          error: `Tipo de arquivo não permitido: ${file.type}. Permitidos: JPG, PNG, WEBP`,
          fileName: file.name
        }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          error: `Arquivo muito grande: ${file.name}. Máximo 5MB por arquivo`,
          fileName: file.name,
          size: file.size
        }, { status: 400 });
      }
    }

    // Upload each file to Vercel Blob
    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sequence = currentImages.length + 1 + i;
      const ext = getExtension(file.type);
      const pathname = generateBlobPath('listings', listingId, sequence, ext);

      const buffer = Buffer.from(await file.arrayBuffer());
      const blob = await uploadToBlob(buffer, pathname, { contentType: file.type });

      newImages.push({
        url: blob.url,
        sequence,
        uploadedAt: new Date().toISOString()
      });
    }

    // Update listing images in DB
    const updatedImages = [...currentImages, ...newImages];

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        images: JSON.stringify(updatedImages),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Fotos enviadas com sucesso',
      listingId,
      listingTitle: listing.title,
      uploadedFiles: newImages,
      totalFiles: newImages.length,
      currentImageCount: updatedImages.length,
      maxAllowed: MAX_PHOTOS
    });

  } catch (error) {
    console.error('Erro no upload de fotos do listing:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * GET /api/listings/upload?listingId=...
 * List photos for a listing (from DB, blob URLs are always available)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'listingId é obrigatório' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, title: true, images: true, userId: true, status: true, isActive: true }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing não encontrado' }, { status: 404 });
    }

    const session = await auth();
    const isOwner = session?.user?.id === listing.userId;
    const isAdmin = session?.user?.role === 'admin';
    const isPublic = listing.status === 'approved' && listing.isActive;

    if (!isPublic && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Sem permissão para visualizar este listing' }, { status: 403 });
    }

    const images = listing.images ? JSON.parse(listing.images) : [];

    return NextResponse.json({
      listingId,
      listingTitle: listing.title,
      images,
      totalImages: images.length,
      status: listing.status,
      isActive: listing.isActive
    });

  } catch (error) {
    console.error('Erro ao listar fotos do listing:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/listings/upload?listingId=...&sequences=1,3,5
 * Remove specific photos from a listing
 */
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const sequences = searchParams.get('sequences')?.split(',').map(Number) || [];

    if (!listingId) {
      return NextResponse.json({ error: 'listingId é obrigatório' }, { status: 400 });
    }

    if (sequences.length === 0) {
      return NextResponse.json({ error: 'sequences é obrigatório (ex: ?sequences=1,3,5)' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true, images: true }
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing não encontrado' }, { status: 404 });
    }

    if (listing.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissão para remover fotos deste listing' }, { status: 403 });
    }

    const currentImages = listing.images ? JSON.parse(listing.images) : [];
    const imagesToRemove = currentImages.filter(img => sequences.includes(img.sequence));
    const updatedImages = currentImages.filter(img => !sequences.includes(img.sequence));

    // Delete blobs by URL
    const urlsToDelete = imagesToRemove.map(img => img.url).filter(Boolean);
    if (urlsToDelete.length > 0) {
      await deleteManyFromBlob(urlsToDelete);
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        images: JSON.stringify(updatedImages),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Fotos removidas com sucesso',
      removedSequences: sequences,
      removedCount: imagesToRemove.length,
      remainingImages: updatedImages.length
    });

  } catch (error) {
    console.error('Erro ao remover fotos do listing:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
