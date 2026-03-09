const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixListingStats() {
  try {
    console.log('🔧 Corrigindo estatísticas dos listings...');
    
    // Buscar todos os reviews aprovados agrupados por listing
    const approvedReviews = await prisma.review.findMany({
      where: {
        status: 'approved'
      },
      select: {
        listingId: true,
        rating: true,
        listing: {
          select: {
            title: true
          }
        }
      }
    });

    console.log(`\n📊 Encontrados ${approvedReviews.length} reviews aprovados`);
    
    // Agrupar reviews por listing
    const reviewsByListing = {};
    
    approvedReviews.forEach(review => {
      if (!reviewsByListing[review.listingId]) {
        reviewsByListing[review.listingId] = {
          title: review.listing.title,
          ratings: [],
          totalRating: 0,
          count: 0
        };
      }
      reviewsByListing[review.listingId].ratings.push(review.rating);
      reviewsByListing[review.listingId].totalRating += review.rating;
      reviewsByListing[review.listingId].count++;
    });

    console.log('\n🔄 Atualizando estatísticas...');
    console.log('=' .repeat(60));

    // Atualizar cada listing
    for (const [listingId, data] of Object.entries(reviewsByListing)) {
      const averageRating = data.totalRating / data.count;
      
      console.log(`\n📋 ${data.title}`);
      console.log(`   ID: ${listingId}`);
      console.log(`   Reviews: ${data.count}`);
      console.log(`   Ratings: [${data.ratings.join(', ')}]`);
      console.log(`   Average: ${averageRating.toFixed(2)}`);
      
      const updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: {
          totalReviews: data.count,
          averageRating: averageRating
        }
      });
      
      console.log(`   ✅ Atualizado: totalReviews=${updatedListing.totalReviews}, averageRating=${updatedListing.averageRating}`);
    }

    // Verificar listings sem reviews e zerar suas estatísticas
    console.log('\n\n🧹 Limpando estatísticas de listings sem reviews...');
    
    const listingsWithoutReviews = await prisma.listing.findMany({
      where: {
        OR: [
          { totalReviews: { gt: 0 } },
          { averageRating: { gt: 0 } }
        ],
        NOT: {
          id: {
            in: Object.keys(reviewsByListing)
          }
        }
      },
      select: {
        id: true,
        title: true,
        totalReviews: true,
        averageRating: true
      }
    });

    for (const listing of listingsWithoutReviews) {
      console.log(`\n🧹 Zerando: ${listing.title}`);
      console.log(`   Antes: totalReviews=${listing.totalReviews}, averageRating=${listing.averageRating}`);
      
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          totalReviews: 0,
          averageRating: 0
        }
      });
      
      console.log(`   ✅ Zerado`);
    }

    console.log('\n\n🎉 Correção concluída!');
    console.log(`📊 Listings atualizados: ${Object.keys(reviewsByListing).length}`);
    console.log(`🧹 Listings zerados: ${listingsWithoutReviews.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir estatísticas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixListingStats().catch(console.error);