const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReviews() {
  try {
    const reviews = await prisma.review.findMany({
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
    
    console.log('Total reviews:', reviews.length);
    
    reviews.forEach(review => {
      console.log(`Review ID: ${review.id}`);
      console.log(`Status: ${review.status}`);
      console.log(`Rating: ${review.rating}`);
      console.log(`Listing: ${review.listing?.title}`);
      console.log(`Reviewer: ${review.reviewer?.name}`);
      console.log('---');
    });
    
    // Check pending reviews specifically
    const pendingReviews = await prisma.review.findMany({
      where: {
        status: 'pending'
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
    
    console.log('\nPending reviews:', pendingReviews.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReviews();