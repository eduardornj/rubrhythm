const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findIsabella() {
  try {
    console.log('🔍 Procurando por usuários Isabella...');
    
    // Buscar por nome contendo Isabella
    const isabellaUsers = await prisma.user.findMany({
      where: {
        name: {
          contains: 'Isabella'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        role: true
      }
    });
    
    console.log(`\n📋 Encontrados ${isabellaUsers.length} usuários com nome Isabella:`);
    
    if (isabellaUsers.length > 0) {
      isabellaUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Créditos: ${user.credits}`);
        console.log(`   Role: ${user.role}`);
      });
    } else {
      console.log('❌ Nenhum usuário Isabella encontrado');
      
      // Vamos buscar todos os usuários para ver o que temos
      console.log('\n🔍 Listando todos os usuários:');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          credits: true,
          role: true
        },
        take: 10 // Limitar a 10 usuários
      });
      
      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Créditos: ${user.credits}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findIsabella();