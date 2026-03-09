// Script para comparar Orlando vs Miami e identificar diferenças
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function compareOrlandoVsMiami() {
  try {
    console.log('🔍 Comparando Orlando vs Miami...');
    
    // 1. Verificar dados no banco para ambas as cidades
    console.log('\n📊 Verificando dados no banco...');
    
    const orlandoListings = await prisma.listing.findMany({
      where: {
        state: { contains: 'florida' },
        city: { contains: 'orlando' },
        isApproved: true,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        images: true,
        createdAt: true
      }
    });
    
    const miamiListings = await prisma.listing.findMany({
      where: {
        state: { contains: 'florida' },
        city: { contains: 'miami' },
        isApproved: true,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        images: true,
        createdAt: true
      }
    });
    
    console.log(`📋 Orlando: ${orlandoListings.length} listings`);
    console.log(`📋 Miami: ${miamiListings.length} listings`);
    
    // 2. Testar APIs para ambas as cidades
    console.log('\n🌐 Testando APIs...');
    
    // Testar Orlando
    console.log('\n🟢 Testando Orlando:');
    try {
      const orlandoResponse = await fetch('http://localhost:1001/api/listings?city=orlando&state=florida&limit=10');
      console.log(`   Status: ${orlandoResponse.status}`);
      if (orlandoResponse.ok) {
        const orlandoData = await orlandoResponse.json();
        console.log(`   Listings retornados: ${orlandoData?.listings?.length || 0}`);
      } else {
        const errorText = await orlandoResponse.text();
        console.log(`   Erro: ${errorText}`);
      }
    } catch (error) {
      console.log(`   Erro na requisição: ${error.message}`);
    }
    
    // Testar Miami
    console.log('\n🔴 Testando Miami:');
    try {
      const miamiResponse = await fetch('http://localhost:1001/api/listings?city=miami&state=florida&limit=10');
      console.log(`   Status: ${miamiResponse.status}`);
      if (miamiResponse.ok) {
        const miamiData = await miamiResponse.json();
        console.log(`   Listings retornados: ${miamiData?.listings?.length || 0}`);
      } else {
        const errorText = await miamiResponse.text();
        console.log(`   Erro: ${errorText}`);
      }
    } catch (error) {
      console.log(`   Erro na requisição: ${error.message}`);
    }
    
    // 3. Testar páginas diretamente
    console.log('\n📄 Testando páginas diretamente...');
    
    // Testar página de Orlando
    console.log('\n🟢 Página de Orlando:');
    try {
      const orlandoPageResponse = await fetch('http://localhost:1001/united-states/florida/orlando');
      console.log(`   Status: ${orlandoPageResponse.status}`);
      if (!orlandoPageResponse.ok) {
        const errorText = await orlandoPageResponse.text();
        console.log(`   Erro: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   Erro na requisição: ${error.message}`);
    }
    
    // Testar página de Miami
    console.log('\n🔴 Página de Miami:');
    try {
      const miamiPageResponse = await fetch('http://localhost:1001/united-states/florida/miami');
      console.log(`   Status: ${miamiPageResponse.status}`);
      if (!miamiPageResponse.ok) {
        const errorText = await miamiPageResponse.text();
        console.log(`   Erro: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   Erro na requisição: ${error.message}`);
    }
    
    // 4. Verificar diferenças nos dados
    console.log('\n🔍 Analisando diferenças nos dados...');
    
    if (orlandoListings.length > 0) {
      console.log('\n📋 Exemplo de listing de Orlando:');
      const orlando = orlandoListings[0];
      console.log(`   ID: ${orlando.id}`);
      console.log(`   Title: ${orlando.title}`);
      console.log(`   Slug: ${orlando.slug}`);
      console.log(`   Images: ${orlando.images}`);
      console.log(`   Created: ${orlando.createdAt}`);
    }
    
    if (miamiListings.length > 0) {
      console.log('\n📋 Exemplo de listing de Miami:');
      const miami = miamiListings[0];
      console.log(`   ID: ${miami.id}`);
      console.log(`   Title: ${miami.title}`);
      console.log(`   Slug: ${miami.slug}`);
      console.log(`   Images: ${miami.images}`);
      console.log(`   Created: ${miami.createdAt}`);
    }
    
    // 5. Testar APIs específicas
    console.log('\n🔧 Testando APIs específicas...');
    
    // Recent listings
    console.log('\n📰 Recent listings:');
    try {
      const orlandoRecent = await fetch('http://localhost:1001/api/listings/recent?city=orlando&state=florida&limit=4');
      console.log(`   Orlando recent: ${orlandoRecent.status}`);
      
      const miamiRecent = await fetch('http://localhost:1001/api/listings/recent?city=miami&state=florida&limit=4');
      console.log(`   Miami recent: ${miamiRecent.status}`);
    } catch (error) {
      console.log(`   Erro: ${error.message}`);
    }
    
    // Featured listings
    console.log('\n⭐ Featured listings:');
    try {
      const orlandoFeatured = await fetch('http://localhost:1001/api/listings?city=orlando&state=florida&featured=true&limit=8');
      console.log(`   Orlando featured: ${orlandoFeatured.status}`);
      
      const miamiFeatured = await fetch('http://localhost:1001/api/listings?city=miami&state=florida&featured=true&limit=8');
      console.log(`   Miami featured: ${miamiFeatured.status}`);
    } catch (error) {
      console.log(`   Erro: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

compareOrlandoVsMiami();