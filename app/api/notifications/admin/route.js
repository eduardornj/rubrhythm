import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const filter = searchParams.get('filter') || 'all';
    const skip = (page - 1) * limit;

    // Build where clause based on filter
    let whereClause = {};
    
    if (filter === 'unread') {
      whereClause.read = false;
    } else if (filter === 'read') {
      whereClause.read = true;
    } else if (['success', 'warning', 'error', 'info'].includes(filter)) {
      whereClause.type = filter;
    }

    // Get notifications with pagination
    const [notifications, totalCount] = await Promise.all([
      prisma.adminNotification.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.adminNotification.count({
        where: whereClause
      })
    ]);

    // Get summary statistics
    const stats = await prisma.adminNotification.groupBy({
      by: ['type', 'read'],
      _count: true
    });

    const summary = {
      total: totalCount,
      unread: stats.filter(s => !s.read).reduce((acc, s) => acc + s._count, 0),
      byType: {
        success: stats.filter(s => s.type === 'success').reduce((acc, s) => acc + s._count, 0),
        warning: stats.filter(s => s.type === 'warning').reduce((acc, s) => acc + s._count, 0),
        error: stats.filter(s => s.type === 'error').reduce((acc, s) => acc + s._count, 0),
        info: stats.filter(s => s.type === 'info').reduce((acc, s) => acc + s._count, 0)
      }
    };

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      summary
    });
  } catch (error) {
    console.error('Admin notifications GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create':
        return await createNotification(body, session.user.id);
      case 'mark_read':
        return await markNotificationsAsRead(body.notificationIds);
      case 'delete':
        return await deleteNotifications(body.notificationIds);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin notifications POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function createNotification(data, createdById) {
  const { title, message, type, priority, targetRole, actionUrl } = data;

  // Validate required fields
  if (!title || !message) {
    return NextResponse.json(
      { error: 'Title and message are required' },
      { status: 400 }
    );
  }

  // Validate type
  if (!['success', 'warning', 'error', 'info'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid notification type' },
      { status: 400 }
    );
  }

  // Validate priority
  if (!['low', 'medium', 'high'].includes(priority)) {
    return NextResponse.json(
      { error: 'Invalid priority level' },
      { status: 400 }
    );
  }

  // Validate target role
  if (!['all', 'admin', 'user', 'premium'].includes(targetRole)) {
    return NextResponse.json(
      { error: 'Invalid target role' },
      { status: 400 }
    );
  }

  try {
    const notification = await prisma.adminNotification.create({
      data: {
        title,
        message,
        type,
        priority,
        targetRole,
        actionUrl: actionUrl || null,
        createdById,
        read: false
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // If targeting specific users, create user notifications
    if (targetRole !== 'all') {
      let userWhereClause = {};
      
      if (targetRole === 'admin') {
        userWhereClause.role = 'admin';
      } else if (targetRole === 'premium') {
        userWhereClause.role = 'premium';
      } else if (targetRole === 'user') {
        userWhereClause.role = 'user';
      }

      const targetUsers = await prisma.user.findMany({
        where: userWhereClause,
        select: { id: true }
      });

      // Create individual user notifications
      const userNotifications = targetUsers.map(user => ({
        userId: user.id,
        title,
        message,
        type,
        priority,
        actionUrl: actionUrl || null,
        read: false
      }));

      if (userNotifications.length > 0) {
        await prisma.userNotification.createMany({
          data: userNotifications
        });
      }
    } else {
      // For 'all' users, we'll create notifications on-demand when users log in
      // This is more efficient than creating thousands of records
    }

    return NextResponse.json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

async function markNotificationsAsRead(notificationIds) {
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return NextResponse.json(
      { error: 'Invalid notification IDs' },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.adminNotification.updateMany({
      where: {
        id: {
          in: notificationIds
        }
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      message: `${result.count} notifications marked as read`,
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

async function deleteNotifications(notificationIds) {
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return NextResponse.json(
      { error: 'Invalid notification IDs' },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.adminNotification.deleteMany({
      where: {
        id: {
          in: notificationIds
        }
      }
    });

    return NextResponse.json({
      message: `${result.count} notifications deleted`,
      deletedCount: result.count
    });
  } catch (error) {
    console.error('Delete notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}