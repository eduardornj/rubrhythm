const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkListingStats() {
  try {
    console.log('📊 Verificando estatísticas dos listings com reviews...');
    
    const listingsWithReviews = await prisma.listing.findMany({
      where: {
        totalReviews: {
          gt: 0
        }
      },
      select: {
        id: true,
        title: true,
        totalReviews: true,
        averageRating: true,
        reviews: {
          where: {
            status: 'approved'
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            reviewer: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log(`\n🎯 Encontrados ${listingsWithReviews.length} listings com reviews`);
    console.log('=' .repeat(60));

    for (const listing of listingsWithReviews) {
      console.log(`\n📋 Listing: ${listing.title}`);
      console.log(`🆔 ID: ${listing.id}`);
      console.log(`📊 Total Reviews: ${listing.totalReviews}`);
      console.log(`⭐ Average Rating: ${listing.averageRating}`);
      console.log(`\n📝 Reviews aprovados:`);
      
      listing.reviews.forEach((review, index) => {
        console.log(`   ${index + 1}. Rating: ${review.rating}/5`);
        console.log(`      Reviewer: ${review.reviewer.name}`);
        if (review.comment) {
          console.log(`      Comment: ${review.comment}`);
        }
        console.log(`      ID: ${review.id}`);
        console.log('');
      });
      
      console.log('-'.repeat(40));
    }

    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar estatísticas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkListingStats().catch(console.error);