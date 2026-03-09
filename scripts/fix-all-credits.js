const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllCredits() {
  try {
    console.log('🔍 Verificando e corrigindo TODOS os créditos do sistema...');
    
    const users = await prisma.user.findMany({
      include: {
        creditBalance: true,
        transactions: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    console.log(`\n👥 Total de usuários encontrados: ${users.length}`);
    
    let inconsistenciesFound = 0;
    let usersFixed = 0;
    
    for (const user of users) {
      console.log(`\n📋 Verificando: ${user.name || 'Sem nome'} (${user.email})`);
      
      // Calcular saldo real baseado nas transações
      let calculatedBalance = 0;
      user.transactions.forEach(transaction => {
        calculatedBalance += parseFloat(transaction.amount);
      });
      
      const userCredits = parseFloat(user.credits || 0);
      const creditBalanceAmount = parseFloat(user.creditBalance?.balance || 0);
      
      console.log(`   💰 User.credits: ${userCredits}`);
      console.log(`   💳 CreditBalance: ${creditBalanceAmount}`);
      console.log(`   🧮 Calculado: ${calculatedBalance}`);
      console.log(`   📊 Transações: ${user.transactions.length}`);
      
      let hasInconsistency = false;
      
      // Verificar se há inconsistências
      if (userCredits !== calculatedBalance || creditBalanceAmount !== calculatedBalance) {
        console.log(`   🚨 INCONSISTÊNCIA DETECTADA!`);
        inconsistenciesFound++;
        hasInconsistency = true;
        
        // Corrigir User.credits
        if (userCredits !== calculatedBalance) {
          await prisma.user.update({
            where: { id: user.id },
            data: { credits: calculatedBalance }
          });
          console.log(`   ✅ User.credits: ${userCredits} → ${calculatedBalance}`);
        }
        
        // Corrigir ou criar CreditBalance
        if (user.creditBalance) {
          if (creditBalanceAmount !== calculatedBalance) {
            await prisma.creditBalance.update({
              where: { userId: user.id },
              data: { balance: calculatedBalance }
            });
            console.log(`   ✅ CreditBalance: ${creditBalanceAmount} → ${calculatedBalance}`);
          }
        } else {
          // Criar CreditBalance se não existir
          await prisma.creditBalance.create({
            data: {
              userId: user.id,
              balance: calculatedBalance
            }
          });
          console.log(`   ✅ CreditBalance criado: ${calculatedBalance}`);
        }
        
        usersFixed++;
      } else {
        console.log(`   ✅ Consistente`);
      }
    }
    
    console.log(`\n📊 RELATÓRIO FINAL:`);
    console.log(`   👥 Total de usuários: ${users.length}`);
    console.log(`   🚨 Inconsistências encontradas: ${inconsistenciesFound}`);
    console.log(`   🔧 Usuários corrigidos: ${usersFixed}`);
    console.log(`   ✅ Usuários já consistentes: ${users.length - usersFixed}`);
    
    if (inconsistenciesFound === 0) {
      console.log(`\n🎉 PARABÉNS! Todos os créditos estão consistentes!`);
    } else {
      console.log(`\n🎉 CORREÇÕES CONCLUÍDAS! Banco de dados organizado.`);
    }
    
    // Verificação final - mostrar resumo de todos os usuários
    console.log(`\n📋 RESUMO FINAL DE TODOS OS USUÁRIOS:`);
    const finalUsers = await prisma.user.findMany({
      include: { creditBalance: true },
      orderBy: { name: 'asc' }
    });
    
    finalUsers.forEach((user, index) => {
      const credits = parseFloat(user.credits || 0);
      const balance = parseFloat(user.creditBalance?.balance || 0);
      const status = credits === balance ? '✅' : '❌';
      
      console.log(`${index + 1}. ${status} ${user.name || 'Sem nome'} - Credits: ${credits} | Balance: ${balance}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir créditos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllCredits();