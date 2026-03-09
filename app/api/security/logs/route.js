import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    if (severity) {
      where.severity = severity;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get logs with pagination
    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.securityLog.count({ where })
    ]);

    // Get statistics
    const stats = await prisma.securityLog.groupBy({
      by: ['severity'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    const statistics = {
      total24h: stats.reduce((sum, stat) => sum + stat._count.id, 0),
      critical: stats.find(s => s.severity === 'critical')?._count.id || 0,
      high: stats.find(s => s.severity === 'high')?._count.id || 0,
      medium: stats.find(s => s.severity === 'medium')?._count.id || 0,
      low: stats.find(s => s.severity === 'low')?._count.id || 0
    };

    return Response.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics
    });

  } catch (error) {
    console.error('Error fetching security logs:', error);
    return Response.json({ error: 'Failed to fetch security logs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, severity, message, details, userId, ipAddress } = await request.json();

    if (!type || !severity || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const log = await prisma.securityLog.create({
      data: {
        type,
        severity,
        message,
        details: details || {},
        userId: userId || null,
        ipAddress: ipAddress || null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    return Response.json(log);

  } catch (error) {
    console.error('Error creating security log:', error);
    return Response.json({ error: 'Failed to create security log' }, { status: 500 });
  }
}