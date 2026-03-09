const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugReviews() {
  try {
    console.log('🔍 Debug completo do sistema de reviews...');
    
    // 1. Verificar todos os reviews
    const allReviews = await prisma.review.findMany({
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            totalReviews: true,
            averageRating: true
          }
        },
        reviewer: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`\n📊 Total de reviews no banco: ${allReviews.length}`);
    console.log('=' .repeat(60));

    allReviews.forEach((review, index) => {
      console.log(`\n${index + 1}. Review ID: ${review.id}`);
      console.log(`   Status: ${review.status}`);
      console.log(`   Rating: ${review.rating}`);
      console.log(`   Listing: ${review.listing.title}`);
      console.log(`   Listing ID: ${review.listingId}`);
      console.log(`   Reviewer: ${review.reviewer.name}`);
      console.log(`   Created: ${review.createdAt}`);
      if (review.reviewedAt) {
        console.log(`   Reviewed: ${review.reviewedAt}`);
      }
      console.log(`   Listing Stats - Total Reviews: ${review.listing.totalReviews}, Avg Rating: ${review.listing.averageRating}`);
    });

    // 2. Verificar listings com reviews
    console.log('\n\n🏢 Verificando todos os listings...');
    const allListings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        totalReviews: true,
        averageRating: true
      }
    });

    console.log(`\n📋 Total de listings: ${allListings.length}`);
    allListings.forEach((listing, index) => {
      if (listing.totalReviews > 0) {
        console.log(`\n${index + 1}. ${listing.title}`);
        console.log(`   ID: ${listing.id}`);
        console.log(`   Total Reviews: ${listing.totalReviews}`);
        console.log(`   Average Rating: ${listing.averageRating}`);
      }
    });

    // 3. Recalcular estatísticas manualmente
    console.log('\n\n🔧 Recalculando estatísticas manualmente...');
    const reviewsByListing = {};
    
    allReviews.forEach(review => {
      if (review.status === 'approved') {
        if (!reviewsByListing[review.listingId]) {
          reviewsByListing[review.listingId] = {
            title: review.listing.title,
            reviews: [],
            totalRating: 0,
            count: 0
          };
        }
        reviewsByListing[review.listingId].reviews.push(review);
        reviewsByListing[review.listingId].totalRating += review.rating;
        reviewsByListing[review.listingId].count++;
      }
    });

    console.log('\n📊 Estatísticas calculadas:');
    for (const [listingId, data] of Object.entries(reviewsByListing)) {
      const avgRating = data.totalRating / data.count;
      console.log(`\n🏢 ${data.title}`);
      console.log(`   ID: ${listingId}`);
      console.log(`   Reviews aprovados: ${data.count}`);
      console.log(`   Rating médio calculado: ${avgRating.toFixed(2)}`);
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugReviews().catch(console.error);