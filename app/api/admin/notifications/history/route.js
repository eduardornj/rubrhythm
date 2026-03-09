import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/notifications/history
 * Returns the last N notification "broadcasts" sent by admin.
 * Groups by title+body+type using the createdAt timestamp (bulk sends share the same second).
 */
export async function GET(request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);

        // Get distinct broadcasts: group by title+body+type, count recipients, get latest createdAt
        const raw = await prisma.$queryRaw`
            SELECT
                title,
                body,
                type,
                MIN(createdAt) as sentAt,
                COUNT(*) as recipientCount
            FROM notification
            GROUP BY title, body, type, DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s')
            ORDER BY sentAt DESC
            LIMIT ${limit}
        `;

        const history = raw.map(r => ({
            title: r.title,
            body: r.body,
            type: r.type,
            sentAt: r.sentAt,
            recipientCount: Number(r.recipientCount),
        }));

        return NextResponse.json({ history }, { status: 200 });
    } catch (error) {
        console.error('Admin notification history error:', error);
        return NextResponse.json({ error: 'Erro ao buscar histórico.' }, { status: 500 });
    }
}
