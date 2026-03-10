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

    // Local files no longer exist on Vercel — return 404 so UI can show placeholder
    return NextResponse.json(
      { error: 'File not found. Old files from before cloud migration are no longer available.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Secure files error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
