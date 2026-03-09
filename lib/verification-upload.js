// Sistema organizado de upload de documentos de verificação
// Baseado em melhores práticas de segurança e organização de arquivos

import { writeFile, mkdir, access, unlink } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Configurações de segurança
const ALLOWED_FILE_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf'
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_BASE_DIR = 'private/storage/users';

/**
 * Classe para gerenciar uploads de verificação de forma organizada
 */
export class VerificationUploadManager {
  constructor() {
    this.baseDir = path.join(process.cwd(), UPLOAD_BASE_DIR);
  }

  /**
   * Gera estrutura de pastas organizada:
   * uploads/verification/{userId}/{year}/{month}/{timestamp}/
   */
  generateUploadPath(userId) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime();

    return {
      relativePath: `verification/${userId}/${year}/${month}/${timestamp}`,
      fullPath: path.join(this.baseDir, 'verification', userId, String(year), month, String(timestamp)),
      timestamp
    };
  }

  /**
   * Valida arquivo de upload com verificações de segurança avançadas
   */
  validateFile(file, fieldName) {
    const errors = [];

    // Verificar se arquivo existe
    if (!file || file.size === 0) {
      errors.push(`${fieldName} é obrigatório`);
      return errors;
    }

    // Verificar tamanho mínimo (evitar arquivos muito pequenos)
    if (file.size < 1024) { // 1KB mínimo
      errors.push(`${fieldName} é muito pequeno (mínimo 1KB)`);
    }

    // Verificar tamanho máximo
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${fieldName} excede o tamanho máximo de 5MB`);
    }

    // Verificar tipo MIME
    if (!ALLOWED_FILE_TYPES[file.type]) {
      errors.push(`${fieldName} deve ser JPG, PNG, WEBP ou PDF`);
    }

    // Verificar extensão do nome do arquivo
    let fileExtension = path.extname(file.name).toLowerCase();
    // Normalize .jpeg to .jpg
    if (fileExtension === '.jpeg') fileExtension = '.jpg';
    const allowedExtensions = Object.values(ALLOWED_FILE_TYPES);
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`Extensão de arquivo inválida para ${fieldName}`);
    }

    // Verificar se extensão corresponde ao tipo MIME
    const expectedExtension = ALLOWED_FILE_TYPES[file.type];
    if (expectedExtension && fileExtension !== expectedExtension) {
      errors.push(`Tipo de arquivo inconsistente para ${fieldName} (Esperado: ${expectedExtension}, Recebido: ${fileExtension})`);
    }

    // Validar nome do arquivo (sem caracteres perigosos)
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.name)) {
      errors.push(`Nome de arquivo contém caracteres inválidos para ${fieldName}`);
    }

    // Verificar se o nome não é muito longo
    if (file.name.length > 255) {
      errors.push(`Nome de arquivo muito longo para ${fieldName}`);
    }

    return errors;
  }

  /**
   * Validação adicional de conteúdo do arquivo (magic numbers)
   */
  async validateFileContent(file, fieldName) {
    const errors = [];

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Verificar magic numbers para diferentes tipos de arquivo
      if (file.type.startsWith('image/jpeg') || file.type === 'image/jpg') {
        // JPEG magic numbers: FF D8 FF
        if (bytes.length < 3 || bytes[0] !== 0xFF || bytes[1] !== 0xD8 || bytes[2] !== 0xFF) {
          errors.push(`${fieldName} não é um arquivo JPEG válido`);
        }
      } else if (file.type === 'image/png') {
        // PNG magic numbers: 89 50 4E 47 0D 0A 1A 0A
        const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        if (bytes.length < 8) {
          errors.push(`${fieldName} não é um arquivo PNG válido`);
        } else {
          for (let i = 0; i < 8; i++) {
            if (bytes[i] !== pngSignature[i]) {
              errors.push(`${fieldName} não é um arquivo PNG válido`);
              break;
            }
          }
        }
      } else if (file.type === 'image/webp') {
        // WebP magic numbers: RIFF .... WEBP
        if (bytes.length < 12) {
          errors.push(`${fieldName} não é um arquivo WebP válido`);
        } else {
          const riff = [0x52, 0x49, 0x46, 0x46]; // 'R', 'I', 'F', 'F'
          const webp = [0x57, 0x45, 0x42, 0x50]; // 'W', 'E', 'B', 'P'
          let valid = true;
          for (let i = 0; i < 4; i++) {
            if (bytes[i] !== riff[i] || bytes[i + 8] !== webp[i]) valid = false;
          }
          if (!valid) errors.push(`${fieldName} não é um arquivo WebP válido`);
        }
      } else if (file.type === 'application/pdf') {
        // PDF magic numbers: %PDF
        const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
        if (bytes.length < 4) {
          errors.push(`${fieldName} não é um arquivo PDF válido`);
        } else {
          for (let i = 0; i < 4; i++) {
            if (bytes[i] !== pdfSignature[i]) {
              errors.push(`${fieldName} não é um arquivo PDF válido`);
              break;
            }
          }
        }
      }
    } catch (error) {
      errors.push(`Erro ao validar conteúdo do arquivo ${fieldName}`);
    }

    return errors;
  }

  /**
   * Gera nome de arquivo seguro e único
   */
  generateSecureFilename(originalName, fieldName, timestamp) {
    const extension = path.extname(originalName).toLowerCase();
    const randomHash = crypto.randomBytes(8).toString('hex');
    return `${fieldName}_${timestamp}_${randomHash}${extension}`;
  }

  /**
   * Cria diretório se não existir
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await access(dirPath);
    } catch {
      await mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Salva arquivo de forma segura
   */
  async saveFile(file, uploadPath, filename) {
    try {
      // Criar diretório se necessário
      await this.ensureDirectoryExists(uploadPath.fullPath);

      // Converter arquivo para buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Caminho completo do arquivo
      const fullFilePath = path.join(uploadPath.fullPath, filename);

      // Salvar arquivo
      await writeFile(fullFilePath, buffer);

      // Retornar URL segura para acesso via API
      return `/api/secure-files?path=${uploadPath.relativePath}/${filename}&type=verification`;
    } catch (error) {
      console.error('Erro ao salvar arquivo:', error);
      throw new Error('Falha ao salvar arquivo');
    }
  }

  /**
   * Processa múltiplos arquivos de verificação
   */
  async processVerificationFiles(userId, files) {
    const uploadPath = this.generateUploadPath(userId);
    const savedFiles = {};
    const errors = [];

    // Definir campos obrigatórios e opcionais
    const requiredFields = ['idDocument', 'selfiePhoto'];
    const optionalFields = ['businessLicense', 'proofOfAddress', 'additionalDocument'];
    const allFields = [...requiredFields, ...optionalFields];

    // Validar arquivos obrigatórios
    for (const fieldName of requiredFields) {
      const file = files[fieldName];
      if (!file || file.size === 0) {
        errors.push(`${fieldName} é obrigatório`);
      }
    }

    // Validar todos os arquivos fornecidos (validação básica)
    for (const fieldName of allFields) {
      const file = files[fieldName];
      if (file && file.size > 0) {
        const fileErrors = this.validateFile(file, fieldName);
        errors.push(...fileErrors);
      }
    }

    // Se houver erros de validação básica, retornar
    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Validação avançada de conteúdo (magic numbers)
    for (const fieldName of allFields) {
      const file = files[fieldName];
      if (file && file.size > 0) {
        const contentErrors = await this.validateFileContent(file, fieldName);
        errors.push(...contentErrors);
      }
    }

    // Se houver erros de validação de conteúdo, retornar
    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Salvar arquivos válidos
    for (const fieldName of allFields) {
      const file = files[fieldName];
      if (file && file.size > 0) {
        try {
          const filename = this.generateSecureFilename(file.name, fieldName, uploadPath.timestamp);
          const filePath = await this.saveFile(file, uploadPath, filename);
          savedFiles[fieldName] = {
            path: filePath,
            originalName: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          };
        } catch (error) {
          errors.push(`Erro ao salvar ${fieldName}: ${error.message}`);
        }
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      files: savedFiles,
      uploadPath: uploadPath.relativePath
    };
  }

  /**
   * Remove arquivos de verificação (para limpeza)
   */
  async removeVerificationFiles(filePaths) {
    const errors = [];

    for (const filePath of filePaths) {
      try {
        const fullPath = path.join(this.baseDir, filePath.replace(/^\//, ''));
        await unlink(fullPath);
      } catch (error) {
        console.error(`Erro ao remover arquivo ${filePath}:`, error);
        errors.push(`Falha ao remover ${filePath}`);
      }
    }

    return errors;
  }

  /**
   * Gera relatório de uso de espaço
   */
  async getStorageReport(userId = null) {
    // Implementar relatório de uso de espaço se necessário
    // Por enquanto, retorna estrutura básica
    return {
      totalFiles: 0,
      totalSize: 0,
      byUser: userId ? {} : null
    };
  }
}

// Instância singleton
export const verificationUploadManager = new VerificationUploadManager();

// Função helper para uso direto
export async function processVerificationUpload(userId, files) {
  return await verificationUploadManager.processVerificationFiles(userId, files);
}

// Configurações exportadas
export const VERIFICATION_CONFIG = {
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  REQUIRED_FIELDS: ['idDocument', 'selfiePhoto'],
  OPTIONAL_FIELDS: ['businessLicense', 'proofOfAddress', 'additionalDocument']
};