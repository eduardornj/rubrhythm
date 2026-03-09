const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImages() {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        id: 'cmfj5kaqh000cu1cw9t8ubpvb'
      },
      select: {
        id: true,
        title: true,
        images: true
      }
    });
    
    console.log('Listing found:', listing);
    
    if (listing && listing.images) {
      console.log('Images type:', typeof listing.images);
      console.log('Images content:', listing.images);
      
      // Try to parse if it's a string
      if (typeof listing.images === 'string') {
        try {
          const parsed = JSON.parse(listing.images);
          console.log('Parsed images:', parsed);
        } catch (e) {
          console.log('Failed to parse images as JSON:', e.message);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();