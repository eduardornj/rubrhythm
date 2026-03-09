import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "../../../../../auth";

export async function PUT(request, { params }) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = params;
  const { name, email, role } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  if (!name || !email) {
    return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 });
  }

  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se o email já existe em outro usuário
    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email }
      });

      if (existingUser) {
        return NextResponse.json({ error: "Este email já está em uso" }, { status: 400 });
      }
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        email: email,
        role: role || user.role
      }
    });

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        verified: updatedUser.verified,
        isBanned: updatedUser.isBanned
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Falha ao atualizar usuário" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Não permitir deletar outros admins
    if (user.role === "admin" && user.id !== session.user.id) {
      return NextResponse.json({ error: "Cannot delete other admin users" }, { status: 403 });
    }

    // Deletar o usuário (cascade irá deletar dados relacionados)
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}