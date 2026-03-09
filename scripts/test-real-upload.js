const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testRealUpload() {
  console.log('🧪 Testando upload real de imagens...');
  
  try {
    // 1. Criar uma imagem de teste simples
    console.log('\n📸 Criando imagem de teste...');
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    // Criar um arquivo de imagem simples (1x1 pixel JPEG)
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xB2, 0xC0,
      0x07, 0xFF, 0xD9
    ]);
    
    fs.writeFileSync(testImagePath, jpegHeader);
    console.log('✅ Imagem de teste criada:', testImagePath);
    
    // 2. Testar upload via API
    console.log('\n🚀 Testando upload via API /api/test-upload...');
    
    const form = new FormData();
    form.append('listingId', 'cmfj5kaq10002u1cwo64k3dyk');
    form.append('file0', fs.createReadStream(testImagePath), {
      filename: 'test-upload.jpg',
      contentType: 'image/jpeg'
    });
    
    const uploadResponse = await fetch('http://localhost:1001/api/test-upload', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    console.log('📊 Status do upload:', uploadResponse.status);
    
    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      console.log('✅ Upload bem-sucedido!');
      console.log('📁 Arquivos enviados:', uploadResult.uploadedFiles);
      
      // 3. Verificar se os arquivos foram salvos fisicamente
      console.log('\n🔍 Verificando arquivos físicos...');
      const storageDir = 'C:\\Users\\eDuArDoXP\\OneDrive\\Documents\\rubrhythm\\private\\storage\\users\\listings';
      
      if (fs.existsSync(storageDir)) {
        const files = fs.readdirSync(storageDir);
        console.log(`📂 Total de arquivos na pasta: ${files.length}`);
        
        // Procurar arquivos do listing específico
        const listingFiles = files.filter(file => file.startsWith('cmfj5kaq10002u1cwo64k3dyk'));
        console.log(`🎯 Arquivos do listing cmfj5kaq10002u1cwo64k3dyk: ${listingFiles.length}`);
        
        if (listingFiles.length > 0) {
          console.log('📋 Arquivos encontrados:');
          listingFiles.forEach((file, index) => {
            const filePath = path.join(storageDir, file);
            const stats = fs.statSync(filePath);
            console.log(`   ${index + 1}. ${file} (${stats.size} bytes)`);
          });
        }
      } else {
        console.log('❌ Pasta de storage não encontrada!');
      }
      
      // 4. Verificar banco de dados
      console.log('\n💾 Verificando banco de dados...');
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const listing = await prisma.listing.findUnique({
        where: { id: 'cmfj5kaq10002u1cwo64k3dyk' },
        select: { images: true }
      });
      
      if (listing && listing.images) {
        const images = JSON.parse(listing.images);
        console.log(`🖼️ Total de imagens no banco: ${images.length}`);
        console.log('📋 Imagens registradas:');
        images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img}`);
        });
      }
      
      await prisma.$disconnect();
      
    } else {
      const errorText = await uploadResponse.text();
      console.log('❌ Erro no upload:', errorText);
    }
    
    // Limpar arquivo de teste
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('\n🧹 Arquivo de teste removido');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testRealUpload();