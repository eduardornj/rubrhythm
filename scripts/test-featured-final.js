const fetch = require('node-fetch');

async function testFeaturedFinal() {
  console.log('🧪 Teste final da funcionalidade de featured listings...');
  
  try {
    // Test API for featured listings
    console.log('\n1. Testando API de featured listings:');
    const featuredResponse = await fetch('http://localhost:1001/api/listings?city=orlando&state=florida&featured=true&limit=6');
    
    if (featuredResponse.ok) {
      const featuredData = await featuredResponse.json();
      console.log('✅ API de featured listings funcionando!');
      console.log('📊 Quantidade de featured listings:', featuredData.length);
      
      if (featuredData.length > 0) {
        console.log('\n📋 Featured listings encontrados:');
        featuredData.forEach((listing, index) => {
          console.log(`  ${index + 1}. ${listing.title} (ID: ${listing.id})`);
          console.log(`     - Featured: ${listing.isFeatured}`);
          console.log(`     - Slug: ${listing.slug}`);
        });
      } else {
        console.log('⚠️  Nenhum featured listing encontrado para Orlando, FL');
      }
    } else {
      console.error('❌ Erro na API de featured listings:', featuredResponse.status);
      return;
    }
    
    // Test the specific listing page
    console.log('\n2. Testando página específica:');
    const pageUrl = 'http://localhost:1001/united-states/florida/orlando/massagists/massage-therapy-by-sofia-cmfj5kaq10002u1cwo64k3dyk';
    const pageResponse = await fetch(pageUrl);
    
    if (pageResponse.ok) {
      const pageHtml = await pageResponse.text();
      console.log('✅ Página carregou com sucesso');
      
      // Check for Next.js data
      const hasNextData = pageHtml.includes('__NEXT_DATA__');
      console.log('🔍 É página Next.js:', hasNextData);
      
      if (hasNextData) {
        // Extract Next.js data
        const nextDataMatch = pageHtml.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
        if (nextDataMatch) {
          try {
            const nextData = JSON.parse(nextDataMatch[1]);
            console.log('📦 Dados Next.js extraídos com sucesso');
            
            // Check if featured listings are in the page data
            const pageProps = nextData.props?.pageProps;
            if (pageProps) {
              console.log('🔍 Props da página encontradas');
            }
          } catch (e) {
            console.log('⚠️  Erro ao parsear dados Next.js:', e.message);
          }
        }
      }
      
      // Check for featured section in HTML
      const hasFeaturedSection = pageHtml.includes('Body Rub Providers Similar To');
      console.log('🔍 Tem seção "Body Rub Providers Similar To":', hasFeaturedSection);
      
      // Check for FEATURED badge
      const hasFeaturedBadge = pageHtml.includes('FEATURED');
      console.log('🔍 Tem badge "FEATURED":', hasFeaturedBadge);
      
      // Check for featured listings grid
      const hasFeaturedGrid = pageHtml.includes('featuredListings.map');
      console.log('🔍 Tem grid de featured listings:', hasFeaturedGrid);
      
      // Check for console logs
      const hasDebugLogs = pageHtml.includes('Buscando featured listings');
      console.log('🔍 Tem logs de debug:', hasDebugLogs);
      
      // Summary
      console.log('\n📋 RESUMO:');
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        if (featuredData.length > 0 && hasFeaturedSection && hasFeaturedBadge) {
          console.log('✅ SUCESSO: Featured listings implementados corretamente!');
          console.log('   - API funcionando ✓');
          console.log('   - Seção na página ✓');
          console.log('   - Badge FEATURED ✓');
        } else {
          console.log('⚠️  PROBLEMAS DETECTADOS:');
          if (featuredData.length === 0) console.log('   - Nenhum featured listing na API');
          if (!hasFeaturedSection) console.log('   - Seção não encontrada na página');
          if (!hasFeaturedBadge) console.log('   - Badge FEATURED não encontrado');
        }
      }
      
    } else {
      console.error('❌ Erro ao carregar página:', pageResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testFeaturedFinal();