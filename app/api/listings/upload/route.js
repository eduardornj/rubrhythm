/**
 * API de Upload para Fotos de Listings
 * 
 * Endpoint: POST /api/listings/upload
 * Implementa nomenclatura organizada: listingId_timestamp_sequencial.ext
 * Exemplo: cmfj5kaq80006u1cwrk51waqa_091425_01.jpg
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadListingFiles } from '@/lib/organized-upload-manager';
import prisma from '@/lib/prisma';

/**
 * POST /api/listings/upload
 * Upload de fotos para listings com nomenclatura organizada
 */
export async function POST(request) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Processar dados do formulário
    const formData = await request.formData();
    const listingId = formData.get('listingId');
    const files = [];

    // Validar listingId
    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o listing existe e pertence ao usuário
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        userId: true,
        title: true,
        images: true
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão (só o dono ou admin pode fazer upload)
    if (listing.userId !== userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Sem permissão para fazer upload neste listing' },
        { status: 403 }
      );
    }

    // Extrair arquivos do FormData
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value);
      }
    }

    // Validar se há arquivos
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      );
    }

    // Verificar limite de fotos por listing
    const currentImages = listing.images ? JSON.parse(listing.images) : [];
    const totalAfterUpload = currentImages.length + files.length;
    const maxPhotos = 20; // Limite máximo de fotos por listing

    if (totalAfterUpload > maxPhotos) {
      return NextResponse.json(
        {
          error: `Limite de ${maxPhotos} fotos por listing. Atualmente: ${currentImages.length}, tentando adicionar: ${files.length}`,
          currentCount: currentImages.length,
          maxAllowed: maxPhotos
        },
        { status: 400 }
      );
    }

    // Validar tipos de arquivo permitidos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Tipo de arquivo não permitido: ${file.type}. Permitidos: JPG, PNG, WEBP`,
            fileName: file.name
          },
          { status: 400 }
        );
      }

      // Validar tamanho (máximo 5MB por arquivo)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: `Arquivo muito grande: ${file.name}. Máximo 5MB por arquivo`,
            fileName: file.name,
            size: file.size
          },
          { status: 400 }
        );
      }
    }

    // Processar upload com nomenclatura organizada
    // Formato: listingId_timestamp_sequencial.ext
    const uploadResult = await uploadListingFiles(
      listingId,
      files
    );

    // Stub the result structure expected below
    const resultFiles = uploadResult.map((fileName, index) => ({
      secureFileName: fileName,
      originalName: files[index].name,
      size: files[index].size,
      sequence: currentImages.length + 1 + index,
      apiUrl: `/private/storage/listing/${listingId}/${fileName}` // Simplification
    }));

    const formattedResult = {
      success: true,
      files: resultFiles,
      totalFiles: resultFiles.length
    };

    if (!formattedResult.success) {
      return NextResponse.json(
        { error: 'Erro no upload dos arquivos', details: uploadResult },
        { status: 500 }
      );
    }

    // Atualizar campo images no listing
    const newImages = uploadResult.files.map(file => ({
      url: file.apiUrl,
      fileName: file.secureFileName,
      originalName: file.originalName,
      size: file.size,
      sequence: file.sequence,
      uploadedAt: new Date().toISOString()
    }));

    const updatedImages = [...currentImages, ...newImages];

    // Atualizar listing no banco
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        images: JSON.stringify(updatedImages),
        updatedAt: new Date()
      }
    });

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Fotos enviadas com sucesso',
      listingId,
      listingTitle: listing.title,
      uploadedFiles: formattedResult.files.map(file => ({
        fileName: file.secureFileName,
        originalName: file.originalName,
        size: file.size,
        sequence: file.sequence,
        url: file.apiUrl
      })),
      totalFiles: formattedResult.totalFiles,
      currentImageCount: updatedImages.length,
      maxAllowed: maxPhotos
    });

  } catch (error) {
    console.error('Erro no upload de fotos do listing:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/listings/upload?listingId=...
 * Lista fotos de um listing específico
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        images: true,
        userId: true,
        status: true,
        isActive: true
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissões de visualização
    const session = await auth();
    const isOwner = session?.user?.id === listing.userId;
    const isAdmin = session?.user?.role === 'admin';
    const isPublic = listing.status === 'approved' && listing.isActive;

    if (!isPublic && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar este listing' },
        { status: 403 }
      );
    }

    // Parsear imagens
    const images = listing.images ? JSON.parse(listing.images) : [];

    // Usar o sistema de arquivos organizados para listar arquivos reais
    const { listFiles } = await import('@/lib/organized-upload-manager');
    const systemFiles = await listFiles('listing', listingId);

    // Combinar dados do banco com arquivos do sistema
    const combinedImages = images.map(img => {
      const systemFile = systemFiles.find(f => f.fileName === img.fileName);
      return {
        ...img,
        exists: !!systemFile,
        actualSize: systemFile?.size,
        actualPath: systemFile?.relativePath,
        createdAt: systemFile?.createdAt
      };
    });

    return NextResponse.json({
      listingId,
      listingTitle: listing.title,
      images: combinedImages,
      totalImages: combinedImages.length,
      systemFiles: systemFiles.length,
      status: listing.status,
      isActive: listing.isActive
    });

  } catch (error) {
    console.error('Erro ao listar fotos do listing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/upload
 * Remove fotos específicas de um listing
 */
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const sequences = searchParams.get('sequences')?.split(',').map(Number) || [];

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId é obrigatório' },
        { status: 400 }
      );
    }

    if (sequences.length === 0) {
      return NextResponse.json(
        { error: 'sequences é obrigatório (ex: ?sequences=1,3,5)' },
        { status: 400 }
      );
    }

    // Verificar permissões
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true, images: true }
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing não encontrado' },
        { status: 404 }
      );
    }

    if (listing.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Sem permissão para remover fotos deste listing' },
        { status: 403 }
      );
    }

    // Remover arquivos do sistema
    const { removeFiles } = await import('@/lib/organized-upload-manager');
    const removeResult = await removeFiles('listing', listingId, sequences);

    // Atualizar campo images no banco
    const currentImages = listing.images ? JSON.parse(listing.images) : [];
    const updatedImages = currentImages.filter(img => !sequences.includes(img.sequence));

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
      removedFiles: removeResult.removed,
      remainingImages: updatedImages.length
    });

  } catch (error) {
    console.error('Erro ao remover fotos do listing:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Exemplo de uso:
 * 
 * // Upload de fotos
 * const formData = new FormData();
 * formData.append('listingId', 'cmfj5kaq80006u1cwrk51waqa');
 * formData.append('file1', photoFile1);
 * formData.append('file2', photoFile2);
 * 
 * const response = await fetch('/api/listings/upload', {
 *   method: 'POST',
 *   body: formData
 * });
 * 
 * // Resultado esperado:
 * // Arquivos salvos como: cmfj5kaq80006u1cwrk51waqa_091425_01.jpg
 * // Estrutura: /private/storage/listing/2024/01/cmfj5kaq80006u1cwrk51waqa_091425_01.jpg
 */