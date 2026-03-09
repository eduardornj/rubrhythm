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
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    // Get suspicious IPs with pagination
    const [ips, total] = await Promise.all([
      prisma.suspiciousIP.findMany({
        where,
        orderBy: {
          lastSeen: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.suspiciousIP.count({ where })
    ]);

    // Get statistics
    const stats = await prisma.suspiciousIP.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const statistics = {
      total: total,
      blocked: stats.find(s => s.status === 'blocked')?._count.id || 0,
      monitoring: stats.find(s => s.status === 'monitoring')?._count.id || 0,
      whitelisted: stats.find(s => s.status === 'whitelisted')?._count.id || 0
    };

    return Response.json({
      ips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics
    });

  } catch (error) {
    console.error('Error fetching suspicious IPs:', error);
    return Response.json({ error: 'Failed to fetch suspicious IPs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, ipId, ipAddress, reason, riskLevel } = await request.json();

    if (action === 'block' || action === 'unblock' || action === 'whitelist') {
      if (!ipId) {
        return Response.json({ error: 'IP ID is required' }, { status: 400 });
      }

      const newStatus = action === 'block' ? 'blocked' : 
                       action === 'unblock' ? 'monitoring' : 'whitelisted';

      const updatedIP = await prisma.suspiciousIP.update({
        where: { id: ipId },
        data: {
          status: newStatus,
          updatedAt: new Date()
        }
      });

      // Log the action
      await prisma.securityLog.create({
        data: {
          type: 'ip_management',
          severity: 'medium',
          message: `IP ${updatedIP.ipAddress} ${action}ed by admin`,
          details: {
            ipAddress: updatedIP.ipAddress,
            action,
            reason: reason || 'No reason provided',
            adminId: session.user.id
          },
          userId: session.user.id,
          ipAddress: updatedIP.ipAddress
        }
      });

      return Response.json(updatedIP);
    }

    if (action === 'add') {
      if (!ipAddress) {
        return Response.json({ error: 'IP address is required' }, { status: 400 });
      }

      // Check if IP already exists
      const existingIP = await prisma.suspiciousIP.findUnique({
        where: { ipAddress }
      });

      if (existingIP) {
        return Response.json({ error: 'IP address already exists' }, { status: 400 });
      }

      const newIP = await prisma.suspiciousIP.create({
        data: {
          ipAddress,
          riskLevel: riskLevel || 'medium',
          status: 'monitoring',
          reason: reason || 'Manually added by admin',
          firstSeen: new Date(),
          lastSeen: new Date(),
          requestCount: 0
        }
      });

      // Log the action
      await prisma.securityLog.create({
        data: {
          type: 'ip_management',
          severity: 'low',
          message: `New suspicious IP ${ipAddress} added by admin`,
          details: {
            ipAddress,
            riskLevel: riskLevel || 'medium',
            reason: reason || 'Manually added by admin',
            adminId: session.user.id
          },
          userId: session.user.id,
          ipAddress
        }
      });

      return Response.json(newIP);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error managing suspicious IP:', error);
    return Response.json({ error: 'Failed to manage suspicious IP' }, { status: 500 });
  }
}