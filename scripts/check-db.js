const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando dados no banco...');
    
    // Verificar total de usuários
    const totalUsers = await prisma.user.count();
    console.log(`👥 Total de usuários: ${totalUsers}`);
    
    // Verificar total de listagens
    const totalListings = await prisma.listing.count();
    console.log(`📋 Total de listagens: ${totalListings}`);
    
    // Verificar listagens em Orlando
    const orlandoListings = await prisma.listing.count({
      where: {
        city: 'Orlando',
        state: 'Florida'
      }
    });
    console.log(`🏖️ Listagens em Orlando, Florida: ${orlandoListings}`);
    
    // Verificar todas as cidades com listagens
    const citiesWithListings = await prisma.listing.groupBy({
      by: ['city', 'state'],
      _count: {
        id: true
      }
    });
    
    console.log('\n🏙️ Cidades com listagens:');
    citiesWithListings.forEach(city => {
      console.log(`   ${city.city}, ${city.state}: ${city._count.id} listagens`);
    });
    
    // Verificar usuários admin
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'admin'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    console.log('\n👑 Usuários Admin:');
    if (adminUsers.length === 0) {
      console.log('   Nenhum usuário admin encontrado');
    } else {
      adminUsers.forEach(admin => {
        console.log(`   ${admin.name || 'Sem nome'} (${admin.email}) - ID: ${admin.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();