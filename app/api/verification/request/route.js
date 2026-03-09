import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { processVerificationUpload, VERIFICATION_CONFIG } from '@/lib/verification-upload';
import crypto from 'crypto';

// POST - Submit verification request
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const message = formData.get('message') || '';

    // Extrair arquivos do FormData
    const files = {
      idDocument: formData.get('idDocument'),
      selfiePhoto: formData.get('selfiePhoto'),
      businessLicense: formData.get('businessLicense'),
      proofOfAddress: formData.get('proofOfAddress'),
      additionalDocument: formData.get('additionalDocument')
    };

    // Check if user already has a pending request
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { verified: true, verificationrequest: true }
    });

    if (existingUser?.verified) {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 400 }
      );
    }

    // Check for pending verification requests
    const pendingRequest = existingUser?.verificationrequest?.find(
      req => req.status === 'pending'
    );

    if (pendingRequest) {
      return NextResponse.json(
        { error: 'Verification request already pending' },
        { status: 400 }
      );
    }

    // Processar upload usando o sistema organizado
    const uploadResult = await processVerificationUpload(session.user.id, files);

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          error: 'Erro na validação dos arquivos',
          details: uploadResult.errors
        },
        { status: 400 }
      );
    }

    const savedFiles = uploadResult.files;

    // Criar registro de verificação no banco
    const verificationRequest = await prisma.verificationrequest.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        documentPath: savedFiles.idDocument?.path || '',
        selfiePath: savedFiles.selfiePhoto?.path || '',
        status: 'pending',
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Verification request submitted successfully',
      requestId: verificationRequest.id,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error submitting verification request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get current user's verification status
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
            message: true,
            submittedAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}