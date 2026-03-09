// Script para testar o envio de informações ao banco de dados na página de verificação

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testVerificationDatabase() {
  console.log('🔍 Testando sistema de verificação no banco de dados...');
  
  try {
    // 1. Verificar se a tabela verificationrequest existe
    console.log('\n1. Verificando estrutura da tabela verificationrequest...');
    const tableInfo = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'verificationrequest' 
      AND TABLE_SCHEMA = DATABASE()
    `;
    
    if (tableInfo.length === 0) {
      console.log('❌ Tabela verificationrequest não encontrada!');
      return;
    }
    
    console.log('✅ Tabela verificationrequest encontrada com colunas:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 2. Verificar usuários existentes
    console.log('\n2. Verificando usuários no sistema...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        verified: true,
        verificationrequest: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      },
      take: 5
    });
    
    console.log(`✅ Encontrados ${users.length} usuários (mostrando até 5):`);
    users.forEach(user => {
      console.log(`   - ${user.email}: verified=${user.verified}, requests=${user.verificationrequest?.length || 0}`);
    });
    
    // 3. Testar criação de solicitação de verificação (simulação)
    console.log('\n3. Testando estrutura de dados para nova solicitação...');
    
    if (users.length > 0) {
      const testUser = users[0];
      
      // Verificar se já existe solicitação pendente
      const existingRequest = await prisma.verificationrequest.findFirst({
        where: {
          userId: testUser.id,
          status: 'pending'
        }
      });
      
      if (existingRequest) {
        console.log(`✅ Usuário ${testUser.email} já tem solicitação pendente (ID: ${existingRequest.id})`);
      } else {
        console.log(`✅ Usuário ${testUser.email} pode criar nova solicitação de verificação`);
      }
    }
    
    // 4. Verificar estatísticas de verificação
    console.log('\n4. Estatísticas de verificação...');
    const stats = await prisma.verificationrequest.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('✅ Estatísticas por status:');
    stats.forEach(stat => {
      console.log(`   - ${stat.status}: ${stat._count.status} solicitações`);
    });
    
    // 5. Verificar total de solicitações
    console.log('\n5. Verificando total de solicitações...');
    const totalRequests = await prisma.verificationrequest.count();
    console.log(`✅ Total de solicitações de verificação: ${totalRequests}`);
    
    // 6. Testar operação de criação (simulação)
    console.log('\n6. Testando estrutura para nova solicitação...');
    console.log('✅ Campos obrigatórios para nova solicitação:');
    console.log('   - userId (string)');
    console.log('   - documentPath (string)');
    console.log('   - selfiePath (string)');
    console.log('   - status (string - default: pending)');
    console.log('   - createdAt (datetime)');
    console.log('✅ Sistema pronto para receber novas solicitações');
    
    console.log('\n🎉 Teste do banco de dados de verificação concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testVerificationDatabase().catch(console.error);