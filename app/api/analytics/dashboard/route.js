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
    const timeRange = searchParams.get('timeRange') || '30d';
    
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
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Calculate previous period for growth comparison
    const periodDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(startDate.getDate() - periodDays);
    const previousEndDate = new Date(startDate);

    // Overview Analytics
    const [currentRevenue, previousRevenue] = await Promise.all([
      prisma.credittransaction.aggregate({
        where: {
          createdAt: { gte: startDate, lte: now },
          type: 'purchase'
        },
        _sum: { amount: true }
      }),
      prisma.credittransaction.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate },
          type: 'purchase'
        },
        _sum: { amount: true }
      })
    ]);

    const [currentUsers, previousUsers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: startDate, lte: now }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate }
        }
      })
    ]);

    const [currentListings, previousListings] = await Promise.all([
      prisma.listing.count({
        where: {
          createdAt: { gte: startDate, lte: now }
        }
      }),
      prisma.listing.count({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate }
        }
      })
    ]);

    // Calculate growth percentages
    const currentAmt = parseFloat(currentRevenue._sum.amount || 0);
    const previousAmt = parseFloat(previousRevenue._sum.amount || 0);
    const revenueGrowth = previousAmt ? (currentAmt - previousAmt) / previousAmt * 100 : 0;
    const userGrowth = previousUsers ? 
      (currentUsers - previousUsers) / previousUsers * 100 : 0;
    const listingGrowth = previousListings ? 
      (currentListings - previousListings) / previousListings * 100 : 0;

    // Active users (users seen during the period)
    const activeUsers = await prisma.user.count({
      where: {
        lastSeen: { gte: startDate, lte: now }
      }
    });

    // Conversion rate (users who made credit purchases / total users)
    const usersWithPurchases = await prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: now },
        credittransaction: {
          some: {
            type: 'purchase'
          }
        }
      }
    });
    const conversionRate = currentUsers ? (usersWithPurchases / currentUsers) * 100 : 0;
    const conversionGrowth = 5.2; // Mock data for now

    // Revenue breakdown
    const creditsSold = await prisma.credittransaction.aggregate({
      where: {
        createdAt: { gte: startDate, lte: now },
        type: 'purchase'
      },
      _sum: { amount: true }
    });

    const featuredListings = await prisma.listing.count({
      where: {
        createdAt: { gte: startDate, lte: now },
        isFeatured: true
      }
    }) * 50; // Assuming $50 per featured listing

    const premiumServices = 2500; // Mock data

    const revenueBreakdown = [
      {
        category: 'Credit Sales',
        amount: parseFloat(creditsSold._sum.amount || 0),
        percentage: 60
      },
      {
        category: 'Featured Listings',
        amount: featuredListings,
        percentage: 25
      },
      {
        category: 'Premium Services',
        amount: premiumServices,
        percentage: 15
      }
    ];

    // User analytics
    const newUsers = currentUsers;
    const verifiedUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: now },
        verified: true
      }
    });
    const premiumUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: now },
        role: 'premium'
      }
    });
    const retentionRate = 78.5; // Mock data

    // Location demographics (from listings, not users — users don't have state field)
    const locationStats = await prisma.listing.groupBy({
      by: ['state'],
      where: {
        createdAt: { gte: startDate, lte: now },
        isApproved: true,
      },
      _count: true,
      orderBy: {
        _count: {
          state: 'desc'
        }
      },
      take: 5
    });

    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      where: {
        createdAt: { gte: startDate, lte: now }
      },
      _count: true
    });

    // Listing analytics
    const approvedListings = await prisma.listing.count({
      where: {
        createdAt: { gte: startDate, lte: now },
        isApproved: true
      }
    });

    const featuredListingsCount = await prisma.listing.count({
      where: {
        createdAt: { gte: startDate, lte: now },
        isFeatured: true
      }
    });

    const avgViews = 245; // Mock data - would need view tracking

    // Top service locations (closest equivalent to categories)
    const topCategories = await prisma.listing.groupBy({
      by: ['serviceLocation'],
      where: {
        createdAt: { gte: startDate, lte: now },
        isApproved: true,
      },
      _count: true,
      orderBy: {
        _count: {
          serviceLocation: 'desc'
        }
      },
      take: 5
    });

    const topCategoriesWithViews = topCategories.map(cat => ({
      name: cat.serviceLocation,
      count: cat._count,
      views: cat._count * 150
    }));

    // Performance metrics (mock data)
    const performance = {
      pageLoadTime: 1250,
      bounceRate: 32.4,
      sessionDuration: 8.5,
      serverHealth: {
        cpu: 45,
        memory: 62,
        disk: 78
      },
      database: {
        queryTime: 85,
        connections: 25,
        cacheHitRate: 94
      }
    };

    const analytics = {
      overview: {
        totalRevenue: currentAmt,
        revenueGrowth,
        activeUsers,
        userGrowth,
        totalListings: currentListings,
        listingGrowth,
        conversionRate,
        conversionGrowth
      },
      revenue: {
        creditsSold: parseFloat(creditsSold._sum.amount || 0),
        featuredListings,
        premiumServices,
        breakdown: revenueBreakdown
      },
      users: {
        newUsers,
        verifiedUsers,
        premiumUsers,
        retentionRate,
        demographics: {
          locations: locationStats.map(stat => ({
            state: stat.state,
            count: stat._count
          })),
          roles: roleStats.map(stat => ({
            role: stat.role,
            count: stat._count
          }))
        }
      },
      listings: {
        newListings: currentListings,
        approvedListings,
        featuredListings: featuredListingsCount,
        avgViews,
        topCategories: topCategoriesWithViews
      },
      performance
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}