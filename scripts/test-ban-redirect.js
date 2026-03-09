const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBanSystem() {
  try {
    console.log('🔍 Testando sistema de banimento...');
    
    // Verificar usuário Isabella
    const isabella = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'isabella' } },
          { name: { contains: 'Isabella' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
        role: true
      }
    });
    
    if (isabella) {
      console.log('👤 Usuário Isabella encontrado:');
      console.log(`   ID: ${isabella.id}`);
      console.log(`   Nome: ${isabella.name}`);
      console.log(`   Email: ${isabella.email}`);
      console.log(`   Banido: ${isabella.isBanned ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Role: ${isabella.role}`);
      
      if (!isabella.isBanned) {
        console.log('\n⚠️  Isabella não está banida. Banindo agora...');
        await prisma.user.update({
          where: { id: isabella.id },
          data: { isBanned: true }
        });
        console.log('✅ Isabella foi banida com sucesso!');
      } else {
        console.log('\n✅ Isabella já está banida.');
      }
    } else {
      console.log('❌ Usuário Isabella não encontrado.');
    }
    
    // Verificar todos os usuários banidos
    const bannedUsers = await prisma.user.findMany({
      where: { isBanned: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`\n🚫 Total de usuários banidos: ${bannedUsers.length}`);
    bannedUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar sistema de banimento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBanSystem();