const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveReviews() {
  try {
    console.log('🔍 Buscando reviews pendentes...');
    
    const pendingReviews = await prisma.review.findMany({
      where: {
        status: 'pending'
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`📋 Encontrados ${pendingReviews.length} reviews pendentes`);
    console.log('---');

    for (const review of pendingReviews) {
      console.log(`✅ Aprovando review ID: ${review.id}`);
      console.log(`📝 Listing: ${review.listing.title}`);
      console.log(`👤 Reviewer: ${review.reviewer.name}`);
      console.log(`⭐ Rating: ${review.rating}`);
      
      // Aprovar o review
      const updatedReview = await prisma.review.update({
        where: { id: review.id },
        data: {
          status: 'approved',
          reviewedAt: new Date()
        }
      });

      // Atualizar estatísticas do listing
      await updateListingStats(review.listingId);
      
      console.log(`✅ Review aprovado com sucesso!`);
      console.log('---');
    }

    console.log('🎉 Todos os reviews foram aprovados!');
    
    // Verificar reviews aprovados
    const approvedReviews = await prisma.review.findMany({
      where: {
        status: 'approved'
      },
      include: {
        listing: {
          select: {
            title: true
          }
        },
        reviewer: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`📊 Total de reviews aprovados: ${approvedReviews.length}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function updateListingStats(listingId) {
  try {
    const approvedReviews = await prisma.review.findMany({
      where: {
        listingId: listingId,
        status: 'approved'
      }
    });

    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / approvedReviews.length;

      await prisma.listing.update({
        where: { id: listingId },
        data: {
          averageRating: averageRating,
          totalReviews: approvedReviews.length
        }
      });

      console.log(`📊 Estatísticas atualizadas: ${approvedReviews.length} reviews, média ${averageRating.toFixed(1)}`);
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar estatísticas:', error);
  }
}

approveReviews().catch(console.error);