/**
 * API de Upload para Verificação de Usuários
 * 
 * Endpoint: POST /api/verification/upload
 * Implementa nomenclatura organizada: userId_01.jpg, userId_02.jpg, etc.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadVerificationFiles } from '@/lib/organized-upload-manager';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60_000 * 60, limit: 3 }); // 3 per hour

/**
 * POST /api/verification/upload
 * Upload de documentos de verificação com nomenclatura organizada
 */
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { success } = limiter.check(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Verificar se usuário já tem verificação pendente ou aprovada
    const existingVerification = await prisma.verificationrequest.findFirst({
      where: {
        userId,
        status: { in: ['pending', 'approved'] }
      }
    });

    if (existingVerification) {
      return NextResponse.json(
        {
          error: 'Usuário já possui verificação pendente ou aprovada',
          status: existingVerification.status
        },
        { status: 400 }
      );
    }

    // Processar dados do formulário
    const formData = await request.formData();
    const files = [];
    const documentTypes = [];

    // Extrair arquivos do FormData
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        files.push(value);

        // Extrair tipo de documento do nome do campo
        const docType = key.replace('file_', '') || 'document';
        documentTypes.push(docType);
      }
    }

    // Validar se há arquivos
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      );
    }

    // Validar quantidade máxima de arquivos (máximo 5 para verificação)
    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Máximo de 5 arquivos permitidos para verificação' },
        { status: 400 }
      );
    }

    // Validar tipos de arquivo permitidos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Tipo de arquivo não permitido: ${file.type}. Permitidos: JPG, PNG, PDF`,
            fileName: file.name
          },
          { status: 400 }
        );
      }

      // Validar tamanho (máximo 10MB por arquivo)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: `Arquivo muito grande: ${file.name}. Máximo 10MB por arquivo`,
            fileName: file.name,
            size: file.size
          },
          { status: 400 }
        );
      }
    }

    // Processar upload com nomenclatura organizada (formato: userId_01.jpg)
    const uploadResult = await uploadVerificationFiles(
      userId,
      files
    );
    // Format mock result structure
    const formattedResult = {
      success: true,
      files: uploadResult.map((fileName, index) => ({
        fileName,
        originalName: files[index].name,
        size: files[index].size,
        documentType: documentTypes[index] || 'document',
        sequence: index + 1,
        relativePath: `/private/storage/verify/${userId}/${fileName}`
      })),
      totalFiles: uploadResult.length
    };

    if (!formattedResult.success) {
      return NextResponse.json(
        { error: 'Erro no upload dos arquivos', details: uploadResult },
        { status: 500 }
      );
    }

    // Criar registro de verificação no banco com nomenclatura organizada
    const verificationRequest = await prisma.verificationrequest.create({
      data: {
        id: `verify_${userId}_${Date.now()}`,
        userId,
        documentPath: formattedResult.files[0]?.relativePath || '',
        selfiePath: formattedResult.files[1]?.relativePath || formattedResult.files[0]?.relativePath || '',
        status: 'pending'
      }
    });

    // Criar notificação para admins
    await createAdminNotification({
      title: 'Nova Solicitação de Verificação',
      message: `Usuário ${session.user.name || userId} enviou documentos para verificação`,
      type: 'verification_request',
      priority: 'medium',
      actionUrl: `/admin/verifications/${verificationRequest.id}`,
      userId
    });

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Documentos enviados com sucesso',
      verificationId: verificationRequest.id,
      uploadedFiles: formattedResult.files.map(file => ({
        fileName: file.fileName,
        originalName: file.originalName,
        size: file.size,
        documentType: file.documentType,
        sequence: file.sequence
      })),
      totalFiles: formattedResult.totalFiles,
      status: 'pending',
      estimatedReviewTime: '24-48 horas'
    });

  } catch (error) {
    console.error('Erro no upload de verificação:', error);
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
 * GET /api/verification/upload
 * Retorna status da verificação do usuário atual
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Buscar verificação mais recente
    const verification = await prisma.verificationrequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!verification) {
      return NextResponse.json({
        hasVerification: false,
        status: 'not_requested',
        message: 'Nenhuma solicitação de verificação encontrada'
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
    console.error('Erro ao buscar status de verificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/verification/upload
 * Cancela solicitação de verificação pendente
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

    const userId = session.user.id;

    // Buscar verificação pendente
    const verification = await prisma.verificationrequest.findFirst({
      where: {
        userId,
        status: 'pending'
      }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Nenhuma verificação pendente encontrada' },
        { status: 404 }
      );
    }

    // Remover arquivos do sistema
    try {
      const { removeFiles } = await import('@/lib/organized-upload-manager');
      await removeFiles('verification', userId);
    } catch (fileError) {
      console.error('Erro ao remover arquivos:', fileError);
      // Continuar mesmo se não conseguir remover arquivos
    }

    // Remover registro do banco
    await prisma.verificationrequest.delete({
      where: { id: verification.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitação de verificação cancelada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao cancelar verificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções auxiliares

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
    console.error('Erro ao criar notificação admin:', error);
    // Não falhar o upload por causa da notificação
  }
}

function getStatusMessage(status) {
  const messages = {
    pending: 'Sua solicitação está sendo analisada. Aguarde 24-48 horas.',
    approved: 'Sua conta foi verificada com sucesso!',
    rejected: 'Sua solicitação foi rejeitada. Verifique o motivo e tente novamente.',
    expired: 'Sua solicitação expirou. Envie novos documentos.'
  };

  return messages[status] || 'Status desconhecido';
}

/**
 * Exemplo de uso do endpoint:
 * 
 * // Upload de verificação
 * const formData = new FormData();
 * formData.append('file_document', documentFile);
 * formData.append('file_selfie', selfieFile);
 * 
 * const response = await fetch('/api/verification/upload', {
 *   method: 'POST',
 *   body: formData
 * });
 * 
 * // Resultado esperado:
 * // Arquivos salvos como: userId_01.jpg, userId_02.jpg
 * // Estrutura: /private/storage/verification/2024/01/userId_01.jpg
 */