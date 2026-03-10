import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

import webpush from 'web-push';

// Configure web-push with VAPID keys if available
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@rubrhythm.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, title, body, data } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // SECURITY: Only admins can send push to other users
    if (session.user.role !== 'admin' && userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: can only send notifications to yourself' }, { status: 403 });
    }

    // Get user's push subscription
    const subscription = await prisma.pushSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found for user' }, { status: 404 });
    }

    // Prepare push subscription object
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-192x192.svg',
      data: data || {}
    });

    // Send push notification
    await webpush.sendNotification(pushSubscription, payload);

    // Log notification in database
    await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title,
        body,
        type: 'push',
        isRead: false,
        data: JSON.stringify(data || {})
      }
    });

    return NextResponse.json({ message: 'Notification sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending push notification:', error);

    // Handle subscription errors (expired, invalid, etc.)
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Remove invalid subscription
      const { userId } = await request.json();
      if (userId) {
        await prisma.pushSubscription.delete({
          where: { userId }
        }).catch(() => { });
      }
    }

    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}

// Send notification to multiple users
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userIds, title, body, data } = await request.json();

    if (!userIds || !Array.isArray(userIds) || !title || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all subscriptions for the specified users
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: {
          in: userIds
        }
      }
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-192x192.svg',
      data: data || {}
    });

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        return webpush.sendNotification(pushSubscription, payload);
      })
    );

    // Log notifications in database
    await Promise.all(
      subscriptions.map(subscription =>
        prisma.notification.create({
          data: {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: subscription.userId,
            title,
            body,
            type: 'push',
            isRead: false,
            data: JSON.stringify(data || {})
          }
        })
      )
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    return NextResponse.json({
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      successful,
      failed
    }, { status: 200 });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}