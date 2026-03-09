const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSimilar() {
  try {
    console.log('🔍 Verificando listing atual...');
    
    const listing = await prisma.listing.findUnique({
      where: { id: 'cmfj5kaq80006u1cwrk51waqa' },
      select: {
        id: true,
        title: true,
        city: true,
        state: true,
        status: true,
        isActive: true
      }
    });
    
    console.log('Listing atual:', listing);
    
    console.log('\n🔍 Verificando todos os status disponíveis...');
    
    const allStatuses = await prisma.listing.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('Status disponíveis:');
    allStatuses.forEach(s => {
      console.log(`- ${s.status}: ${s._count.status} listings`);
    });
    
    console.log('\n🔍 Buscando listings em Orlando com qualquer status...');
    
    const orlandoListings = await prisma.listing.findMany({
      where: {
        city: {
          contains: 'orlando'
        },
        state: {
          contains: 'florida'
        },
        isActive: true
      },
      select: {
        id: true,
        title: true,
        city: true,
        state: true,
        status: true,
        images: true
      },
      take: 10
    });
    
    console.log(`Listings em Orlando (qualquer status): ${orlandoListings.length}`);
    
    orlandoListings.forEach((l, i) => {
      console.log(`${i+1}. ${l.title} (${l.city}, ${l.state}) - Status: ${l.status}`);
      console.log(`   ID: ${l.id}`);
      console.log(`   Imagens: ${l.images ? 'SIM' : 'NÃO'}`);
    });
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugSimilar();