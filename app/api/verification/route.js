import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Buscar dados de verificação do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        verified: true,
        createdAt: true,
        verificationrequest: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            rejectionReason: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const latestVerification = user.verificationrequest[0];

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified || false,
        verificationStatus: latestVerification?.status || 'not_submitted',
        createdAt: user.createdAt
      },
      formData: null,
      verificationRequest: latestVerification || null
    });

  } catch (error) {
    console.error('Verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, formData, documents } = body;

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Verificar se já existe uma solicitação pendente
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId: userId,
        status: 'pending'
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending verification request' },
        { status: 400 }
      );
    }

    // Criar nova solicitação de verificação
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId: userId,
        documentPath: documents?.idDocument || '',
        selfiePath: documents?.selfiePhoto || '',
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      verificationStatus: 'pending',
      requestId: verificationRequest.id
    });

  } catch (error) {
    console.error('Verification submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit verification data' },
      { status: 500 }
    );
  }
}