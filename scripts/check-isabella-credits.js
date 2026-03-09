const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateIsabellaCredits() {
  try {
    console.log('🔍 Atualizando créditos da Isabella...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'isabella1757282431718@example.com' },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        role: true
      }
    });
    
    if (!user) {
      console.log('❌ Usuário Isabella não encontrado');
      return;
    }
    
    console.log('👤 Usuário Isabella (antes):');
    console.log(`ID: ${user.id}`);
    console.log(`Nome: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Créditos: ${user.credits}`);
    console.log(`Role: ${user.role}`);
    
    // Adicionar mais créditos
    console.log('\n💰 Adicionando créditos para Isabella...');
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { credits: 1000 }
    });
    
    console.log('\n✅ Usuário Isabella (depois):');
    console.log(`Créditos: ${updatedUser.credits}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateIsabellaCredits();