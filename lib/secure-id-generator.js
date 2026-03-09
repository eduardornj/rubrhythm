/**
 * Sistema de Geração Segura de IDs e Nomenclatura de Arquivos
 * 
 * Este módulo fornece funções para:
 * 1. Gerar IDs únicos e seguros usando CUID2
 * 2. Criar nomes de arquivos organizados e rastreáveis
 * 3. Parsear informações de nomes de arquivos
 * 4. Validar e sanitizar nomes de arquivos
 */

import crypto from 'crypto';
import path from 'path';

/**
 * Gera um ID único e seguro usando algoritmo personalizado
 * Baseado em CUID2 mas adaptado para nossas necessidades
 * 
 * Formato: {timestamp_base36}{random_chars}{checksum}
 * Exemplo: cmfj5kaq80006u1cwrk51waqa
 */
export function generateSecureId() {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(12).toString('base64url').slice(0, 16);
  const checksum = crypto.createHash('sha256')
    .update(timestamp + randomBytes)
    .digest('base64url')
    .slice(0, 4);

  return `${timestamp}${randomBytes}${checksum}`.toLowerCase();
}

/**
 * Gera nome de arquivo seguro e organizado
 * 
 * @param {string} entityType - Tipo da entidade (listing, profile, verify, temp)
 * @param {string} entityId - ID da entidade
 * @param {string} extension - Extensão do arquivo (sem ponto)
 * @param {number} sequence - Número sequencial (1, 2, 3...)
 * @param {Date} customDate - Data customizada (opcional)
 * @param {object} options - Opções adicionais
 * @returns {string} Nome do arquivo formatado
 */
export function generateSecureFileName(entityType, entityId, extension, sequence = 1, customDate = null, options = {}) {
  // Validar parâmetros
  if (!entityType || !entityId || !extension) {
    throw new Error('entityType, entityId e extension são obrigatórios');
  }

  // Sanitizar inputs
  const cleanEntityType = sanitizeString(entityType);
  const cleanEntityId = sanitizeString(entityId);
  const cleanExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Gerar timestamp
  const date = customDate || new Date();
  let timestamp;

  if (options.customTimestamp) {
    // Formato customizado: MMDDYY (exemplo: 091425 para 14/09/2025)
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    timestamp = `${month}${day}${year}`;
  } else {
    timestamp = date.toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0]; // YYYYMMDDTHHMMSS
  }

  // Formatar sequência
  const seq = sequence.toString().padStart(2, '0');

  // Para verificação, usar formato especial: userId_sequence.ext
  if (entityType === 'verify' || entityType === 'verification') {
    return `${cleanEntityId}_${seq}.${cleanExtension}`;
  }

  return `${cleanEntityType}_${cleanEntityId}_${timestamp}_${seq}.${cleanExtension}`;
}

/**
 * Parseia um nome de arquivo para extrair informações
 * 
 * @param {string} filename - Nome do arquivo
 * @returns {object|null} Objeto com informações ou null se inválido
 */
export function parseFileName(filename) {
  if (!filename || typeof filename !== 'string') {
    return null;
  }

  // Padrão especial para verificação: userId_sequence.extension
  const verificationRegex = /^([a-z0-9]+)_(\d{2})\.([a-z0-9]+)$/i;
  const verificationMatch = filename.match(verificationRegex);

  if (verificationMatch) {
    const [, entityId, sequence, extension] = verificationMatch;
    return {
      entityType: 'verify',
      entityId,
      sequence: parseInt(sequence),
      extension,
      timestamp: null,
      date: null,
      isValid: true
    };
  }

  // Padrão normal: entityType_entityId_timestamp_sequence.extension
  const normalRegex = /^([a-z]+)_([a-z0-9]+)_([\dT]{6,15})_(\d{2})\.([a-z0-9]+)$/i;
  const normalMatch = filename.match(normalRegex);

  if (!normalMatch) {
    return null;
  }

  const [, entityType, entityId, timestamp, sequence, extension] = normalMatch;

  let date;
  if (timestamp.length === 6) {
    // Formato customizado MMDDYY
    const month = parseInt(timestamp.substr(0, 2)) - 1;
    const day = parseInt(timestamp.substr(2, 2));
    const year = 2000 + parseInt(timestamp.substr(4, 2));
    date = new Date(year, month, day);
  } else {
    // Formato padrão YYYYMMDDTHHMMSS
    const year = parseInt(timestamp.substr(0, 4));
    const month = parseInt(timestamp.substr(4, 2)) - 1;
    const day = parseInt(timestamp.substr(6, 2));
    const hour = parseInt(timestamp.substr(9, 2));
    const minute = parseInt(timestamp.substr(11, 2));
    const second = parseInt(timestamp.substr(13, 2));
    date = new Date(year, month, day, hour, minute, second);
  }

  return {
    entityType,
    entityId,
    timestamp,
    date,
    sequence: parseInt(sequence),
    extension,
    isValid: true
  };
}

/**
 * Gera caminho de pasta organizado por data
 * 
 * @param {string} baseDir - Diretório base
 * @param {string} entityType - Tipo da entidade
 * @param {Date} date - Data para organização
 * @returns {string} Caminho completo da pasta
 */
export function generateOrganizedPath(baseDir, entityType, date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return path.join(baseDir, entityType, year.toString(), month);
}

/**
 * Sanitiza string para uso em nomes de arquivo
 * 
 * @param {string} str - String para sanitizar
 * @returns {string} String sanitizada
 */
export function sanitizeString(str) {
  if (!str) return '';

  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 50); // Limitar tamanho
}

/**
 * Valida se um nome de arquivo segue o padrão esperado
 * 
 * @param {string} filename - Nome do arquivo
 * @returns {boolean} True se válido
 */
export function isValidSecureFileName(filename) {
  const parsed = parseFileName(filename);
  return parsed !== null && parsed.isValid;
}

/**
 * Gera múltiplos nomes de arquivo para uma sequência
 * 
 * @param {string} entityType - Tipo da entidade
 * @param {string} entityId - ID da entidade
 * @param {string} extension - Extensão do arquivo
 * @param {number} count - Quantidade de arquivos
 * @param {Date} customDate - Data customizada (opcional)
 * @returns {Array<string>} Array com nomes de arquivos
 */
export function generateFileSequence(entityType, entityId, extension, count, customDate = null) {
  const files = [];

  for (let i = 1; i <= count; i++) {
    files.push(generateSecureFileName(entityType, entityId, extension, i, customDate));
  }

  return files;
}

/**
 * Configurações padrão para diferentes tipos de entidade
 */
export const ENTITY_CONFIGS = {
  listing: {
    maxFiles: 10,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    basePath: 'private/storage/users/listings'
  },
  listings: { // Alias for widespread bad API usage
    maxFiles: 10,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    basePath: 'private/storage/users/listings'
  },
  profile: {
    maxFiles: 1,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    basePath: 'private/storage/users/profiles'
  },
  profiles: { // Alias for widespread bad API usage
    maxFiles: 1,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    basePath: 'private/storage/users/profiles'
  },
  verify: {
    maxFiles: 5,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    maxSize: 15 * 1024 * 1024, // 15MB
    basePath: 'private/storage/users/verification'
  },
  verification: {
    maxFiles: 5,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    maxSize: 15 * 1024 * 1024, // 15MB
    basePath: 'private/storage/users/verification'
  },
  temp: {
    maxFiles: 20,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    maxSize: 20 * 1024 * 1024, // 20MB
    basePath: 'private/storage/temp',
    ttl: 24 * 60 * 60 * 1000 // 24 horas
  }
};

/**
 * Valida arquivo baseado na configuração da entidade
 * 
 * @param {string} entityType - Tipo da entidade
 * @param {string} extension - Extensão do arquivo
 * @param {number} size - Tamanho do arquivo em bytes
 * @returns {object} Resultado da validação
 */
export function validateFile(entityType, extension, size) {
  const config = ENTITY_CONFIGS[entityType];

  if (!config) {
    return {
      valid: false,
      error: `Tipo de entidade '${entityType}' não suportado`
    };
  }

  const cleanExtension = extension.toLowerCase().replace('.', '');

  if (!config.allowedExtensions.includes(cleanExtension)) {
    return {
      valid: false,
      error: `Extensão '${extension}' não permitida para ${entityType}. Permitidas: ${config.allowedExtensions.join(', ')}`
    };
  }

  if (size > config.maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${(config.maxSize / 1024 / 1024).toFixed(1)}MB`
    };
  }

  return {
    valid: true,
    config
  };
}

/**
 * Exemplos de uso:
 * 
 * // Gerar ID seguro
 * const userId = generateSecureId();
 * // Resultado: "cmfj5kapt0000u1cwub24avq8"
 * 
 * // Gerar nome de arquivo para listing
 * const filename = generateSecureFileName('listing', userId, 'jpg', 1);
 * // Resultado: "listing_cmfj5kapt0000u1cwub24avq8_20240115142530_01.jpg"
 * 
 * // Parsear nome de arquivo
 * const info = parseFileName(filename);
 * // Resultado: { entityType: 'listing', entityId: 'cmfj5kapt0000u1cwub24avq8', ... }
 * 
 * // Gerar sequência de arquivos para verificação
 * const verifyFiles = generateFileSequence('verify', userId, 'jpg', 3);
 * // Resultado: [
 * //   "verify_cmfj5kapt0000u1cwub24avq8_20240115142530_01.jpg",
 * //   "verify_cmfj5kapt0000u1cwub24avq8_20240115142530_02.jpg",
 * //   "verify_cmfj5kapt0000u1cwub24avq8_20240115142530_03.jpg"
 * // ]
 */

// Exportar configurações para uso externo
export { ENTITY_CONFIGS as FILE_CONFIGS };

// Função helper para migração de arquivos existentes
export function generateMigrationMapping(oldFilename, entityType, entityId) {
  const extension = path.extname(oldFilename).slice(1);
  const newFilename = generateSecureFileName(entityType, entityId, extension);

  return {
    oldFilename,
    newFilename,
    entityType,
    entityId,
    extension
  };
}