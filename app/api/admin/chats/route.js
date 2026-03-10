import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

function generateSecurityLogId() {
  return `sl_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

function getClientIp(request) {
  return request?.headers?.get("x-forwarded-for") || "unknown";
}

async function deleteMessage(messageId, adminId, ipAddress) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: true },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  await prisma.message.delete({ where: { id: messageId } });

  await prisma.securitylog.create({
    data: {
      id: generateSecurityLogId(),
      type: "ADMIN_ACTION",
      severity: "warning",
      message: `Admin deleted message ${messageId}`,
      details: {
        action: "delete_message",
        messageId,
        conversationId: message.conversationId,
        contentPreview: message.content?.substring(0, 100) || "",
        adminId,
      },
      userId: adminId,
      ipAddress,
    },
  });

  return NextResponse.json({ success: true, message: "Message deleted successfully" });
}

async function deleteConversation(conversationId, adminId, ipAddress) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { _count: { select: { message: true } } },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  await prisma.conversation.delete({ where: { id: conversationId } });

  await prisma.securitylog.create({
    data: {
      id: generateSecurityLogId(),
      type: "ADMIN_ACTION",
      severity: "warning",
      message: `Admin deleted conversation ${conversationId}`,
      details: {
        action: "delete_conversation",
        conversationId,
        clientId: conversation.clientId,
        providerId: conversation.providerId,
        messageCount: conversation._count.message,
        adminId,
      },
      userId: adminId,
      ipAddress,
    },
  });

  return NextResponse.json({ success: true, message: "Conversation deleted successfully" });
}

export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, messageId, conversationId } = await request.json();
    const ipAddress = getClientIp(request);
    const adminId = session.user.id;

    if (action === "delete_message") {
      if (!messageId) {
        return NextResponse.json({ error: "messageId is required" }, { status: 400 });
      }
      return await deleteMessage(messageId, adminId, ipAddress);
    }

    if (action === "delete_conversation") {
      if (!conversationId) {
        return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
      }
      return await deleteConversation(conversationId, adminId, ipAddress);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin chat moderation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
