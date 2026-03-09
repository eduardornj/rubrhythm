const fetch = require('node-fetch');

async function testFeaturedDisplay() {
  console.log('=== TESTE DOS ANÚNCIOS FEATURED ===\n');
  
  try {
    // Teste 1: Verificar API de listings featured
    console.log('1. Testando API /api/listings com featured=true...');
    const response = await fetch('http://localhost:1001/api/listings?city=Orlando&state=Florida&featured=true&limit=8&excludeId=cmfj5kaq10002u1cwo64k3dyk');
    
    if (!response.ok) {
      console.log('❌ Erro na API:', response.status, await response.text());
      return;
    }
    
    const data = await response.json();
    console.log('✅ API funcionando!');
    console.log(`📊 Total de anúncios featured encontrados: ${data.total}`);
    
    if (data.listings && data.listings.length > 0) {
      console.log('\n📋 Anúncios featured encontrados:');
      data.listings.forEach((listing, index) => {
        console.log(`   ${index + 1}. ${listing.title} (ID: ${listing.id})`);
        console.log(`      - Featured: ${listing.isFeatured}`);
        console.log(`      - Highlighted: ${listing.isHighlighted}`);
        console.log(`      - Preço: ${listing.priceRange || listing.hourlyRate || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Nenhum anúncio featured encontrado!');
    }
    
    // Teste 2: Verificar se a página principal carrega
    console.log('\n2. Testando carregamento da página principal...');
    const pageResponse = await fetch('http://localhost:1001/united-states/florida/orlando/massagists/massage-therapy-by-sofia-cmfj5kaq10002u1cwo64k3dyk');
    
    if (pageResponse.ok) {
      console.log('✅ Página carrega corretamente!');
      const pageContent = await pageResponse.text();
      
      // Verificar se contém a seção de featured
      if (pageContent.includes('Body Rub Providers Similar To')) {
        console.log('✅ Seção "Body Rub Providers Similar To" encontrada na página!');
      } else {
        console.log('❌ Seção "Body Rub Providers Similar To" NÃO encontrada na página!');
      }
      
      if (pageContent.includes('FEATURED')) {
        console.log('✅ Badge "FEATURED" encontrado na página!');
      } else {
        console.log('❌ Badge "FEATURED" NÃO encontrado na página!');
      }
    } else {
      console.log('❌ Erro ao carregar página:', pageResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testFeaturedDisplay();