import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // Verificar se o usuário está autenticado e é admin
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem alterar senhas.' },
        { status: 403 }
      );
    }

    const { userId, newPassword } = await request.json();

    // Validar dados
    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'ID do usuário e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Criptografar a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar a senha no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      message: `Senha do usuário ${user.name || user.email} alterada com sucesso`
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}