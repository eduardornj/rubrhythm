const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminCredits() {
  try {
    console.log('💰 Verificando créditos do admin...');
    
    // Buscar o usuário admin com saldo de créditos e transações
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@rubrhythm.com' },
      include: {
        creditBalance: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Últimas 5 transações
        }
      }
    });
    
    if (!admin) {
      console.error('❌ Usuário admin não encontrado!');
      return;
    }
    
    console.log(`\n👑 Admin: ${admin.name} (${admin.email})`);
    console.log(`📧 ID: ${admin.id}`);
    
    if (admin.creditBalance) {
      console.log(`💰 Saldo atual: $${admin.creditBalance.balance}`);
      console.log(`💳 ID do saldo: ${admin.creditBalance.id}`);
    } else {
      console.log('💳 Nenhum saldo de créditos encontrado');
    }
    
    if (admin.transactions && admin.transactions.length > 0) {
      console.log('\n📊 Últimas transações:');
      admin.transactions.forEach((transaction, index) => {
        const date = new Date(transaction.createdAt).toLocaleString('pt-BR');
        const amount = transaction.amount >= 0 ? `+$${transaction.amount}` : `-$${Math.abs(transaction.amount)}`;
        console.log(`   ${index + 1}. ${amount} - ${transaction.status} (${date})`);
      });
    } else {
      console.log('\n📊 Nenhuma transação encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar créditos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminCredits();