// lib/file-naming.js
import { createId } from '@paralleldrive/cuid2';

export function generateSecureFileName(entityType, entityId, extension, sequence = 1) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const seq = sequence.toString().padStart(2, '0');
  return `${entityType}_${entityId}_${timestamp}_${seq}.${extension}`;
}

export function parseFileName(filename) {
  const parts = filename.split('_');
  if (parts.length >= 4) {
    return {
      entityType: parts[0],
      entityId: parts[1],
      timestamp: parts[2],
      sequence: parts[3].split('.')[0],
      extension: filename.split('.').pop()
    };
  }
  return null;
}

export function generateSecureId() {
  return createId();
}

// Função para gerar caminho de arquivo organizado
export function generateOrganizedPath(entityType, entityId, extension, sequence = 1) {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  const fileName = generateSecureFileName(entityType, entityId, extension, sequence);
  
  // Estrutura: private/storage/users/{entityType}s/{year}/{month}/{fileName}
  const relativePath = `users/${entityType}s/${year}/${month}/${fileName}`;
  
  return {
    fileName,
    relativePath,
    fullPath: `private/storage/${relativePath}`
  };
}

// Função para validar tipos de arquivo
export function validateFileType(file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']) {
  return allowedTypes.includes(file.type);
}

// Função para validar tamanho do arquivo
export function validateFileSize(file, maxSize = 10 * 1024 * 1024) { // 10MB default
  return file.size <= maxSize;
}