const fetch = require('node-fetch');

async function testPageDirect() {
  try {
    console.log('=== TESTE DIRETO DA PÁGINA ===\n');
    
    // 1. Primeiro, verificar se a API está funcionando
    console.log('1. Testando API diretamente...');
    const apiUrl = 'http://localhost:1001/api/listings?city=Orlando&state=Florida&featured=true&limit=8';
    const apiResponse = await fetch(apiUrl);
    const apiData = await apiResponse.json();
    
    console.log('✅ API Status:', apiResponse.status);
    console.log('✅ Featured listings encontrados:', apiData.listings?.length || 0);
    
    if (apiData.listings && apiData.listings.length > 0) {
      console.log('✅ Primeiro listing:', {
        id: apiData.listings[0].id,
        title: apiData.listings[0].title,
        isFeatured: apiData.listings[0].isFeatured
      });
    }
    
    // 2. Verificar se a página específica existe
    console.log('\n2. Testando página específica...');
    const pageUrl = 'http://localhost:1001/united-states/florida/orlando/massagists/massage-therapy-by-sofia-cmfj5kaq10002u1cwo64k3dyk';
    const pageResponse = await fetch(pageUrl);
    
    console.log('✅ Página Status:', pageResponse.status);
    
    if (pageResponse.ok) {
      const html = await pageResponse.text();
      
      // Verificar se é uma página Next.js
      const hasNextJs = html.includes('__NEXT_DATA__');
      console.log('✅ É página Next.js:', hasNextJs);
      
      // Verificar se tem o componente de featured listings
      const hasComponent = html.includes('Body Rub Providers Similar To');
      console.log('✅ Contém componente featured:', hasComponent);
      
      // Verificar se há dados iniciais
      if (hasNextJs) {
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
        if (nextDataMatch) {
          try {
            const nextData = JSON.parse(nextDataMatch[1]);
            console.log('✅ Next.js data encontrado');
            console.log('✅ Página:', nextData.page);
          } catch (e) {
            console.log('❌ Erro ao parsear Next.js data:', e.message);
          }
        }
      }
    }
    
    // 3. Testar API específica do listing
    console.log('\n3. Testando API do listing específico...');
    const listingApiUrl = 'http://localhost:1001/api/listing/cmfj5kaq10002u1cwo64k3dyk';
    const listingResponse = await fetch(listingApiUrl);
    const listingData = await listingResponse.json();
    
    console.log('✅ Listing API Status:', listingResponse.status);
    if (listingResponse.ok) {
      console.log('✅ Listing encontrado:', {
        id: listingData.id,
        title: listingData.title,
        city: listingData.city,
        state: listingData.state
      });
    }
    
    console.log('\n=== FIM DO TESTE ===');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testPageDirect();