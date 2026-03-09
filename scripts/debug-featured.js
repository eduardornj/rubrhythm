const fetch = require('node-fetch');

async function debugFeaturedListings() {
  try {
    console.log('=== TESTE DE DEBUG FEATURED LISTINGS ===\n');
    
    // Teste 1: Verificar API de featured listings
    console.log('1. Testando API /api/listings com filtros...');
    const apiResponse = await fetch('http://localhost:1001/api/listings?city=Orlando&state=Florida&featured=true&limit=8');
    const apiData = await apiResponse.json();
    
    console.log('Status da API:', apiResponse.status);
    console.log('Dados retornados:', JSON.stringify(apiData, null, 2));
    console.log('Número de featured listings:', apiData.listings?.length || 0);
    
    if (apiData.listings && apiData.listings.length > 0) {
      console.log('\nPrimeiro featured listing:');
      console.log('- ID:', apiData.listings[0].id);
      console.log('- Título:', apiData.listings[0].title);
      console.log('- Featured:', apiData.listings[0].isFeatured);
      console.log('- Featured End Date:', apiData.listings[0].featuredEndDate);
    }
    
    // Teste 2: Verificar página específica
    console.log('\n2. Testando página específica...');
    const pageResponse = await fetch('http://localhost:1001/united-states/florida/orlando/massagists/massage-therapy-by-sofia-cmfj5kaq10002u1cwo64k3dyk');
    const pageHtml = await pageResponse.text();
    
    console.log('Status da página:', pageResponse.status);
    
    // Verificar se contém a seção de featured
    const hasFeaturedSection = pageHtml.includes('Body Rub Providers Similar To');
    const hasFeaturedBadge = pageHtml.includes('FEATURED');
    
    console.log('Página contém seção "Body Rub Providers Similar To":', hasFeaturedSection);
    console.log('Página contém badge "FEATURED":', hasFeaturedBadge);
    
    // Verificar se há erros JavaScript na página
    const hasJsErrors = pageHtml.includes('error') || pageHtml.includes('Error');
    console.log('Página contém erros:', hasJsErrors);
    
    console.log('\n=== FIM DO DEBUG ===');
    
  } catch (error) {
    console.error('Erro durante o debug:', error);
  }
}

debugFeaturedListings();