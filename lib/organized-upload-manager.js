// lib/organized-upload-manager.js
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { generateOrganizedPath, validateFileType, validateFileSize } from './file-naming.js';

const STORAGE_BASE = path.join(process.cwd(), 'private', 'storage');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Garantir que o diretório existe
async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Criar marca d'água
async function createWatermark() {
  const watermarkText = 'RubRhythm.com';
  const watermarkSvg = `
    <svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
      <text x="100" y="30" font-family="Arial, sans-serif" font-size="20" font-weight="bold" 
            text-anchor="middle" fill="white" fill-opacity="0.7" 
            stroke="black" stroke-width="1" stroke-opacity="0.5">
        ${watermarkText}
      </text>
    </svg>
  `;
  
  return Buffer.from(watermarkSvg);
}

// Processar uma única imagem
async function processImage(buffer, entityType, entityId, originalExtension, sequence) {
  const pathInfo = generateOrganizedPath(entityType, entityId, 'webp', sequence);
  const fullDirPath = path.join(STORAGE_BASE, path.dirname(pathInfo.relativePath));
  const fullFilePath = path.join(STORAGE_BASE, pathInfo.relativePath);
  
  // Garantir que o diretório existe
  await ensureDirectory(fullDirPath);
  
  // Criar marca d'água
  const watermark = await createWatermark();
  
  // Processar imagem com Sharp (mantendo tamanho original)
  await sharp(buffer)
    .composite([
      {
        input: watermark,
        gravity: 'center',
        blend: 'over'
      }
    ])
    .webp({ quality: 85 })
    .toFile(fullFilePath);
  
  return pathInfo.fileName;
}

// Upload de arquivos para listings
export async function uploadListingFiles(listingId, files) {
  const uploadedFiles = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Validações
    if (!validateFileType(file)) {
      throw new Error(`Arquivo ${file.name} tem tipo inválido. Apenas JPEG, PNG e WebP são permitidos.`);
    }
    
    if (!validateFileSize(file, MAX_FILE_SIZE)) {
      throw new Error(`Arquivo ${file.name} é muito grande. Tamanho máximo: 10MB.`);
    }
    
    // Processar arquivo
    const buffer = Buffer.from(await file.arrayBuffer());
    const originalExtension = file.name.split('.').pop().toLowerCase();
    const sequence = i + 1;
    
    const fileName = await processImage(buffer, 'listing', listingId, originalExtension, sequence);
    uploadedFiles.push(fileName);
  }
  
  return uploadedFiles;
}

// Upload de arquivos para verificação
export async function uploadVerificationFiles(userId, files) {
  const uploadedFiles = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Validações
    if (!validateFileType(file, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'])) {
      throw new Error(`Arquivo ${file.name} tem tipo inválido. Apenas JPEG, PNG, WebP e PDF são permitidos.`);
    }
    
    if (!validateFileSize(file, 15 * 1024 * 1024)) { // 15MB para verificação
      throw new Error(`Arquivo ${file.name} é muito grande. Tamanho máximo: 15MB.`);
    }
    
    // Para PDFs, apenas salvar sem processamento
    if (file.type === 'application/pdf') {
      const pathInfo = generateOrganizedPath('verify', userId, 'pdf', i + 1);
      const fullDirPath = path.join(STORAGE_BASE, path.dirname(pathInfo.relativePath));
      const fullFilePath = path.join(STORAGE_BASE, pathInfo.relativePath);
      
      await ensureDirectory(fullDirPath);
      
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(fullFilePath, buffer);
      
      uploadedFiles.push(pathInfo.fileName);
    } else {
      // Processar imagem
      const buffer = Buffer.from(await file.arrayBuffer());
      const originalExtension = file.name.split('.').pop().toLowerCase();
      const sequence = i + 1;
      
      const fileName = await processImage(buffer, 'verify', userId, originalExtension, sequence);
      uploadedFiles.push(fileName);
    }
  }
  
  return uploadedFiles;
}

// Deletar arquivo físico
export async function deletePhysicalFile(fileName, entityType) {
  try {
    // Buscar arquivo na estrutura de pastas
    const baseDir = path.join(STORAGE_BASE, 'users', `${entityType}s`);
    
    // Buscar recursivamente o arquivo
    async function findAndDeleteFile(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            const found = await findAndDeleteFile(fullPath);
            if (found) return true;
          } else if (entry.name === fileName) {
            await fs.unlink(fullPath);
            console.log(`Arquivo físico deletado: ${fullPath}`);
            return true;
          }
        }
      } catch (error) {
        // Ignorar erros de diretório não encontrado
        if (error.code !== 'ENOENT') {
          console.error('Erro ao buscar arquivo:', error);
        }
      }
      return false;
    }
    
    const deleted = await findAndDeleteFile(baseDir);
    return deleted;
  } catch (error) {
    console.error('Erro ao deletar arquivo físico:', error);
    return false;
  }
}

// Exportar configurações
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  STORAGE_BASE
};