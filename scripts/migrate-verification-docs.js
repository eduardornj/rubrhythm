/**
 * Script para migrar documentos de verificação da pasta pública para a estrutura segura
 * Executa a migração dos arquivos em public/verification-docs para private/storage/users/verification
 */

const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Diretórios
const PUBLIC_VERIFICATION_DIR = path.join(process.cwd(), 'public', 'verification-docs');
const PRIVATE_VERIFICATION_BASE = path.join(process.cwd(), 'private', 'storage', 'users', 'verification');

/**
 * Extrai informações do nome do arquivo de verificação
 * Formato: {tipo}-{nome}-{userId}-{timestamp}.{ext}
 */
function parseVerificationFilename(filename) {
  const parts = filename.split('-');
  if (parts.length < 4) return null;
  
  const type = parts[0]; // 'id' ou 'selfie'
  const timestamp = parts[parts.length - 1].split('.')[0];
  const userId = parts[parts.length - 2];
  const name = parts.slice(1, -2).join('-');
  
  return { type, name, userId, timestamp, originalFilename: filename };
}

/**
 * Cria estrutura de pastas para documentos de verificação
 * Formato: private/storage/users/verification/{userId}/{year}/{month}/{timestamp}/
 */
function createVerificationPath(userId, timestamp) {
  const date = new Date(parseInt(timestamp));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return {
    relativePath: `users/verification/${userId}/${year}/${month}/${timestamp}`,
    fullPath: path.join(PRIVATE_VERIFICATION_BASE, userId, String(year), month, timestamp)
  };
}

/**
 * Garante que o diretório existe
 */
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`✅ Diretório criado: ${dirPath}`);
  }
}

/**
 * Migra um arquivo de verificação
 */
async function migrateVerificationFile(filename) {
  const fileInfo = parseVerificationFilename(filename);
  if (!fileInfo) {
    console.log(`❌ Não foi possível analisar o arquivo: ${filename}`);
    return null;
  }
  
  const { type, userId, timestamp, originalFilename } = fileInfo;
  
  // Criar estrutura de pastas
  const { fullPath, relativePath } = createVerificationPath(userId, timestamp);
  await ensureDirectoryExists(fullPath);
  
  // Gerar novo nome seguro
  const extension = path.extname(originalFilename);
  const secureFilename = `${type}Document_${timestamp}_${Math.random().toString(36).substring(2, 8)}${extension}`;
  
  // Caminhos de origem e destino
  const sourcePath = path.join(PUBLIC_VERIFICATION_DIR, originalFilename);
  const destinationPath = path.join(fullPath, secureFilename);
  
  try {
    // Copiar arquivo
    await fs.copyFile(sourcePath, destinationPath);
    
    // URL segura para acesso via API
    const secureUrl = `/api/secure-files?path=${relativePath}/${secureFilename}&type=verification`;
    
    console.log(`✅ Migrado: ${originalFilename} -> ${secureUrl}`);
    
    return {
      originalPath: `/verification-docs/${originalFilename}`,
      securePath: destinationPath,
      secureUrl,
      userId,
      type
    };
  } catch (error) {
    console.error(`❌ Erro ao migrar ${originalFilename}:`, error.message);
    return null;
  }
}

/**
 * Atualiza URLs no banco de dados (se necessário)
 */
async function updateDatabaseUrls(migrations) {
  console.log('\n📊 Atualizando URLs no banco de dados...');
  
  // Agrupar por usuário
  const userMigrations = {};
  migrations.forEach(migration => {
    if (!userMigrations[migration.userId]) {
      userMigrations[migration.userId] = [];
    }
    userMigrations[migration.userId].push(migration);
  });
  
  // Atualizar cada usuário
  for (const [userId, userFiles] of Object.entries(userMigrations)) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { verificationDocuments: true }
      });
      
      if (user && user.verificationDocuments) {
        let updated = false;
        let docs = user.verificationDocuments;
        
        // Atualizar URLs nos documentos
        userFiles.forEach(migration => {
          if (docs.includes(migration.originalPath)) {
            docs = docs.replace(migration.originalPath, migration.secureUrl);
            updated = true;
          }
        });
        
        if (updated) {
          await prisma.user.update({
            where: { id: userId },
            data: { verificationDocuments: docs }
          });
          console.log(`✅ URLs atualizadas para usuário: ${userId}`);
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao atualizar usuário ${userId}:`, error.message);
    }
  }
}

/**
 * Remove arquivos antigos da pasta pública
 */
async function cleanupPublicFiles(migrations) {
  console.log('\n🧹 Removendo arquivos antigos da pasta pública...');
  
  for (const migration of migrations) {
    try {
      const publicPath = path.join(PUBLIC_VERIFICATION_DIR, path.basename(migration.originalPath));
      await fs.unlink(publicPath);
      console.log(`✅ Removido: ${migration.originalPath}`);
    } catch (error) {
      console.error(`❌ Erro ao remover ${migration.originalPath}:`, error.message);
    }
  }
}

/**
 * Função principal de migração
 */
async function migrateVerificationDocuments() {
  console.log('🚀 Iniciando migração de documentos de verificação...');
  console.log(`📁 Origem: ${PUBLIC_VERIFICATION_DIR}`);
  console.log(`📁 Destino: ${PRIVATE_VERIFICATION_BASE}`);
  
  try {
    // Verificar se a pasta pública existe
    await fs.access(PUBLIC_VERIFICATION_DIR);
  } catch {
    console.log('❌ Pasta de documentos públicos não encontrada. Nada para migrar.');
    return;
  }
  
  try {
    // Listar arquivos na pasta pública
    const files = await fs.readdir(PUBLIC_VERIFICATION_DIR);
    
    if (files.length === 0) {
      console.log('✅ Nenhum arquivo para migrar.');
      return;
    }
    
    console.log(`📋 Encontrados ${files.length} arquivos para migrar:`);
    files.forEach(file => console.log(`   - ${file}`));
    
    // Migrar cada arquivo
    const migrations = [];
    for (const filename of files) {
      const migration = await migrateVerificationFile(filename);
      if (migration) {
        migrations.push(migration);
      }
    }
    
    console.log(`\n📊 Resumo da migração:`);
    console.log(`   ✅ Migrados com sucesso: ${migrations.length}`);
    console.log(`   ❌ Falhas: ${files.length - migrations.length}`);
    
    if (migrations.length > 0) {
      // Atualizar banco de dados
      await updateDatabaseUrls(migrations);
      
      // Limpar arquivos antigos
      await cleanupPublicFiles(migrations);
      
      console.log('\n🎉 Migração concluída com sucesso!');
      console.log('\n📋 Arquivos migrados:');
      migrations.forEach(m => {
        console.log(`   ${m.originalPath} -> ${m.secureUrl}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateVerificationDocuments();
}

module.exports = {
  migrateVerificationDocuments,
  parseVerificationFilename,
  createVerificationPath
};