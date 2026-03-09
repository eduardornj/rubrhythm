const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkIsabellaBan() {
  try {
    console.log('🔍 Verificando status de banimento da Isabella...');
    
    // Buscar Isabella
    const isabella = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Isabella' } },
          { email: { contains: 'isabella' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
        verified: true,
        role: true
      }
    });
    
    if (isabella.length === 0) {
      console.log('❌ Nenhum usuário Isabella encontrado');
      return;
    }
    
    console.log(`\n👤 Encontrados ${isabella.length} usuários Isabella:`);
    isabella.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Status: ${user.isBanned ? '🚫 BANIDO' : '✅ ATIVO'}`);
      console.log(`   Verificado: ${user.verified ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Role: ${user.role}`);
    });
    
    // Banir Isabella se não estiver banida
    for (const user of isabella) {
      if (!user.isBanned) {
        console.log(`\n🚫 Banindo usuário ${user.name}...`);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { isBanned: true }
        });
        
        console.log(`✅ Usuário ${user.name} foi banido com sucesso!`);
      } else {
        console.log(`\n⚠️ Usuário ${user.name} já está banido`);
      }
    }
    
    // Verificar novamente após o banimento
    console.log('\n🔄 Verificando status após banimento...');
    const isabellaAfter = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Isabella' } },
          { email: { contains: 'isabella' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true
      }
    });
    
    isabellaAfter.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Status: ${user.isBanned ? '🚫 BANIDO' : '✅ ATIVO'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar/banir Isabella:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIsabellaBan();