const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function debugUploadIssue() {
  console.log('🔍 Investigando problema de upload de imagens...');
  
  try {
    // 1. Verificar o listing específico
    console.log('\n📋 Verificando listing cmfj5kaq10002u1cwo64k3dyk...');
    const listing = await prisma.listing.findUnique({
      where: { id: 'cmfj5kaq10002u1cwo64k3dyk' },
      select: {
        id: true,
        title: true,
        images: true,
        userId: true
      }
    });
    
    if (!listing) {
      console.log('❌ Listing não encontrado!');
      return;
    }
    
    console.log('✅ Listing encontrado:', listing.title);
    console.log('👤 User ID:', listing.userId);
    
    // 2. Analisar campo images
    console.log('\n🖼️ Analisando campo images...');
    console.log('Tipo:', typeof listing.images);
    
    if (listing.images) {
      if (typeof listing.images === 'string') {
        console.log('Conteúdo (primeiros 200 chars):', listing.images.substring(0, 200) + '...');
      } else {
        console.log('Conteúdo:', JSON.stringify(listing.images, null, 2));
      }
    } else {
      console.log('Conteúdo: null');
    }
    
    if (listing.images) {
      let images;
      try {
        if (typeof listing.images === 'string') {
          images = JSON.parse(listing.images);
          console.log('✅ JSON válido');
        } else {
          images = listing.images;
          console.log('✅ Já é um objeto');
        }
        console.log('📊 Tipo do array:', Array.isArray(images) ? 'Array' : typeof images);
        console.log('📊 Quantidade de itens:', Array.isArray(images) ? images.length : 'N/A');
        
        if (Array.isArray(images) && images.length > 0) {
          console.log('\n📸 Primeira imagem:');
          const firstImage = images[0];
          console.log('Tipo:', typeof firstImage);
          
          if (typeof firstImage === 'string') {
            if (firstImage.startsWith('data:')) {
              console.log('🔍 Formato: Base64 Data URL');
              console.log('📏 Tamanho:', firstImage.length, 'caracteres');
              console.log('🎯 Tipo MIME:', firstImage.split(';')[0].replace('data:', ''));
            } else if (firstImage.startsWith('/')) {
              console.log('🔍 Formato: Caminho de arquivo');
              console.log('📁 Caminho:', firstImage);
            } else {
              console.log('🔍 Formato: Nome de arquivo');
              console.log('📄 Nome:', firstImage);
            }
          } else {
            console.log('🔍 Formato: Objeto');
            console.log('📋 Propriedades:', Object.keys(firstImage));
          }
        }
      } catch (e) {
        console.log('❌ Erro ao fazer parse do JSON:', e.message);
      }
    }
    
    // 3. Verificar pasta de storage
    console.log('\n📁 Verificando pasta de storage...');
    const storageDir = path.join(__dirname, 'private', 'storage', 'users', 'listings');
    console.log('📂 Caminho:', storageDir);
    
    if (fs.existsSync(storageDir)) {
      const files = fs.readdirSync(storageDir);
      console.log('✅ Pasta existe');
      console.log('📊 Total de arquivos:', files.length);
      
      // Procurar arquivos do listing específico
      const listingFiles = files.filter(file => file.includes('cmfj5kaq10002u1cwo64k3dyk'));
      console.log('🎯 Arquivos do listing:', listingFiles.length);
      
      if (listingFiles.length > 0) {
        console.log('\n📋 Arquivos encontrados:');
        listingFiles.forEach((file, index) => {
          const filePath = path.join(storageDir, file);
          const stats = fs.statSync(filePath);
          console.log(`   ${index + 1}. ${file}`);
          console.log(`      📏 Tamanho: ${stats.size} bytes`);
          console.log(`      📅 Criado: ${stats.birthtime.toLocaleString()}`);
        });
      } else {
        console.log('⚠️ Nenhum arquivo físico encontrado para este listing');
      }
    } else {
      console.log('❌ Pasta de storage não existe!');
    }
    
    // 4. Verificar API de secure-files
    console.log('\n🔒 Testando API de secure-files...');
    const fetch = require('node-fetch');
    
    if (listing.images) {
      try {
        let images;
        if (typeof listing.images === 'string') {
          images = JSON.parse(listing.images);
        } else {
          images = listing.images;
        }
        
        if (Array.isArray(images) && images.length > 0) {
          const firstImage = images[0];
          
          if (typeof firstImage === 'string' && !firstImage.startsWith('data:')) {
            // Tentar acessar via API
            const apiUrl = `http://localhost:1001/api/secure-files?path=users/listings/${firstImage}&type=listing`;
            console.log('🌐 Testando URL:', apiUrl);
            
            try {
              const response = await fetch(apiUrl);
              console.log('📊 Status:', response.status);
              console.log('📏 Content-Length:', response.headers.get('content-length'));
              console.log('🎯 Content-Type:', response.headers.get('content-type'));
            } catch (fetchError) {
              console.log('❌ Erro na requisição:', fetchError.message);
            }
          }
        }
      } catch (e) {
        console.log('❌ Erro ao testar API:', e.message);
      }
    }
    
    // 5. Diagnóstico final
    console.log('\n🎯 DIAGNÓSTICO:');
    
    if (listing.images) {
      try {
        let images;
        if (typeof listing.images === 'string') {
          images = JSON.parse(listing.images);
        } else {
          images = listing.images;
        }
        
        if (Array.isArray(images) && images.length > 0) {
          const firstImage = images[0];
          
          if (typeof firstImage === 'string' && firstImage.startsWith('data:')) {
            console.log('🔍 PROBLEMA IDENTIFICADO: Imagens estão salvas como Base64 no banco de dados');
            console.log('💡 SOLUÇÃO: As imagens precisam ser convertidas para arquivos físicos');
            console.log('⚙️ AÇÃO: Implementar migração de Base64 para arquivos físicos');
          } else if (typeof firstImage === 'string') {
            console.log('🔍 FORMATO: Imagens estão como nomes de arquivo');
            console.log('💡 VERIFICAR: Se os arquivos físicos existem na pasta de storage');
          } else {
            console.log('🔍 FORMATO: Imagens estão como objetos');
            console.log('💡 VERIFICAR: Estrutura dos objetos de imagem');
          }
        } else {
          console.log('🔍 PROBLEMA: Array de imagens vazio');
        }
      } catch (e) {
        console.log('🔍 PROBLEMA: JSON inválido no campo images');
      }
    } else {
      console.log('🔍 PROBLEMA: Campo images está vazio');
    }
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUploadIssue();