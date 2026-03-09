import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadListingFiles, deletePhysicalFile } from '@/lib/organized-upload-manager';
import { generateSecureId } from '@/lib/file-naming';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Função para gerar ID temporário para upload
function generateTempListingId() {
  return generateSecureId();
}

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('images');
    const listingId = formData.get('listingId') || generateTempListingId();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} images allowed` }, { status: 400 });
    }

    // Validar cada arquivo antes do processamento
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 });
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
      }
    }

    // Usar o sistema físico de arquivos organizado
    const uploadedFileNames = await uploadListingFiles(listingId, files);

    return NextResponse.json({
      success: true,
      listingId,
      images: uploadedFileNames, // Retorna apenas os nomes dos arquivos, não URLs
      message: `${uploadedFileNames.length} images uploaded successfully to physical storage`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload images' },
      { status: 500 }
    );
  }
}

// Delete image endpoint
export async function DELETE(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const entityType = searchParams.get('entityType') || 'listing';

    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    // Usar o sistema físico de arquivos organizado para deletar
    const deleted = await deletePhysicalFile(fileName, entityType);

    if (deleted) {
      return NextResponse.json({ 
        success: true, 
        message: 'Image deleted successfully from physical storage',
        fileName 
      });
    } else {
      return NextResponse.json({ 
        error: 'Image not found in physical storage' 
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}