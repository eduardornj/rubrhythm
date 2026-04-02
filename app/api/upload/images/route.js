import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import sharp from 'sharp';
import { uploadToBlob, deleteFromBlob, generateBlobPath } from '@/lib/blob-storage';
import { generateSecureId } from '@/lib/file-naming';
import { applyWatermark } from '@/lib/watermark';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

function getExtensionFromMime(mimeType) {
  const map = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif' };
  return map[mimeType] || 'webp';
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('images');
    const listingId = formData.get('listingId') || generateSecureId();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} images allowed` }, { status: 400 });
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 });
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
      }
    }

    const MAX_DIMENSION = 1600; // Max width or height in pixels

    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let buffer = Buffer.from(await file.arrayBuffer());

      // Always normalize: resize to max dimension (keeps aspect ratio, never enlarges)
      // and convert to JPEG for consistent format + smaller file size
      buffer = await sharp(buffer)
        .rotate() // auto-rotate based on EXIF orientation
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 88 })
        .toBuffer();

      // Apply watermark
      buffer = await applyWatermark(buffer);

      const pathname = generateBlobPath('listings', listingId, i + 1, 'jpg');
      const { url } = await uploadToBlob(buffer, pathname, { contentType: 'image/jpeg' });
      urls.push(url);
    }

    return NextResponse.json({
      success: true,
      listingId,
      images: urls,
      message: `${urls.length} images uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Blob URL is required' }, { status: 400 });
    }

    // SECURITY: Verify the image belongs to a listing owned by this user (or admin)
    if (session.user?.role !== 'admin') {
      const ownerListing = await prisma.listing.findFirst({
        where: {
          userId: session.user.id,
          OR: [
            { images: { has: url } },
            { mainImage: url }
          ]
        },
        select: { id: true }
      });
      if (!ownerListing) {
        return NextResponse.json({ error: 'Forbidden: image does not belong to your listing' }, { status: 403 });
      }
    }

    await deleteFromBlob(url);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      url,
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
