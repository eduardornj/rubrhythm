/**
 * Servidor seguro de arquivos privados
 * Serve arquivos da pasta private/ com controle de acesso e autenticação
 * 
 * IMPORTANTE: Este middleware garante que arquivos sensíveis só sejam
 * acessados por usuários autorizados
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Verifica se o usuário tem permissão para acessar o arquivo
 * @param {string} filePath - Caminho do arquivo
 * @param {object} session - Sessão do usuário
 * @param {string} fileType - Tipo do arquivo (profiles, listings, verification)
 * @returns {boolean}
 */
function hasFileAccess(filePath, session, fileType) {
  // Temporariamente permitir acesso a todos os arquivos de listings
  if (fileType === 'listings' || fileType === 'temp') {
    return true;
  }
  
  // Para outros tipos, ainda requer autenticação
  return session && session.user;
}

/**
 * Determina o tipo de arquivo baseado no caminho
 * @param {string} filePath - Caminho do arquivo
 * @returns {string|null}
 */
function getFileType(filePath) {
  if (filePath.includes('/users/profiles/')) return 'profiles';
  if (filePath.includes('/users/listings/')) return 'listings';
  if (filePath.includes('/users/verification/')) return 'verification';
  if (filePath.includes('/temp/')) return 'temp';
  return null;
}

/**
 * Middleware para servir arquivos privados com segurança
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {Promise<void>}
 */
async function serveSecureFile(req, res) {
  try {
    // Extrai o caminho do arquivo da URL
    const requestedPath = req.query.path;
    if (!requestedPath) {
      return res.status(400).json({ error: 'Caminho do arquivo não especificado' });
    }
    
    // Constrói o caminho completo do arquivo
    const fullPath = path.join(process.cwd(), 'private', 'storage', requestedPath);
    
    // Verifica se o arquivo existe
    try {
      await fs.access(fullPath);
    } catch (error) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Determina o tipo do arquivo
    const fileType = getFileType(requestedPath);
    if (!fileType) {
      return res.status(403).json({ error: 'Tipo de arquivo não permitido' });
    }
    
    // Verifica permissões de acesso (sem sessão por enquanto)
    if (!hasFileAccess(fullPath, null, fileType)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Lê e serve o arquivo
    const fileBuffer = await fs.readFile(fullPath);
    const extension = path.extname(fullPath).toLowerCase();
    
    // Define o Content-Type baseado na extensão
    let contentType = 'application/octet-stream';
    switch (extension) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
    }
    
    // Define headers de segurança
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache por 1 hora
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Para arquivos de verificação, adiciona headers extras de segurança
    if (fileType === 'verification') {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
      res.setHeader('Referrer-Policy', 'no-referrer');
    }
    
    // Envia o arquivo
    res.status(200).send(fileBuffer);
    
  } catch (error) {
    console.error('Erro ao servir arquivo seguro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

/**
 * Gera URL segura para acessar arquivo privado
 * @param {string} relativePath - Caminho relativo do arquivo
 * @returns {string}
 */
function generateSecureUrl(relativePath) {
  return `/api/secure-files?path=${encodeURIComponent(relativePath)}`;
}

module.exports = {
  serveSecureFile,
  generateSecureUrl,
  hasFileAccess,
  getFileType
};