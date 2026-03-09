const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFavorites() {
  try {
    console.log('❤️ Testando sistema de favoritos...');
    
    // 1. Verificar usuários existentes
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 3
    });
    
    console.log(`\n👥 Usuários encontrados: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    
    // 2. Verificar listings ativos
    const listings = await prisma.listing.findMany({
      where: {
        isActive: true,
        isApproved: true
      },
      select: {
        id: true,
        title: true,
        userId: true
      },
      take: 5
    });
    
    console.log(`\n🏢 Listings ativos encontrados: ${listings.length}`);
    listings.forEach((listing, index) => {
      console.log(`   ${index + 1}. ${listing.title}`);
    });
    
    if (users.length === 0 || listings.length === 0) {
      console.log('\n⚠️ Não há usuários ou listings suficientes para testar favoritos');
      return;
    }
    
    // 3. Verificar favoritos existentes
    const existingFavorites = await prisma.favorite.findMany({
      include: {
        listing: {
          select: {
            title: true
          }
        }
      }
    });
    
    console.log(`\n⭐ Favoritos existentes: ${existingFavorites.length}`);
    existingFavorites.forEach((fav, index) => {
      console.log(`   ${index + 1}. User ${fav.userId} → ${fav.listing.title}`);
    });
    
    // 4. Testar adição de favorito (se não existir)
    const testUser = users[0];
    const testListing = listings.find(l => l.userId !== testUser.id); // Não pode favoritar próprio listing
    
    if (testListing) {
      console.log(`\n➕ Testando adição de favorito...`);
      console.log(`   Usuário: ${testUser.name}`);
      console.log(`   Listing: ${testListing.title}`);
      
      // Verificar se já existe
      const existingFav = await prisma.favorite.findUnique({
        where: {
          userId_listingId: {
            userId: testUser.id,
            listingId: testListing.id
          }
        }
      });
      
      if (existingFav) {
        console.log('   ✅ Favorito já existe');
      } else {
        try {
          const newFavorite = await prisma.favorite.create({
            data: {
              userId: testUser.id,
              listingId: testListing.id
            }
          });
          console.log(`   ✅ Favorito criado: ${newFavorite.id}`);
        } catch (error) {
          console.log(`   ❌ Erro ao criar favorito: ${error.message}`);
        }
      }
    }
    
    // 5. Testar contagem de favoritos por listing
    console.log(`\n📊 Contagem de favoritos por listing:`);
    for (const listing of listings.slice(0, 3)) {
      const favCount = await prisma.favorite.count({
        where: {
          listingId: listing.id
        }
      });
      console.log(`   ${listing.title}: ${favCount} favoritos`);
    }
    
    // 6. Testar favoritos de um usuário
    console.log(`\n👤 Favoritos do usuário ${testUser.name}:`);
    const userFavorites = await prisma.favorite.findMany({
      where: {
        userId: testUser.id
      },
      include: {
        listing: {
          select: {
            title: true,
            city: true,
            state: true
          }
        }
      }
    });
    
    if (userFavorites.length === 0) {
      console.log('   Nenhum favorito encontrado');
    } else {
      userFavorites.forEach((fav, index) => {
        console.log(`   ${index + 1}. ${fav.listing.title} (${fav.listing.city}, ${fav.listing.state})`);
      });
    }
    
    // 7. Testar remoção de favorito
    if (userFavorites.length > 0) {
      const favToRemove = userFavorites[0];
      console.log(`\n➖ Testando remoção de favorito: ${favToRemove.listing.title}`);
      
      try {
        await prisma.favorite.delete({
          where: {
            id: favToRemove.id
          }
        });
        console.log('   ✅ Favorito removido com sucesso');
        
        // Re-adicionar para manter o estado
        await prisma.favorite.create({
          data: {
            userId: testUser.id,
            listingId: favToRemove.listingId
          }
        });
        console.log('   ↩️ Favorito re-adicionado para manter estado');
      } catch (error) {
        console.log(`   ❌ Erro ao remover favorito: ${error.message}`);
      }
    }
    
    console.log('\n✅ Teste de favoritos concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste de favoritos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFavorites().catch(console.error);