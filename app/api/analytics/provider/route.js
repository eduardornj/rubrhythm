import { NextResponse } from 'next/server';
import { auth } from '@/auth';

import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get user's listings
    const userListings = await prisma.listing.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    });

    const listingIds = userListings.map(listing => listing.id);

    if (listingIds.length === 0) {
      return NextResponse.json({
        totalViews: 0,
        totalFavorites: 0,
        totalMessages: 0,
        averageRating: 0,
        totalReviews: 0,
        viewsChange: 0,
        favoritesChange: 0,
        messagesChange: 0,
        viewsOverTime: [],
        trafficSources: [],
        responseRate: 0,
        avgResponseTime: 'N/A',
        conversionRate: 0,
        profileScore: 0,
        recommendations: []
      });
    }

    // Get analytics data
    const [currentPeriodStats, previousPeriodStats] = await Promise.all([
      getStatsForPeriod(listingIds, startDate, now),
      getStatsForPeriod(listingIds, getPreviousPeriodStart(startDate, timeRange), startDate)
    ]);

    // Calculate changes
    const viewsChange = calculatePercentageChange(currentPeriodStats.views, previousPeriodStats.views);
    const favoritesChange = calculatePercentageChange(currentPeriodStats.favorites, previousPeriodStats.favorites);
    const messagesChange = calculatePercentageChange(currentPeriodStats.messages, previousPeriodStats.messages);

    // Get views over time
    const viewsOverTime = await getViewsOverTime(listingIds, startDate, now, timeRange);

    // Traffic sources based on real engagement breakdown
    const totalEngagement = currentPeriodStats.favorites + currentPeriodStats.messages + currentPeriodStats.totalReviews;
    const trafficSources = totalEngagement > 0 ? [
      { name: 'Favorites', value: currentPeriodStats.favorites },
      { name: 'Messages', value: currentPeriodStats.messages },
      { name: 'Reviews', value: currentPeriodStats.totalReviews },
    ].filter(s => s.value > 0) : [{ name: 'No data yet', value: 1 }];

    // Calculate performance metrics
    const responseRate = await calculateResponseRate(session.user.id);
    const conversionRate = currentPeriodStats.views > 0 ? 
      ((currentPeriodStats.messages / currentPeriodStats.views) * 100).toFixed(1) : 0;
    const profileScore = await calculateProfileScore(session.user.id);

    // Generate recommendations
    const recommendations = generateRecommendations({
      views: currentPeriodStats.views,
      messages: currentPeriodStats.messages,
      favorites: currentPeriodStats.favorites,
      profileScore,
      responseRate
    });

    return NextResponse.json({
      totalViews: currentPeriodStats.views,
      totalFavorites: currentPeriodStats.favorites,
      totalMessages: currentPeriodStats.messages,
      averageRating: currentPeriodStats.averageRating,
      totalReviews: currentPeriodStats.totalReviews,
      viewsChange,
      favoritesChange,
      messagesChange,
      viewsOverTime,
      trafficSources,
      responseRate,
      avgResponseTime: responseRate > 0 ? 'Active' : 'No replies yet',
      conversionRate: parseFloat(conversionRate),
      profileScore,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching provider analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

// Helper functions
async function getStatsForPeriod(listingIds, startDate, endDate) {
  const [favorites, messages, reviews] = await Promise.all([
    prisma.favorite.count({
      where: {
        listingId: { in: listingIds },
        createdAt: { gte: startDate, lte: endDate }
      }
    }),
    prisma.conversation.count({
      where: {
        providerId: { in: listingIds }, // Assuming providerId maps to listing
        createdAt: { gte: startDate, lte: endDate }
      }
    }),
    prisma.review.findMany({
      where: {
        listingId: { in: listingIds },
        createdAt: { gte: startDate, lte: endDate }
      },
      select: { rating: true }
    })
  ]);

  const averageRating = reviews.length > 0 ? 
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  // Use favorites + messages + reviews as engagement proxy (no page view tracking table exists)
  const estimatedViews = (favorites * 8) + (messages * 5) + (reviews.length * 3);

  return {
    views: estimatedViews,
    favorites,
    messages,
    averageRating,
    totalReviews: reviews.length
  };
}

function getPreviousPeriodStart(startDate, timeRange) {
  const previousStart = new Date(startDate);
  
  switch (timeRange) {
    case '7d':
      previousStart.setDate(previousStart.getDate() - 7);
      break;
    case '30d':
      previousStart.setDate(previousStart.getDate() - 30);
      break;
    case '90d':
      previousStart.setDate(previousStart.getDate() - 90);
      break;
  }
  
  return previousStart;
}

function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

async function getViewsOverTime(listingIds, startDate, endDate, timeRange) {
  // Get daily favorites as engagement proxy (closest real data we have)
  const favorites = await prisma.favorite.findMany({
    where: {
      listingId: { in: listingIds },
      createdAt: { gte: startDate, lte: endDate }
    },
    select: { createdAt: true }
  });

  const messages = await prisma.conversation.findMany({
    where: {
      providerId: { in: listingIds },
      createdAt: { gte: startDate, lte: endDate }
    },
    select: { createdAt: true }
  });

  // Group by day
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const data = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayStr = date.toISOString().split('T')[0];

    const dayFavs = favorites.filter(f => f.createdAt.toISOString().split('T')[0] === dayStr).length;
    const dayMsgs = messages.filter(m => m.createdAt.toISOString().split('T')[0] === dayStr).length;

    data.push({
      date: dayStr,
      views: (dayFavs * 8) + (dayMsgs * 5)
    });
  }

  return data;
}

async function calculateResponseRate(userId) {
  // Real calculation: conversations where provider has at least 1 reply
  const listings = await prisma.listing.findMany({
    where: { userId },
    select: { id: true }
  });
  const listingIds = listings.map(l => l.id);
  if (listingIds.length === 0) return 0;

  const totalConversations = await prisma.conversation.count({
    where: { providerId: { in: listingIds } }
  });

  if (totalConversations === 0) return 0;

  // Count conversations where the provider sent at least 1 message
  const respondedConversations = await prisma.conversation.count({
    where: {
      providerId: { in: listingIds },
      messages: { some: { senderId: userId } }
    }
  });

  return totalConversations > 0 ? Math.round((respondedConversations / totalConversations) * 100) : 0;
}

async function calculateProfileScore(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      listings: {
        select: {
          title: true,
          description: true,
          photos: true,
          services: true,
          rates: true
        }
      }
    }
  });

  if (!user || user.listings.length === 0) return 0;

  let score = 0;
  const listing = user.listings[0]; // Use first listing for scoring

  // Profile photo (20 points)
  if (user.image) score += 20;

  // Listing title (15 points)
  if (listing.title && listing.title.length > 10) score += 15;

  // Description (25 points)
  if (listing.description && listing.description.length > 100) score += 25;

  // Photos (20 points)
  if (listing.photos && listing.photos.length >= 3) score += 20;

  // Services (10 points)
  if (listing.services && listing.services.length > 0) score += 10;

  // Rates (10 points)
  if (listing.rates) score += 10;

  return Math.min(score, 100);
}

function generateRecommendations(stats) {
  const recommendations = [];

  if (stats.views < 50) {
    recommendations.push({
      title: 'Increase Visibility',
      description: 'Consider featuring your listing or using bump-up to increase views.'
    });
  }

  if (stats.profileScore < 80) {
    recommendations.push({
      title: 'Complete Your Profile',
      description: 'Add more photos and detailed descriptions to improve your profile score.'
    });
  }

  if (stats.responseRate < 80) {
    recommendations.push({
      title: 'Improve Response Time',
      description: 'Respond to messages faster to increase your response rate and attract more clients.'
    });
  }

  if (stats.favorites < 10) {
    recommendations.push({
      title: 'Engage with Community',
      description: 'Encourage satisfied clients to favorite your listing and leave reviews.'
    });
  }

  return recommendations;
}