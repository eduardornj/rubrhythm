import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

/**
 * POST /api/admin/notifications/send
 * Admin endpoint to send in-app notifications to users.
 *
 * Body:
 *   target: 'user' | 'all_providers' | 'all_clients' | 'all_users'
 *   userId?: string  (required when target === 'user')
 *   title: string
 *   body: string
 *   type?: 'info' | 'success' | 'warning' | 'error'  (default 'info')
 */
export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { target, userId, title, body, type = 'info' } = await request.json();

        if (!title?.trim() || !body?.trim()) {
            return NextResponse.json({ error: 'Título e mensagem são obrigatórios.' }, { status: 400 });
        }

        const validTypes = ['info', 'success', 'warning', 'error'];
        const notifType = validTypes.includes(type) ? type : 'info';

        let userIds = [];

        if (target === 'user') {
            if (!userId) return NextResponse.json({ error: 'userId é obrigatório.' }, { status: 400 });
            userIds = [userId];
        } else {
            // Fetch matching users
            const roleMap = {
                all_providers: 'provider',
                all_clients: 'user',
            };
            const where = target === 'all_users' ? {} : { role: roleMap[target] || 'user' };
            const users = await prisma.user.findMany({ where, select: { id: true } });
            userIds = users.map(u => u.id);
        }

        if (userIds.length === 0) {
            return NextResponse.json({ error: 'Nenhum usuário encontrado para o alvo selecionado.' }, { status: 404 });
        }

        // Bulk create notifications for all target users
        const created = await prisma.notification.createMany({
            data: userIds.map(uid => ({
                id: randomUUID(),
                userId: uid,
                title: title.trim(),
                body: body.trim(),
                type: notifType,
                isRead: false,
            })),
        });

        return NextResponse.json({
            success: true,
            sent: created.count,
            message: `Notificação enviada para ${created.count} usuário(s).`,
        }, { status: 201 });
    } catch (error) {
        console.error('Admin send notification error:', error);
        return NextResponse.json({ error: 'Erro interno ao enviar notificação.' }, { status: 500 });
    }
}
