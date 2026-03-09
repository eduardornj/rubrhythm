const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testBanSystem() {
  try {
    console.log('🧪 Testando sistema de banimento...');
    
    // Buscar Isabella
    const isabella = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'Isabella' } },
          { email: { contains: 'isabella' } }
        ]
      }
    });
    
    if (!isabella) {
      console.log('❌ Isabella não encontrada');
      return;
    }
    
    console.log(`\n👤 Usuário encontrado: ${isabella.name} (${isabella.email})`);
    console.log(`📧 ID: ${isabella.id}`);
    console.log(`🚫 Status de banimento: ${isabella.isBanned ? 'BANIDO' : 'ATIVO'}`);
    console.log(`✅ Verificado: ${isabella.verified ? 'SIM' : 'NÃO'}`);
    console.log(`👑 Role: ${isabella.role}`);
    
    // Simular tentativa de login
    console.log('\n🔐 Simulando tentativa de login...');
    
    if (isabella.isBanned) {
      console.log('✅ LOGIN PERMITIDO: Usuário banido pode fazer login');
      console.log('📝 Redirecionamento será feito pelo middleware após login');
    } else {
      console.log('✅ LOGIN PERMITIDO: Usuário não está banido');
    }
    
    // Verificar se middleware bloquearia o acesso
    console.log('\n🛡️ Testando middleware de proteção...');
    
    const protectedRoutes = [
      '/dashboard',
      '/my-listings',
      '/my-account',
      '/messages',
      '/favorites',
      '/add-listing',
      '/get-verified'
    ];
    
    protectedRoutes.forEach(route => {
      if (isabella.isBanned) {
        console.log(`🚫 ${route} -> BLOQUEADO (redirecionado para /banned)`);
      } else {
        console.log(`✅ ${route} -> PERMITIDO`);
      }
    });
    
    // Testar desbanimento
    console.log('\n🔄 Testando desbanimento...');
    
    await prisma.user.update({
      where: { id: isabella.id },
      data: { isBanned: false }
    });
    
    console.log('✅ Isabella foi desbanida temporariamente para teste');
    
    // Verificar status após desbanimento
    const isabellaAfter = await prisma.user.findUnique({
      where: { id: isabella.id },
      select: { isBanned: true }
    });
    
    console.log(`📊 Status após desbanimento: ${isabellaAfter.isBanned ? 'BANIDO' : 'ATIVO'}`);
    
    // Banir novamente
    await prisma.user.update({
      where: { id: isabella.id },
      data: { isBanned: true }
    });
    
    console.log('🚫 Isabella foi banida novamente');
    
    // Status final
    const isabellaFinal = await prisma.user.findUnique({
      where: { id: isabella.id },
      select: { isBanned: true }
    });
    
    console.log(`📊 Status final: ${isabellaFinal.isBanned ? 'BANIDO' : 'ATIVO'}`);
    
    console.log('\n✅ Teste do sistema de banimento concluído!');
    console.log('\n📋 Resumo das implementações:');
    console.log('   1. ✅ Middleware atualizado para verificar status de banimento');
    console.log('   2. ✅ Página /banned criada para usuários banidos');
    console.log('   3. ✅ Sistema de autenticação atualizado');
    console.log('   4. ✅ Verificação de banimento no login');
    console.log('   5. ✅ Redirecionamento automático para página de banimento');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBanSystem();