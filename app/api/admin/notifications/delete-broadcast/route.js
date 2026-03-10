import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/admin/notifications/delete-broadcast
 * Deletes all notifications that match a given title + body + type (a broadcast batch).
 */
export async function DELETE(request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, body, type } = await request.json();

        if (!title || !body || !type) {
            return NextResponse.json({ error: 'title, body e type são obrigatórios.' }, { status: 400 });
        }

        const deleted = await prisma.notification.deleteMany({
            where: { title, body, type },
        });

        // Audit log
        await prisma.securitylog.create({
            data: {
                id: `sl_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
                type: "ADMIN_ACTION",
                severity: "warning",
                message: `Admin deleted broadcast: "${title}" (${deleted.count} notifications)`,
                details: {
                    action: "delete_broadcast",
                    title,
                    body: body.slice(0, 200),
                    type,
                    deletedCount: deleted.count,
                    adminId: session.user.id
                },
                userId: session.user.id,
                ipAddress: request?.headers?.get("x-forwarded-for") || "unknown",
            }
        });

        return NextResponse.json({
            success: true,
            deleted: deleted.count,
            message: `${deleted.count} notificação(ões) removida(s).`,
        });
    } catch (error) {
        console.error('Admin delete broadcast error:', error);
        return NextResponse.json({ error: 'Erro ao excluir notificações.' }, { status: 500 });
    }
}
