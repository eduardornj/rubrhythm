const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixIsabellaCredits() {
  try {
    console.log('🔍 Analisando problema da Isabella Rodriguez...');
    
    const isabella = await prisma.user.findUnique({
      where: { id: 'cmfa8l6cg0005u1ggom5lr2y8' },
      include: {
        creditBalance: true,
        transactions: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!isabella) {
      console.error('❌ Isabella não encontrada!');
      return;
    }
    
    console.log(`\n👤 Usuária: ${isabella.name} (${isabella.email})`);
    console.log(`📧 ID: ${isabella.id}`);
    console.log(`💰 Campo credits (User): ${isabella.credits}`);
    console.log(`💳 CreditBalance: ${isabella.creditBalance?.balance || 'N/A'}`);
    
    console.log('\n📊 TODAS as transações (em ordem cronológica):');
    let calculatedBalance = 0;
    
    isabella.transactions.forEach((transaction, index) => {
      const date = new Date(transaction.createdAt).toLocaleString('pt-BR');
      calculatedBalance += parseFloat(transaction.amount);
      console.log(`${index + 1}. $${transaction.amount} - ${transaction.status} (${date}) | Saldo calculado: $${calculatedBalance}`);
    });
    
    console.log(`\n🧮 RESUMO DA ANÁLISE:`);
    console.log(`   Campo User.credits: ${isabella.credits}`);
    console.log(`   CreditBalance.balance: ${isabella.creditBalance?.balance || 0}`);
    console.log(`   Saldo calculado pelas transações: ${calculatedBalance}`);
    
    // Identificar qual está correto
    if (calculatedBalance !== isabella.creditBalance?.balance) {
      console.log(`\n🚨 INCONSISTÊNCIA DETECTADA!`);
      console.log(`   O saldo no CreditBalance (${isabella.creditBalance?.balance}) não bate com as transações (${calculatedBalance})`);
      
      // Corrigir o CreditBalance para bater com as transações
      console.log(`\n🔧 Corrigindo CreditBalance...`);
      
      await prisma.creditBalance.update({
        where: { userId: isabella.id },
        data: { balance: calculatedBalance }
      });
      
      console.log(`✅ CreditBalance corrigido de ${isabella.creditBalance?.balance} para ${calculatedBalance}`);
    }
    
    // Verificar se o campo User.credits também precisa ser atualizado
    if (isabella.credits !== calculatedBalance) {
      console.log(`\n🔧 Corrigindo campo User.credits...`);
      
      await prisma.user.update({
        where: { id: isabella.id },
        data: { credits: calculatedBalance }
      });
      
      console.log(`✅ User.credits corrigido de ${isabella.credits} para ${calculatedBalance}`);
    }
    
    // Verificar resultado final
    console.log(`\n🎉 VERIFICAÇÃO FINAL:`);
    const updatedIsabella = await prisma.user.findUnique({
      where: { id: isabella.id },
      include: { creditBalance: true }
    });
    
    console.log(`   User.credits: ${updatedIsabella.credits}`);
    console.log(`   CreditBalance.balance: ${updatedIsabella.creditBalance?.balance}`);
    console.log(`   Saldo calculado: ${calculatedBalance}`);
    
    if (updatedIsabella.credits === calculatedBalance && 
        updatedIsabella.creditBalance?.balance === calculatedBalance) {
      console.log(`\n✅ PROBLEMA RESOLVIDO! Todos os valores estão consistentes.`);
    } else {
      console.log(`\n❌ Ainda há inconsistências.`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir créditos da Isabella:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixIsabellaCredits();