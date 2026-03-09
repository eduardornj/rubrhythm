const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkListing() {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: 'cmfj5kaq10002u1cwo64k3dyk' },
      select: { 
        id: true, 
        title: true, 
        images: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('Listing data:', JSON.stringify(listing, null, 2));
    
    if (listing && listing.images) {
      console.log('\nImages field type:', typeof listing.images);
      console.log('Images content:', listing.images);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkListing();