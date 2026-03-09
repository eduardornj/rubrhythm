import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@lib/prisma.js";

export async function POST(request) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { requestId, action, rejectionReason } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Buscar a solicitação de verificação
    const verificationRequest = await prisma.verificationrequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!verificationRequest) {
      return NextResponse.json({ error: "Verification request not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Aprovar verificação
      await prisma.$transaction([
        // Atualizar status da solicitação
        prisma.verificationrequest.update({
          where: { id: requestId },
          data: {
            status: "approved",
            reviewedAt: new Date(),
            reviewedBy: session.user.id
          }
        }),
        // Marcar usuário como verificado
        prisma.user.update({
          where: { id: verificationRequest.userId },
          data: { verified: true }
        })
      ]);

      return NextResponse.json({ message: "Verification approved successfully" });
    } else if (action === "reject") {
      // Rejeitar verificação
      await prisma.verificationrequest.update({
        where: { id: requestId },
        data: {
          status: "rejected",
          rejectionReason: rejectionReason || "No reason provided",
          reviewedAt: new Date(),
          reviewedBy: session.user.id
        }
      });

      return NextResponse.json({ message: "Verification rejected successfully" });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing verification:", error);
    return NextResponse.json({ error: "Failed to process verification" }, { status: 500 });
  }
}