const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMiamiListings() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        city: 'Miami',
        state: 'Florida'
      },
      select: {
        id: true,
        title: true,
        images: true
      }
    });
    
    console.log('Miami listings found:', listings.length);
    listings.forEach(l => {
      console.log('ID:', l.id);
      console.log('Title:', l.title);
      console.log('Images:', l.images);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMiamiListings();