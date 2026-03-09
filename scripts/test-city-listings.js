// Script para encontrar cidades com listings para testar
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findCitiesWithListings() {
  try {
    console.log('🔍 Buscando cidades com listings...');
    
    // Buscar cidades com listings ativos
    const citiesWithListings = await prisma.listing.groupBy({
      by: ['state', 'city'],
      where: {
        isActive: true,
        isApproved: true,
        images: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });
    
    console.log(`📊 Encontradas ${citiesWithListings.length} cidades com listings`);
    
    for (const city of citiesWithListings) {
      const stateSlug = city.state.toLowerCase().replace(/\s+/g, '-');
      const citySlug = city.city.toLowerCase().replace(/\s+/g, '-');
      const url = `http://localhost:3000/united-states/${stateSlug}/${citySlug}`;
      
      console.log(`\n🏙️  ${city.city}, ${city.state}`);
      console.log(`📊 Quantidade de listings: ${city._count.id}`);
      console.log(`🔗 URL: ${url}`);
    }
    
    // Buscar alguns listings específicos para teste
    if (citiesWithListings.length > 0) {
      const firstCity = citiesWithListings[0];
      console.log(`\n🎯 Testando cidade: ${firstCity.city}, ${firstCity.state}`);
      
      const listings = await prisma.listing.findMany({
        where: {
          state: firstCity.state,
          city: firstCity.city,
          isActive: true,
          isApproved: true,
          images: {
            not: null
          }
        },
        select: {
          id: true,
          title: true,
          images: true
        },
        take: 3
      });
      
      console.log(`\n📋 Listings encontrados:`);
      for (const listing of listings) {
        console.log(`  - ${listing.title} (${listing.id})`);
        
        // Processar imagens
        let images = [];
        try {
          if (typeof listing.images === 'string') {
            images = JSON.parse(listing.images);
          } else if (Array.isArray(listing.images)) {
            images = listing.images;
          }
          
          const firstImage = images.length > 0 ? `/api/images/${images[0]}` : 'Sem imagem';
          console.log(`    Primeira imagem: ${firstImage}`);
        } catch (error) {
          console.log(`    Erro ao processar imagens: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findCitiesWithListings();