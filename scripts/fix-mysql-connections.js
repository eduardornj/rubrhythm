// Script para verificar e corrigir problemas de conexões MySQL
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function fixMySQLConnections() {
  console.log('🔍 Verificando conexões MySQL ativas...');
  
  try {
    // Verificar conexões ativas
    const { stdout: connections } = await execPromise(
      'mysql -u root -p"admin123" -e "SHOW PROCESSLIST;" rubrhythm'
    );
    console.log('Conexões ativas:');
    console.log(connections);
    
    // Matar conexões idle
    console.log('\n🧹 Limpando conexões idle...');
    await execPromise(
      'mysql -u root -p"admin123" -e "KILL (SELECT ID FROM INFORMATION_SCHEMA.PROCESSLIST WHERE COMMAND = \'Sleep\' AND TIME > 30);" rubrhythm'
    );
    
    // Verificar configurações de conexão
    const { stdout: maxConnections } = await execPromise(
      'mysql -u root -p"admin123" -e "SHOW VARIABLES LIKE \'max_connections\';" rubrhythm'
    );
    console.log('\n📊 Configurações de conexão:');
    console.log(maxConnections);
    
    // Aumentar limite de conexões se necessário
    console.log('\n⚙️ Aumentando limite de conexões...');
    await execPromise(
      'mysql -u root -p"admin123" -e "SET GLOBAL max_connections = 200;" rubrhythm'
    );
    
    console.log('✅ Correções aplicadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir conexões MySQL:', error.message);
    
    // Tentar reiniciar o serviço MySQL como alternativa
    console.log('\n🔄 Tentando reiniciar serviço MySQL...');
    try {
      await execPromise('net stop mysql80');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await execPromise('net start mysql80');
      console.log('✅ Serviço MySQL reiniciado!');
    } catch (restartError) {
      console.error('❌ Erro ao reiniciar MySQL:', restartError.message);
      console.log('\n💡 Soluções manuais:');
      console.log('1. Reinicie o serviço MySQL manualmente');
      console.log('2. Aumente max_connections no my.cnf');
      console.log('3. Verifique se há conexões travadas');
    }
  }
}

fixMySQLConnections();