const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImagesFormat() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { city: { contains: 'Orlando' } },
          { city: { contains: 'Miami' } },
          { city: { contains: 'Cape Coral' } }
        ],
        isActive: true
      },
      select: {
        id: true,
        title: true,
        city: true,
        images: true
      },
      take: 15
    });
    
    console.log('🔍 Verificando formato das imagens por cidade:');
    
    const groupedByCity = {};
    listings.forEach(listing => {
      if (!groupedByCity[listing.city]) {
        groupedByCity[listing.city] = [];
      }
      groupedByCity[listing.city].push(listing);
    });
    
    Object.keys(groupedByCity).forEach(city => {
      console.log(`\n📍 ${city}:`);
      groupedByCity[city].forEach(listing => {
        console.log(`  - ${listing.title}`);
        console.log(`    Tipo: ${typeof listing.images}`);
        console.log(`    É Array: ${Array.isArray(listing.images)}`);
        
        if (listing.images) {
          if (typeof listing.images === 'string') {
            const preview = listing.images.length > 100 ? 
              listing.images.substring(0, 100) + '...' : 
              listing.images;
            console.log(`    Conteúdo (string): ${preview}`);
          } else if (Array.isArray(listing.images)) {
            console.log(`    Conteúdo (array): [${listing.images.length} items]`);
            console.log(`    Primeiro item: ${listing.images[0] || 'vazio'}`);
          } else {
            console.log(`    Conteúdo (object): ${JSON.stringify(listing.images).substring(0, 100)}...`);
          }
        } else {
          console.log('    Conteúdo: null');
        }
        console.log('');
      });
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImagesFormat();