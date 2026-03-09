import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { uploadToBlob, deleteManyFromBlob, generateBlobPath } from '@/lib/blob-storage';

const limiter = rateLimit({ interval: 60_000 * 60, limit: 3 });

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { success } = limiter.check(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const existingVerification = await prisma.verificationrequest.findFirst({
      where: { userId, status: { in: ['pending', 'approved'] } }
    });

    if (existingVerification) {
      return NextResponse.json(
        { error: 'Verification already pending or approved', status: existingVerification.status },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const files = [];
    const documentTypes = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        files.push(value);
        documentTypes.push(key.replace('file_', '') || 'document');
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed` }, { status: 400 });
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.type}. Allowed: JPG, PNG, PDF`, fileName: file.name },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Max 10MB`, fileName: file.name },
          { status: 400 }
        );
      }
    }

    // Upload files to Vercel Blob
    const uploadedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop() || 'jpg';
      const buffer = Buffer.from(await file.arrayBuffer());
      const pathname = generateBlobPath('verification', userId, i + 1, ext);

      const blob = await uploadToBlob(buffer, pathname, { contentType: file.type });
      uploadedFiles.push({
        url: blob.url,
        pathname: blob.pathname,
        originalName: file.name,
        size: file.size,
        documentType: documentTypes[i] || 'document',
        sequence: i + 1
      });
    }

    const verificationRequest = await prisma.verificationrequest.create({
      data: {
        id: `verify_${userId}_${Date.now()}`,
        userId,
        documentPath: uploadedFiles[0]?.url || '',
        selfiePath: uploadedFiles[1]?.url || uploadedFiles[0]?.url || '',
        status: 'pending'
      }
    });

    await createAdminNotification({
      title: 'New Verification Request',
      message: `User ${session.user.name || userId} submitted verification documents`,
      type: 'verification_request',
      priority: 'medium',
      actionUrl: `/admin/verifications/${verificationRequest.id}`,
      userId
    });

    return NextResponse.json({
      success: true,
      message: 'Documents uploaded successfully',
      verificationId: verificationRequest.id,
      uploadedFiles: uploadedFiles.map(f => ({
        originalName: f.originalName,
        size: f.size,
        documentType: f.documentType,
        sequence: f.sequence
      })),
      totalFiles: uploadedFiles.length,
      status: 'pending',
      estimatedReviewTime: '24-48 hours'
    });
  } catch (error) {
    console.error('Verification upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verification = await prisma.verificationrequest.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!verification) {
      return NextResponse.json({
        hasVerification: false,
        status: 'not_requested',
        message: 'No verification request found'
      });
    }

    return NextResponse.json({
      hasVerification: true,
      verificationId: verification.id,
      status: verification.status,
      createdAt: verification.createdAt,
      rejectionReason: verification.rejectionReason,
      message: getStatusMessage(verification.status)
    });
  } catch (error) {
    console.error('Verification status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const verification = await prisma.verificationrequest.findFirst({
      where: { userId: session.user.id, status: 'pending' }
    });

    if (!verification) {
      return NextResponse.json({ error: 'No pending verification found' }, { status: 404 });
    }

    // Delete blobs from Vercel Blob storage
    try {
      const blobUrls = [verification.documentPath, verification.selfiePath].filter(Boolean);
      const uniqueUrls = [...new Set(blobUrls)];
      if (uniqueUrls.length > 0) {
        await deleteManyFromBlob(uniqueUrls);
      }
    } catch (blobError) {
      console.error('Error deleting blobs:', blobError);
    }

    await prisma.verificationrequest.delete({
      where: { id: verification.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Verification request cancelled successfully'
    });
  } catch (error) {
    console.error('Verification delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createAdminNotification({ title, message, type, priority, actionUrl, userId }) {
  try {
    await prisma.adminnotification.create({
      data: {
        id: `admin_notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        message,
        type,
        priority,
        targetRole: 'admin',
        actionUrl,
        createdById: userId
      }
    });
  } catch (error) {
    console.error('Admin notification error:', error);
  }
}

function getStatusMessage(status) {
  const messages = {
    pending: 'Your request is being reviewed. Allow 24-48 hours.',
    approved: 'Your account has been verified!',
    rejected: 'Your request was rejected. Check the reason and try again.',
    expired: 'Your request has expired. Please submit new documents.'
  };
  return messages[status] || 'Unknown status';
}
