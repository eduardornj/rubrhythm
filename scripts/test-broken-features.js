const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBrokenFeatures() {
  try {
    console.log('🔍 Procurando funcionalidades quebradas...');
    console.log('=' .repeat(60));
    
    const issues = [];
    const warnings = [];
    
    // 1. Testar campos obrigatórios em User
    console.log('\n👤 Testando modelo User...');
    try {
      const userCount = await prisma.user.count();
      console.log(`   ✅ Modelo User: ${userCount} registros`);
      
      // Verificar usuários sem email
      const usersWithoutEmail = await prisma.user.count({
        where: { email: null }
      });
      if (usersWithoutEmail > 0) {
        issues.push(`${usersWithoutEmail} usuários sem email`);
      }
      
      // Verificar usuários banidos
      const bannedUsers = await prisma.user.count({
        where: { isBanned: true }
      });
      if (bannedUsers > 0) {
        warnings.push(`${bannedUsers} usuários banidos encontrados`);
      }
      
    } catch (error) {
      issues.push(`Erro no modelo User: ${error.message}`);
    }
    
    // 2. Testar modelo Listing
    console.log('\n🏢 Testando modelo Listing...');
    try {
      const listingCount = await prisma.listing.count();
      console.log(`   ✅ Modelo Listing: ${listingCount} registros`);
      
      // Verificar listings sem usuário
      const orphanListings = await prisma.listing.count({
        where: { userId: null }
      });
      if (orphanListings > 0) {
        issues.push(`${orphanListings} listings órfãos (sem usuário)`);
      }
      
      // Verificar listings inativos
      const inactiveListings = await prisma.listing.count({
        where: { isActive: false }
      });
      if (inactiveListings > 0) {
        warnings.push(`${inactiveListings} listings inativos`);
      }
      
    } catch (error) {
      issues.push(`Erro no modelo Listing: ${error.message}`);
    }
    
    // 3. Testar modelo Review
    console.log('\n⭐ Testando modelo Review...');
    try {
      const reviewCount = await prisma.review.count();
      console.log(`   ✅ Modelo Review: ${reviewCount} registros`);
      
      // Verificar reviews pendentes há muito tempo
      const oldPendingReviews = await prisma.review.count({
        where: {
          status: 'pending',
          createdAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias atrás
          }
        }
      });
      if (oldPendingReviews > 0) {
        warnings.push(`${oldPendingReviews} reviews pendentes há mais de 7 dias`);
      }
      
    } catch (error) {
      issues.push(`Erro no modelo Review: ${error.message}`);
    }
    
    // 4. Testar modelo CreditBalance
    console.log('\n💰 Testando modelo CreditBalance...');
    try {
      const creditCount = await prisma.creditBalance.count();
      console.log(`   ✅ Modelo CreditBalance: ${creditCount} registros`);
      
      // Verificar saldos negativos
      const negativeBalances = await prisma.creditBalance.count({
        where: { balance: { lt: 0 } }
      });
      if (negativeBalances > 0) {
        warnings.push(`${negativeBalances} contas com saldo negativo`);
      }
      
    } catch (error) {
      issues.push(`Erro no modelo CreditBalance: ${error.message}`);
    }
    
    // 5. Testar modelo Escrow
    console.log('\n🔒 Testando modelo Escrow...');
    try {
      const escrowCount = await prisma.escrow.count();
      console.log(`   ✅ Modelo Escrow: ${escrowCount} registros`);
      
      // Verificar escrows pendentes há muito tempo
      const oldEscrows = await prisma.escrow.count({
        where: {
          status: 'pending',
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
          }
        }
      });
      if (oldEscrows > 0) {
        warnings.push(`${oldEscrows} escrows pendentes há mais de 30 dias`);
      }
      
    } catch (error) {
      issues.push(`Erro no modelo Escrow: ${error.message}`);
    }
    
    // 6. Testar modelo Conversation
    console.log('\n💬 Testando modelo Conversation...');
    try {
      const conversationCount = await prisma.conversation.count();
      console.log(`   ✅ Modelo Conversation: ${conversationCount} registros`);
      
      // Verificar conversas sem mensagens
      const emptyConversations = await prisma.conversation.count({
        where: {
          messages: {
            none: {}
          }
        }
      });
      if (emptyConversations > 0) {
        warnings.push(`${emptyConversations} conversas sem mensagens`);
      }
      
    } catch (error) {
      issues.push(`Erro no modelo Conversation: ${error.message}`);
    }
    
    // 7. Testar modelo Favorite
    console.log('\n❤️ Testando modelo Favorite...');
    try {
      const favoriteCount = await prisma.favorite.count();
      console.log(`   ✅ Modelo Favorite: ${favoriteCount} registros`);
      
      // Verificar favoritos órfãos
      const orphanFavorites = await prisma.favorite.count({
        where: {
          listing: null
        }
      });
      if (orphanFavorites > 0) {
        issues.push(`${orphanFavorites} favoritos órfãos`);
      }
      
    } catch (error) {
      issues.push(`Erro no modelo Favorite: ${error.message}`);
    }
    
    // 8. Testar modelo VerificationRequest
    console.log('\n✅ Testando modelo VerificationRequest...');
    try {
      const verificationCount = await prisma.verificationRequest.count();
      console.log(`   ✅ Modelo VerificationRequest: ${verificationCount} registros`);
      
      // Verificar verificações pendentes há muito tempo
      const oldVerifications = await prisma.verificationRequest.count({
        where: {
          status: 'pending',
          createdAt: {
            lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 dias atrás
          }
        }
      });
      if (oldVerifications > 0) {
        warnings.push(`${oldVerifications} verificações pendentes há mais de 14 dias`);
      }
      
    } catch (error) {
      issues.push(`Erro no modelo VerificationRequest: ${error.message}`);
    }
    
    // 9. Testar integridade referencial
    console.log('\n🔗 Testando integridade referencial...');
    try {
      // Verificar se todos os listings têm usuários válidos
      const listingsWithUsers = await prisma.listing.findMany({
        where: {
          user: null
        },
        select: { id: true, title: true }
      });
      
      if (listingsWithUsers.length > 0) {
        issues.push(`${listingsWithUsers.length} listings sem usuário válido`);
      }
      
      console.log('   ✅ Integridade referencial verificada');
      
    } catch (error) {
      issues.push(`Erro na verificação de integridade: ${error.message}`);
    }
    
    // 10. Testar campos de estatísticas
    console.log('\n📊 Testando campos de estatísticas...');
    try {
      // Verificar se as estatísticas dos listings estão corretas
      const listingsWithStats = await prisma.listing.findMany({
        where: {
          totalReviews: { gt: 0 }
        },
        select: {
          id: true,
          title: true,
          totalReviews: true,
          averageRating: true
        },
        take: 5
      });
      
      console.log(`   ✅ ${listingsWithStats.length} listings com estatísticas`);
      
      // Verificar inconsistências
      for (const listing of listingsWithStats) {
        const actualReviews = await prisma.review.count({
          where: {
            listingId: listing.id,
            status: 'approved'
          }
        });
        
        if (actualReviews !== listing.totalReviews) {
          warnings.push(`Listing "${listing.title}" tem ${listing.totalReviews} reviews registrados mas ${actualReviews} reviews reais`);
        }
      }
      
    } catch (error) {
      issues.push(`Erro na verificação de estatísticas: ${error.message}`);
    }
    
    // Resumo Final
    console.log('\n\n🎯 RELATÓRIO FINAL');
    console.log('=' .repeat(60));
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('🎉 NENHUM PROBLEMA ENCONTRADO!');
      console.log('✅ Todos os sistemas estão funcionando corretamente.');
    } else {
      if (issues.length > 0) {
        console.log('\n❌ PROBLEMAS CRÍTICOS ENCONTRADOS:');
        issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`);
        });
      }
      
      if (warnings.length > 0) {
        console.log('\n⚠️ AVISOS:');
        warnings.forEach((warning, index) => {
          console.log(`   ${index + 1}. ${warning}`);
        });
      }
    }
    
    console.log('\n📈 Resumo da verificação:');
    console.log(`   🔴 Problemas críticos: ${issues.length}`);
    console.log(`   🟡 Avisos: ${warnings.length}`);
    console.log(`   🟢 Status geral: ${issues.length === 0 ? 'SAUDÁVEL' : 'REQUER ATENÇÃO'}`);
    
    console.log('\n🔍 Verificação de funcionalidades quebradas concluída!');
    
  } catch (error) {
    console.error('❌ Erro crítico na verificação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBrokenFeatures().catch(console.error);