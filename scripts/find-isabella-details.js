const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findIsabella() {
  try {
    console.log('🔍 Procurando por Isabella Rodrigues no banco de dados...');
    
    // Buscar na tabela user
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Isabella' } },
          { email: { contains: 'isabella' } },
          { name: { contains: 'Rodrigues' } }
        ]
      }
    });
    
    console.log('\n📊 Usuários encontrados:');
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`ID: ${user.id}`);
        console.log(`Nome: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Créditos: ${user.credits}`);
        console.log(`Criado em: ${user.createdAt}`);
        console.log(`Status: ${user.isActive ? 'Ativo' : 'Inativo'}`);
        console.log(`Banido: ${user.isBanned ? 'Sim' : 'Não'}`);
        console.log('---');
      });
    } else {
      console.log('❌ Nenhum usuário encontrado com o nome Isabella ou Rodrigues');
    }
    
    // Verificar também na tabela listing (anúncios)
    const listings = await prisma.listing.findMany({
      where: {
        OR: [
          { title: { contains: 'Isabella' } },
          { title: { contains: 'Rodrigues' } },
          { description: { contains: 'Isabella' } },
          { description: { contains: 'Rodrigues' } }
        ]
      },
      include: {
        user: true
      }
    });
    
    console.log('\n📋 Anúncios encontrados:');
    if (listings.length > 0) {
      listings.forEach(listing => {
        console.log(`ID: ${listing.id}`);
        console.log(`Título: ${listing.title}`);
        console.log(`Usuário: ${listing.user.name} (${listing.user.email})`);
        console.log(`Telefone: ${listing.phoneArea}${listing.phoneNumber}`);
        console.log(`Cidade: ${listing.city}`);
        console.log(`Status: ${listing.isActive ? 'Ativo' : 'Inativo'}`);
        console.log(`Aprovado: ${listing.isApproved ? 'Sim' : 'Não'}`);
        console.log('---');
      });
    } else {
      console.log('❌ Nenhum anúncio encontrado com o nome Isabella ou Rodrigues');
    }
    
    // Informações do banco de dados
    console.log('\n🗄️ Informações do Banco de Dados:');
    console.log('Banco: MySQL');
    console.log('Host: localhost:3306');
    console.log('Database: rubrhythm');
    console.log('Usuário: rubrhythm_user');
    
  } catch (error) {
    console.error('❌ Erro ao consultar o banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findIsabella();