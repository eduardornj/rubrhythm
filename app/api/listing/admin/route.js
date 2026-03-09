import { NextResponse } from "next/server";
import prisma from "@lib/prisma.js";
import { auth } from "@/auth";

async function getServerSession() {
  return await auth();
}

export async function PATCH(request) {
  const session = await getServerSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { action, listingId } = await request.json();

    if (!action || !listingId) {
      return NextResponse.json({ error: "Ação e ID do anúncio são obrigatórios" }, { status: 400 });
    }

    // Verificar se o anúncio existe
    const existingListing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!existingListing) {
      return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });
    }

    let updatedListing;
    let message;

    switch (action) {
      case "approve":
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { isApproved: true },
        });
        message = "Anúncio aprovado com sucesso";
        break;

      case "reject":
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { isApproved: false },
        });
        message = "Anúncio rejeitado com sucesso";
        break;

      case "activate":
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { isActive: true },
        });
        message = "Anúncio ativado com sucesso";
        break;

      case "deactivate":
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { isActive: false },
        });
        message = "Anúncio desativado com sucesso";
        break;

      case "feature":
        const featuredEndDate = new Date();
        featuredEndDate.setDate(featuredEndDate.getDate() + 30); // 30 dias
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { 
            isFeatured: true,
            featuredEndDate: featuredEndDate
          },
        });
        message = "Anúncio destacado com sucesso";
        break;

      case "unfeature":
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { 
            isFeatured: false,
            featuredEndDate: null
          },
        });
        message = "Destaque removido com sucesso";
        break;

      case "highlight":
        const highlightEndDate = new Date();
        highlightEndDate.setDate(highlightEndDate.getDate() + 7); // 7 dias
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { 
            isHighlighted: true,
            highlightEndDate: highlightEndDate
          },
        });
        message = "Anúncio destacado com sucesso";
        break;

      case "unhighlight":
        updatedListing = await prisma.listing.update({
          where: { id: listingId },
          data: { 
            isHighlighted: false,
            highlightEndDate: null
          },
        });
        message = "Destaque removido com sucesso";
        break;

      case "delete":
        await prisma.listing.delete({
          where: { id: listingId },
        });
        return NextResponse.json({ message: "Anúncio deletado com sucesso" });

      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    return NextResponse.json({ 
      message,
      listing: updatedListing
    });

  } catch (error) {
    console.error("Erro ao executar ação no anúncio:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}