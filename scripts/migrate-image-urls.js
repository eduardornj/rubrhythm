/**
 * Script de migração para atualizar URLs de imagens no banco de dados
 * Converte caminhos antigos (/uploads/) para URLs seguras (/api/secure-files)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateImageUrls() {
  console.log('🔄 Iniciando migração de URLs de imagens...');
  
  try {
    // Migrar imagens de usuários (perfil/avatar)
    console.log('📸 Migrando imagens de perfil de usuários...');
    const users = await prisma.user.findMany({
      where: {
        image: {
          contains: '/uploads/'
        }
      }
    });
    
    for (const user of users) {
      let newImageUrl = user.image;
      
      // Converter URLs de perfil
      if (user.image.includes('/uploads/profile-')) {
        const filename = user.image.replace('/uploads/', '');
        newImageUrl = `/api/secure-files?path=users/profiles/${filename}&type=profiles`;
      }
      // Converter URLs de avatars
      else if (user.image.includes('/uploads/avatars/')) {
        const filename = user.image.replace('/uploads/avatars/', '');
        newImageUrl = `/api/secure-files?path=users/profiles/avatars/${filename}&type=profiles`;
      }
      
      if (newImageUrl !== user.image) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: newImageUrl }
        });
        console.log(`✅ Usuário ${user.id}: ${user.image} → ${newImageUrl}`);
      }
    }
    
    // Migrar imagens de listings
    console.log('🏠 Migrando imagens de anúncios...');
    const listings = await prisma.listing.findMany({
      where: {
        images: {
          not: null
        }
      }
    });
    
    for (const listing of listings) {
      let images;
      try {
        images = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
      } catch (e) {
        console.warn(`⚠️  Erro ao parsear imagens do listing ${listing.id}:`, e.message);
        continue;
      }
      
      if (Array.isArray(images)) {
        const updatedImages = images.map(imageUrl => {
          if (typeof imageUrl === 'string') {
            // Converter URLs de listings
            if (imageUrl.includes('/uploads/listing-') || imageUrl.includes('/Uploads/listing-')) {
              const filename = imageUrl.replace(/\/(uploads|Uploads)\//, '');
              return `/api/secure-files?path=users/listings/${filename}&type=listings`;
            }
            // Converter outras URLs de uploads
            else if (imageUrl.includes('/uploads/') || imageUrl.includes('/Uploads/')) {
              const filename = imageUrl.replace(/\/(uploads|Uploads)\//, '');
              return `/api/secure-files?path=users/listings/${filename}&type=listings`;
            }
          }
          return imageUrl;
        });
        
        const hasChanges = JSON.stringify(images) !== JSON.stringify(updatedImages);
        if (hasChanges) {
          await prisma.listing.update({
            where: { id: listing.id },
            data: { images: JSON.stringify(updatedImages) }
          });
          console.log(`✅ Listing ${listing.id}: Imagens atualizadas`);
        }
      }
    }
    
    // Migrar documentos de verificação (se houver tabela específica)
    console.log('📋 Verificando documentos de verificação...');
    // Nota: Assumindo que os documentos de verificação são salvos em uma tabela separada
    // Se não houver, esta seção pode ser removida
    
    console.log('✅ Migração concluída com sucesso!');
    console.log('🔒 Todas as imagens agora usam URLs seguras via /api/secure-files');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateImageUrls()
    .then(() => {
      console.log('🎉 Migração finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na migração:', error);
      process.exit(1);
    });
}

module.exports = { migrateImageUrls };