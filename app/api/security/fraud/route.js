import { auth } from '@/auth';
import prisma from '@/lib/prisma';

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
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
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

    // Get fraud reports with pagination
    const [reports, total] = await Promise.all([
      prisma.fraudReport.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          reportedUser: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          listing: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.fraudReport.count({ where })
    ]);

    // Get statistics
    const stats = await Promise.all([
      prisma.fraudReport.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.fraudReport.groupBy({
        by: ['severity'],
        _count: { id: true }
      }),
      prisma.fraudReport.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    const statistics = {
      total: total,
      pending: stats[0].find(s => s.status === 'pending')?._count.id || 0,
      investigating: stats[0].find(s => s.status === 'investigating')?._count.id || 0,
      resolved: stats[0].find(s => s.status === 'resolved')?._count.id || 0,
      dismissed: stats[0].find(s => s.status === 'dismissed')?._count.id || 0,
      critical: stats[1].find(s => s.severity === 'critical')?._count.id || 0,
      high: stats[1].find(s => s.severity === 'high')?._count.id || 0,
      new24h: stats[2]
    };

    return Response.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics
    });

  } catch (error) {
    console.error('Error fetching fraud reports:', error);
    return Response.json({ error: 'Failed to fetch fraud reports' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, reportId, status, resolution, notes } = await request.json();

    if (action === 'update_status') {
      if (!reportId || !status) {
        return Response.json({ error: 'Report ID and status are required' }, { status: 400 });
      }

      const validStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];
      if (!validStatuses.includes(status)) {
        return Response.json({ error: 'Invalid status' }, { status: 400 });
      }

      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (status === 'resolved' && resolution) {
        updateData.resolution = resolution;
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = session.user.id;
      }

      if (notes) {
        updateData.adminNotes = notes;
      }

      const updatedReport = await prisma.fraudReport.update({
        where: { id: reportId },
        data: updateData,
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          reportedUser: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          listing: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      // Log the action
      await prisma.securityLog.create({
        data: {
          type: 'fraud_management',
          severity: 'medium',
          message: `Fraud report ${reportId} status updated to ${status}`,
          details: {
            reportId,
            oldStatus: 'unknown', // We could fetch the old status if needed
            newStatus: status,
            resolution: resolution || null,
            notes: notes || null,
            adminId: session.user.id
          },
          userId: session.user.id
        }
      });

      return Response.json(updatedReport);
    }

    if (action === 'create') {
      const { type, severity, description, reportedUserId, listingId, evidence } = await request.json();

      if (!type || !severity || !description) {
        return Response.json({ error: 'Type, severity, and description are required' }, { status: 400 });
      }

      const newReport = await prisma.fraudReport.create({
        data: {
          type,
          severity,
          description,
          reportedUserId: reportedUserId || null,
          listingId: listingId || null,
          reporterId: session.user.id,
          evidence: evidence || {},
          status: 'pending'
        },
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          reportedUser: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          listing: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      // Log the creation
      await prisma.securityLog.create({
        data: {
          type: 'fraud_report',
          severity: severity,
          message: `New fraud report created: ${type}`,
          details: {
            reportId: newReport.id,
            type,
            severity,
            reportedUserId: reportedUserId || null,
            listingId: listingId || null,
            adminId: session.user.id
          },
          userId: session.user.id
        }
      });

      return Response.json(newReport);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error managing fraud report:', error);
    return Response.json({ error: 'Failed to manage fraud report' }, { status: 500 });
  }
}