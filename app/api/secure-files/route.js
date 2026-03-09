/**
 * API para servir arquivos - backward compatibility
 *
 * New uploads use Vercel Blob (URLs start with https://*.vercel-storage.com)
 * Old uploads referenced local filesystem which doesn't exist on Vercel
 * This route handles legacy references gracefully
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isBlobUrl } from '@/lib/blob-storage';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const entityType = searchParams.get('type');

    if (!filePath || !entityType) {
      return NextResponse.json(
        { error: 'Parâmetros path e type são obrigatórios' },
        { status: 400 }
      );
    }

    // If the path is actually a blob URL, redirect to it
    if (isBlobUrl(filePath) || filePath.startsWith('http')) {
      return NextResponse.redirect(filePath);
    }

    // For verification/profile files, check auth
    if (entityType === 'verification' || entityType === 'profile') {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Local filesystem is not available on Vercel (read-only)
    // Old files that were stored locally before Blob migration are gone
    // Return a transparent 1x1 pixel as placeholder for images
    const extension = filePath.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension);

    if (isImage) {
      // 1x1 transparent PNG
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
    console.error('Secure files error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
