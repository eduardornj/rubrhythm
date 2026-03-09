// Script para testar o carregamento de imagens dos listings
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testImageLoading() {
  try {
    console.log('🔍 Testando carregamento de imagens dos listings...');
    
    // Buscar alguns listings com imagens
    const listings = await prisma.listing.findMany({
      where: {
        isActive: true,
        isApproved: true,
        images: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        images: true,
        state: true,
        city: true
      },
      take: 5
    });
    
    console.log(`📊 Encontrados ${listings.length} listings com imagens`);
    
    for (const listing of listings) {
      console.log(`\n📋 Listing: ${listing.title} (${listing.id})`);
      console.log(`📍 Localização: ${listing.city}, ${listing.state}`);
      console.log(`🖼️  Campo images (raw):`, listing.images);
      console.log(`🔧 Tipo do campo images:`, typeof listing.images);
      
      // Tentar processar as imagens
      let processedImages = [];
      try {
        if (typeof listing.images === 'string') {
          processedImages = JSON.parse(listing.images);
        } else if (Array.isArray(listing.images)) {
          processedImages = listing.images;
        }
        
        console.log(`✅ Imagens processadas:`, processedImages);
        console.log(`📊 Quantidade de imagens:`, processedImages.length);
        
        // Simular a função getFirstListingImage
        const validImages = processedImages
          .filter(img => typeof img === 'string' && img.trim() && img !== '[' && img !== ']')
          .map(filename => {
            if (filename.startsWith('http') || filename.startsWith('/api/')) {
              return filename;
            }
            return `/api/images/${filename}`;
          });
          
        console.log(`🔗 URLs das imagens:`, validImages);
        console.log(`🎯 Primeira imagem:`, validImages.length > 0 ? validImages[0] : 'Nenhuma imagem válida');
        
      } catch (error) {
        console.error(`❌ Erro ao processar imagens:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImageLoading();