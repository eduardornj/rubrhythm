// Script para testar o carregamento de imagens na seção Recent Posts
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function testRecentPosts() {
  try {
    console.log('🔍 Testando carregamento de imagens na seção Recent Posts...');
    
    // 1. Testar a API /api/listings/recent diretamente
    console.log('\n📡 Testando API /api/listings/recent...');
    const apiResponse = await fetch('http://localhost:3000/api/listings/recent?city=orlando&state=florida&limit=4');
    
    if (!apiResponse.ok) {
      console.log(`❌ Status da API: ${apiResponse.status}`);
      const errorText = await apiResponse.text();
      console.log('Erro:', errorText);
      return;
    }
    
    const recentListings = await apiResponse.json();
    console.log(`✅ Status da API: ${apiResponse.status}`);
    console.log(`📊 Recent listings encontrados: ${recentListings.length}`);
    
    // 2. Analisar cada listing
    console.log('\n🖼️ Analisando imagens dos recent listings...');
    recentListings.forEach((listing, index) => {
      console.log(`\n${index + 1}. ${listing.title}`);
      console.log(`   ID: ${listing.id}`);
      console.log(`   Tempo: ${listing.timeAgo}`);
      console.log(`   Imagens (tipo): ${typeof listing.images}`);
      console.log(`   Imagens (conteúdo):`, listing.images);
      
      if (listing.images && Array.isArray(listing.images)) {
        console.log(`   Quantidade de imagens: ${listing.images.length}`);
        
        if (listing.images.length > 0) {
          const firstImage = listing.images[0];
          console.log(`   Primeira imagem: ${firstImage}`);
          console.log(`   Tipo da primeira imagem: ${typeof firstImage}`);
          
          // Verificar se é base64 ou URL
          if (typeof firstImage === 'string') {
            if (firstImage.startsWith('data:image')) {
              console.log(`   ⚠️  PROBLEMA: Imagem em formato Base64 (${firstImage.length} chars)`);
            } else if (firstImage.startsWith('http')) {
              console.log(`   ✅ Imagem é URL HTTP: ${firstImage}`);
            } else {
              console.log(`   ✅ Imagem é filename: ${firstImage}`);
              console.log(`   🔗 URL da API: /api/images/${firstImage}`);
            }
          }
        }
      } else {
        console.log(`   ❌ Imagens não são array ou estão vazias`);
      }
    });
    
    // 3. Testar acesso às imagens via API
    console.log('\n🌐 Testando acesso às imagens via API...');
    for (const listing of recentListings) {
      if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        const firstImage = listing.images[0];
        
        if (typeof firstImage === 'string' && !firstImage.startsWith('data:') && !firstImage.startsWith('http')) {
          const imageUrl = `http://localhost:3000/api/images/${firstImage}`;
          console.log(`\n🔍 Testando: ${imageUrl}`);
          
          try {
            const imageResponse = await fetch(imageUrl);
            console.log(`   Status: ${imageResponse.status}`);
            console.log(`   Content-Type: ${imageResponse.headers.get('content-type')}`);
            console.log(`   Content-Length: ${imageResponse.headers.get('content-length')}`);
            
            if (imageResponse.status === 200) {
              console.log(`   ✅ Imagem acessível`);
            } else {
              console.log(`   ❌ Erro ao acessar imagem`);
            }
          } catch (error) {
            console.log(`   ❌ Erro na requisição: ${error.message}`);
          }
        }
      }
    }
    
    // 4. Verificar dados diretamente no banco
    console.log('\n🗄️ Verificando dados diretamente no banco...');
    const dbListings = await prisma.listing.findMany({
      where: {
        state: {
          contains: 'florida'
        },
        city: {
          contains: 'orlando'
        },
        isApproved: true,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        images: true,
        createdAt: true
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Listings no banco: ${dbListings.length}`);
    dbListings.forEach((listing, index) => {
      console.log(`\n${index + 1}. ${listing.title} (${listing.id})`);
      console.log(`   Imagens (raw):`, listing.images);
      console.log(`   Tipo: ${typeof listing.images}`);
      
      if (listing.images) {
        try {
          const parsed = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
          console.log(`   Imagens parseadas:`, parsed);
          console.log(`   Quantidade: ${Array.isArray(parsed) ? parsed.length : 'Não é array'}`);
        } catch (error) {
          console.log(`   ❌ Erro ao parsear: ${error.message}`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRecentPosts();