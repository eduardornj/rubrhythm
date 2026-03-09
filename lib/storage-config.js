/**
 * Configuração de armazenamento seguro para fotos de usuários e documentos
 * Baseado em melhores práticas de segurança para aplicações web
 * 
 * IMPORTANTE: Todos os arquivos são armazenados fora do diretório público
 * para garantir que não sejam acessíveis diretamente via URL
 */

const path = require('path');
const fs = require('fs').promises;

// Diretório base privado (fora do public)
const PRIVATE_STORAGE_BASE = path.join(process.cwd(), 'private', 'storage');

// Configurações de pastas por tipo de arquivo
const STORAGE_PATHS = {
  // Fotos de perfil dos usuários
  profiles: {
    base: path.join(PRIVATE_STORAGE_BASE, 'users', 'profiles'),
    avatars: path.join(PRIVATE_STORAGE_BASE, 'users', 'profiles', 'avatars'),
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  
  // Fotos de anúncios/listings
  listings: {
    base: path.join(PRIVATE_STORAGE_BASE, 'users', 'listings'),
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 10
  },
  
  // Documentos de verificação (altamente sensíveis)
  verification: {
    base: path.join(PRIVATE_STORAGE_BASE, 'users', 'verification'),
    maxSize: 15 * 1024 * 1024, // 15MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    requiresAuth: true,
    retention: 365 * 24 * 60 * 60 * 1000 // 1 ano em ms
  },
  
  // Arquivos temporários
  temp: {
    base: path.join(PRIVATE_STORAGE_BASE, 'temp'),
    maxAge: 24 * 60 * 60 * 1000, // 24 horas em ms
    cleanupInterval: 60 * 60 * 1000 // Limpeza a cada hora
  }
};

/**
 * Gera caminho seguro para arquivo baseado no tipo e usuário
 * @param {string} type - Tipo de arquivo (profiles, listings, verification)
 * @param {string} userId - ID do usuário
 * @param {string} filename - Nome do arquivo
 * @returns {string} Caminho completo do arquivo
 */
function getSecureFilePath(type, userId, filename) {
  if (!STORAGE_PATHS[type]) {
    throw new Error(`Tipo de storage inválido: ${type}`);
  }
  
  const basePath = STORAGE_PATHS[type].base;
  
  // Para verificação, organiza por usuário e ano
  if (type === 'verification') {
    const year = new Date().getFullYear();
    return path.join(basePath, userId, year.toString(), filename);
  }
  
  // Para outros tipos, organiza diretamente por usuário
  return path.join(basePath, filename);
}

/**
 * Cria diretórios necessários se não existirem
 * @param {string} filePath - Caminho completo do arquivo
 */
async function ensureDirectoryExists(filePath) {
  const directory = path.dirname(filePath);
  try {
    await fs.access(directory);
  } catch (error) {
    await fs.mkdir(directory, { recursive: true });
  }
}

/**
 * Valida se o tipo de arquivo é permitido
 * @param {string} type - Tipo de storage
 * @param {string} mimeType - Tipo MIME do arquivo
 * @returns {boolean}
 */
function isFileTypeAllowed(type, mimeType) {
  const config = STORAGE_PATHS[type];
  return config && config.allowedTypes.includes(mimeType);
}

/**
 * Valida se o tamanho do arquivo é permitido
 * @param {string} type - Tipo de storage
 * @param {number} fileSize - Tamanho do arquivo em bytes
 * @returns {boolean}
 */
function isFileSizeAllowed(type, fileSize) {
  const config = STORAGE_PATHS[type];
  return config && fileSize <= config.maxSize;
}

/**
 * Gera nome de arquivo único e seguro
 * @param {string} originalName - Nome original do arquivo
 * @param {string} userId - ID do usuário
 * @param {string} prefix - Prefixo opcional
 * @returns {string}
 */
function generateSecureFilename(originalName, userId, prefix = '') {
  const timestamp = Date.now();
  const extension = path.extname(originalName).toLowerCase();
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  if (prefix) {
    return `${prefix}-${userId}-${timestamp}-${safeName}`;
  }
  
  return `${userId}-${timestamp}-${safeName}`;
}

/**
 * Limpa arquivos temporários antigos
 */
async function cleanupTempFiles() {
  try {
    const tempPath = STORAGE_PATHS.temp.base;
    const maxAge = STORAGE_PATHS.temp.maxAge;
    const files = await fs.readdir(tempPath);
    
    for (const file of files) {
      const filePath = path.join(tempPath, file);
      const stats = await fs.stat(filePath);
      const age = Date.now() - stats.mtime.getTime();
      
      if (age > maxAge) {
        await fs.unlink(filePath);
        console.log(`Arquivo temporário removido: ${file}`);
      }
    }
  } catch (error) {
    console.error('Erro na limpeza de arquivos temporários:', error);
  }
}

// Inicia limpeza automática de arquivos temporários
setInterval(cleanupTempFiles, STORAGE_PATHS.temp.cleanupInterval);

module.exports = {
  STORAGE_PATHS,
  getSecureFilePath,
  ensureDirectoryExists,
  isFileTypeAllowed,
  isFileSizeAllowed,
  generateSecureFilename,
  cleanupTempFiles
};