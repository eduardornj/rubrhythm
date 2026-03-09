const fetch = require('node-fetch');

async function testFeaturedPage() {
  console.log('🧪 Testando página com featured listings...');
  
  try {
    // Test API for featured listings
    console.log('\n1. Testando API de featured listings:');
    const featuredResponse = await fetch('http://localhost:1001/api/listings?city=orlando&state=florida&featured=true&limit=6');
    
    if (featuredResponse.ok) {
      const featuredData = await featuredResponse.json();
      console.log('✅ API retornou:', featuredData.length, 'featured listings');
      
      if (featuredData.length > 0) {
        console.log('📋 Primeiro featured listing:');
        console.log('  - ID:', featuredData[0].id);
        console.log('  - Title:', featuredData[0].title);
        console.log('  - Slug:', featuredData[0].slug);
        console.log('  - Featured:', featuredData[0].isFeatured);
      }
    } else {
      console.error('❌ Erro na API:', featuredResponse.status);
    }
    
    // Test the specific page
    console.log('\n2. Testando página específica:');
    const pageUrl = 'http://localhost:1001/united-states/florida/orlando/massagists/massage-therapy-by-sofia-cmfj5kaq10002u1cwo64k3dyk';
    const pageResponse = await fetch(pageUrl);
    
    if (pageResponse.ok) {
      const pageHtml = await pageResponse.text();
      console.log('✅ Página carregou com status:', pageResponse.status);
      
      // Check for Next.js data
      const hasNextData = pageHtml.includes('__NEXT_DATA__');
      console.log('🔍 É página Next.js:', hasNextData);
      
      // Check for featured section
      const hasFeaturedSection = pageHtml.includes('Body Rub Providers Similar To');
      console.log('🔍 Tem seção "Body Rub Providers Similar To":', hasFeaturedSection);
      
      // Check for FEATURED badge
      const hasFeaturedBadge = pageHtml.includes('FEATURED');
      console.log('🔍 Tem badge "FEATURED":', hasFeaturedBadge);
      
      // Check for console logs in the page
      const hasDebugLogs = pageHtml.includes('Buscando featured listings');
      console.log('🔍 Tem logs de debug:', hasDebugLogs);
      
    } else {
      console.error('❌ Erro ao carregar página:', pageResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testFeaturedPage();