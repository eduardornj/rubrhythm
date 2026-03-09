const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('🔍 Verificando todos os usuários e créditos...');
    
    const users = await prisma.user.findMany({
      include: {
        creditBalance: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n👥 Total de usuários: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. 👤 ${user.name || 'Sem nome'} (${user.email})`);
      console.log(`   📧 ID: ${user.id}`);
      console.log(`   🎭 Role: ${user.role}`);
      console.log(`   💰 Campo credits (User): ${user.credits || 0}`);
      
      if (user.creditBalance) {
        console.log(`   💳 CreditBalance: ${user.creditBalance.balance}`);
        console.log(`   💳 CreditBalance ID: ${user.creditBalance.id}`);
      } else {
        console.log(`   💳 CreditBalance: Não existe`);
      }
      
      if (user.transactions && user.transactions.length > 0) {
        console.log(`   📊 Últimas transações:`);
        user.transactions.forEach((t, i) => {
          const date = new Date(t.createdAt).toLocaleDateString('pt-BR');
          console.log(`      ${i+1}. $${t.amount} - ${t.status} (${date})`);
        });
      } else {
        console.log(`   📊 Sem transações`);
      }
      
      // Verificar se é Isabella Rodriguez
      if (user.name && user.name.toLowerCase().includes('isabella') || 
          user.email && user.email.toLowerCase().includes('isabella')) {
        console.log(`   🚨 ENCONTRADA: Isabella Rodriguez!`);
      }
    });
    
    // Buscar especificamente por Isabella
    console.log('\n🔍 Buscando especificamente por Isabella...');
    const isabella = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Isabella' } },
          { email: { contains: 'isabella' } },
          { name: { contains: 'Rodriguez' } },
          { email: { contains: 'rodriguez' } }
        ]
      },
      include: {
        creditBalance: true,
        transactions: true
      }
    });
    
    if (isabella.length > 0) {
      console.log(`\n🎯 Encontrados ${isabella.length} usuários com 'Isabella' ou 'Rodriguez':`);
      isabella.forEach((user, index) => {
        console.log(`\n${index + 1}. 👤 ${user.name} (${user.email})`);
        console.log(`   📧 ID: ${user.id}`);
        console.log(`   💰 Campo credits: ${user.credits}`);
        if (user.creditBalance) {
          console.log(`   💳 CreditBalance: ${user.creditBalance.balance}`);
        }
        console.log(`   📊 Total de transações: ${user.transactions.length}`);
      });
    } else {
      console.log('\n❌ Nenhum usuário encontrado com Isabella ou Rodriguez');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();