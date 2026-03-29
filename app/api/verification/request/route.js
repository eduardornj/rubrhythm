import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { uploadToBlob, generateBlobPath } from '@/lib/blob-storage';
import { logActivity } from '@/lib/activity';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file, fieldName) {
  if (!file || !(file instanceof File)) {
    return `${fieldName} is required`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${fieldName}: file type not allowed (${file.type}). Allowed: JPEG, PNG, WebP, PDF`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${fieldName}: file too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB`;
  }
  return null;
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { verified: true, verificationrequest: true }
    });

    if (existingUser?.verified) {
      return NextResponse.json({ error: 'User is already verified' }, { status: 400 });
    }

    const pendingRequest = existingUser?.verificationrequest?.find(r => r.status === 'pending');
    if (pendingRequest) {
      return NextResponse.json({ error: 'Verification request already pending' }, { status: 400 });
    }

    const formData = await request.formData();
    const idDocument = formData.get('idDocument');
    const selfiePhoto = formData.get('selfiePhoto');

    // Validate required files
    const idError = validateFile(idDocument, 'idDocument');
    if (idError) {
      return NextResponse.json({ error: idError }, { status: 400 });
    }

    const selfieError = validateFile(selfiePhoto, 'selfiePhoto');
    if (selfieError) {
      return NextResponse.json({ error: selfieError }, { status: 400 });
    }

    // Upload ID document to Vercel Blob
    const idExt = idDocument.name.split('.').pop() || 'jpg';
    const idBuffer = Buffer.from(await idDocument.arrayBuffer());
    const idBlob = await uploadToBlob(
      idBuffer,
      generateBlobPath('verification', userId, 1, idExt),
      { contentType: idDocument.type }
    );

    // Upload selfie to Vercel Blob
    const selfieExt = selfiePhoto.name.split('.').pop() || 'jpg';
    const selfieBuffer = Buffer.from(await selfiePhoto.arrayBuffer());
    const selfieBlob = await uploadToBlob(
      selfieBuffer,
      generateBlobPath('verification', userId, 2, selfieExt),
      { contentType: selfiePhoto.type }
    );

    const verificationRequest = await prisma.verificationrequest.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        documentPath: idBlob.url,
        selfiePath: selfieBlob.url,
        status: 'pending',
        createdAt: new Date()
      }
    });

    logActivity(userId, 'verification_submit', {
      target: verificationRequest.id,
      request,
    });

    return NextResponse.json({
      message: 'Verification request submitted successfully',
      requestId: verificationRequest.id,
      status: 'pending'
    });
  } catch (error) {
    console.error('Verification request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        verified: true,
        verificationrequest: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Verification status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
