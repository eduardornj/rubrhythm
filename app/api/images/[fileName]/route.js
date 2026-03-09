// app/api/images/[fileName]/route.js
// Backward compatibility - old local file references
// New uploads use Vercel Blob URLs directly

import { NextResponse } from 'next/server';
import { isBlobUrl } from '@/lib/blob-storage';

export async function GET(request, { params }) {
  try {
    const { fileName } = await params;

    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    // Security: reject path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    // If somehow a blob URL got encoded as a filename, redirect
    if (isBlobUrl(decodeURIComponent(fileName))) {
      return NextResponse.redirect(decodeURIComponent(fileName));
    }

    // Local filesystem is not available on Vercel (read-only)
    // Return transparent placeholder for old image references
    const extension = fileName.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension);

    if (isImage) {
      // 1x1 transparent PNG placeholder
      const transparentPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'base64'
      );
      return new NextResponse(transparentPng, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache',
        },
      });
    }

    return NextResponse.json(
      { error: 'File not found. Old files were migrated to cloud storage.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Image serve error:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
