/**
 * Script para migrar fotos de perfil da pasta pública para a estrutura segura
 * Executa a migração dos arquivos em public/profile-photos para private/storage/users/profiles
 */

const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Diretórios
const PUBLIC_PROFILE_DIR = path.join(process.cwd(), 'public', 'profile-photos');
const PRIVATE_PROFILE_DIR = path.join(process.cwd(), 'private', 'storage', 'users', 'profiles');

/**
 * Extrai informações do nome do arquivo de perfil
 * Formatos suportados: 
 * - profile-{userId}-{timestamp}.{ext}
 * - profile-{userId}.{ext}
 */
function parseProfileFilename(filename) {
  // Ignorar arquivos SVG (são templates)
  if (filename.endsWith('.svg')) return null;
  
  // Formato: profile-b6e7a9ac-40f7-4836-b261-4a887d4a50be-1744984482859.jpg
  const match1 = filename.match(/^profile-([a-f0-9-]+)-(\d+)\.(jpg|jpeg|png)$/i);
  if (match1) {
    return {
      userId: match1[1],
      timestamp: match1[2],
      extension: match1[3],
      originalFilename: filename
    };
  }
  
  // Formato: profile-{userId}.{ext}
  const match2 = filename.match(/^profile-([^.]+)\.(jpg|jpeg|png)$/i);
  if (match2) {
    return {
      userId: match2[1],
      timestamp: Date.now().toString(),
      extension: match2[2],
      originalFilename: filename
    };
  }
  
  return null;
}

/**
 * Gera nome seguro para arquivo de perfil
 */
function generateSecureProfileFilename(userId, extension) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `profile-${userId}-${timestamp}-${randomSuffix}.${extension}`;
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
 * Migra um arquivo de foto de perfil
 */
async function migrateProfilePhoto(filename) {
  const fileInfo = parseProfileFilename(filename);
  if (!fileInfo) {
    console.log(`⏭️  Ignorando arquivo: ${filename} (não é uma foto de perfil válida)`);
    return null;
  }
  
  const { userId, extension, originalFilename } = fileInfo;
  
  // Garantir que o diretório de destino existe
  await ensureDirectoryExists(PRIVATE_PROFILE_DIR);
  
  // Gerar novo nome seguro
  const secureFilename = generateSecureProfileFilename(userId, extension);
  
  // Caminhos de origem e destino
  const sourcePath = path.join(PUBLIC_PROFILE_DIR, originalFilename);
  const destinationPath = path.join(PRIVATE_PROFILE_DIR, secureFilename);
  
  try {
    // Copiar arquivo
    await fs.copyFile(sourcePath, destinationPath);
    
    // URL segura para acesso via API
    const secureUrl = `/api/secure-files?path=users/profiles/${secureFilename}&type=profiles`;
    
    console.log(`✅ Migrado: ${originalFilename} -> ${secureUrl}`);
    
    return {
      originalPath: `/profile-photos/${originalFilename}`,
      securePath: destinationPath,
      secureUrl,
      userId
    };
  } catch (error) {
    console.error(`❌ Erro ao migrar ${originalFilename}:`, error.message);
    return null;
  }
}

/**
 * Atualiza URLs no banco de dados
 */
async function updateDatabaseUrls(migrations) {
  console.log('\n📊 Atualizando URLs no banco de dados...');
  
  for (const migration of migrations) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: migration.userId },
        select: { image: true }
      });
      
      if (user && user.image === migration.originalPath) {
        await prisma.user.update({
          where: { id: migration.userId },
          data: { image: migration.secureUrl }
        });
        console.log(`✅ URL atualizada para usuário: ${migration.userId}`);
      } else if (user) {
        console.log(`ℹ️  Usuário ${migration.userId} já tem URL atualizada: ${user.image}`);
      } else {
        console.log(`⚠️  Usuário ${migration.userId} não encontrado no banco`);
      }
    } catch (error) {
      console.error(`❌ Erro ao atualizar usuário ${migration.userId}:`, error.message);
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
      const publicPath = path.join(PUBLIC_PROFILE_DIR, path.basename(migration.originalPath));
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
async function migrateProfilePhotos() {
  console.log('🚀 Iniciando migração de fotos de perfil...');
  console.log(`📁 Origem: ${PUBLIC_PROFILE_DIR}`);
  console.log(`📁 Destino: ${PRIVATE_PROFILE_DIR}`);
  
  try {
    // Verificar se a pasta pública existe
    await fs.access(PUBLIC_PROFILE_DIR);
  } catch {
    console.log('❌ Pasta de fotos de perfil públicas não encontrada. Nada para migrar.');
    return;
  }
  
  try {
    // Listar arquivos na pasta pública
    const files = await fs.readdir(PUBLIC_PROFILE_DIR);
    
    if (files.length === 0) {
      console.log('✅ Nenhum arquivo para migrar.');
      return;
    }
    
    console.log(`📋 Encontrados ${files.length} arquivos:`);
    files.forEach(file => console.log(`   - ${file}`));
    
    // Migrar cada arquivo
    const migrations = [];
    for (const filename of files) {
      const migration = await migrateProfilePhoto(filename);
      if (migration) {
        migrations.push(migration);
      }
    }
    
    console.log(`\n📊 Resumo da migração:`);
    console.log(`   ✅ Migrados com sucesso: ${migrations.length}`);
    console.log(`   ⏭️  Ignorados: ${files.length - migrations.length}`);
    
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
    } else {
      console.log('\n✅ Nenhuma foto de perfil precisou ser migrada.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateProfilePhotos();
}

module.exports = {
  migrateProfilePhotos,
  parseProfileFilename,
  generateSecureProfileFilename
};