const fetch = require('node-fetch');

async function testFeaturedSimple() {
  console.log('🧪 Teste simples da funcionalidade de featured listings...');
  
  try {
    // Test API for featured listings
    console.log('\n1. Testando API de featured listings:');
    const featuredResponse = await fetch('http://localhost:1001/api/listings?city=orlando&state=florida&featured=true&limit=6');
    
    if (featuredResponse.ok) {
      const featuredData = await featuredResponse.json();
      console.log('✅ API de featured listings funcionando!');
      console.log('📊 Resposta da API:', JSON.stringify(featuredData, null, 2));
      
      const listings = featuredData.listings || featuredData;
      console.log('📊 Quantidade de featured listings:', listings.length);
      
      if (listings.length > 0) {
        console.log('\n📋 Featured listings encontrados:');
        listings.forEach((listing, index) => {
          console.log(`  ${index + 1}. ${listing.title} (ID: ${listing.id})`);
          console.log(`     - Featured: ${listing.isFeatured}`);
          console.log(`     - Slug: ${listing.slug}`);
        });
        
        console.log('\n✅ SUCESSO: Featured listings estão sendo retornados pela API!');
      } else {
        console.log('⚠️  Nenhum featured listing encontrado para Orlando, FL');
      }
    } else {
      console.error('❌ Erro na API de featured listings:', featuredResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testFeaturedSimple();