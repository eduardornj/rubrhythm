// Middleware para captura automática de erros nas APIs
const logger = require('./logger');

// Wrapper para APIs que captura erros automaticamente
export function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      // Log da requisição
      logger.api(`${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
      });

      const result = await handler(req, res);

      // Log de sucesso
      logger.api(`${req.method} ${req.url} - Success`, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      // Log do erro
      logger.error(`API Error: ${req.method} ${req.url}`, error, {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        body: req.body,
        query: req.query,
        params: req.params,
        timestamp: new Date().toISOString()
      });

      // Resposta de erro padronizada
      const statusCode = error.statusCode || 500;
      const message = process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : error.message;

      return res.status(statusCode).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }
  };
}

// Middleware para validação de sessão com logs
export function withAuth(handler) {
  return withErrorHandler(async (req, res) => {
    const { auth } = await import('@/auth');

    const session = await auth();

    if (!session) {
      logger.auth('Tentativa de acesso não autorizado', {
        method: req.method,
        url: req.url,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({
        success: false,
        error: 'Não autorizado',
        timestamp: new Date().toISOString()
      });
    }

    logger.auth('Acesso autorizado', {
      userId: session.user.id,
      userEmail: session.user.email,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });

    req.session = session;
    return handler(req, res);
  });
}

// Middleware para validação de admin
export function withAdminAuth(handler) {
  return withAuth(async (req, res) => {
    if (req.session.user.role !== 'ADMIN') {
      logger.auth('Tentativa de acesso admin não autorizado', {
        userId: req.session.user.id,
        userEmail: req.session.user.email,
        userRole: req.session.user.role,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        success: false,
        error: 'Acesso negado - Privilégios de admin necessários',
        timestamp: new Date().toISOString()
      });
    }

    logger.auth('Acesso admin autorizado', {
      userId: req.session.user.id,
      userEmail: req.session.user.email,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });

    return handler(req, res);
  });
}

// Função para log de operações do banco de dados
export function logDatabaseOperation(operation, table, data = {}) {
  logger.database(`${operation} em ${table}`, {
    operation,
    table,
    data: JSON.stringify(data),
    timestamp: new Date().toISOString()
  });
}

// Função para log de operações de gamificação
export function logGamificationEvent(event, userId, data = {}) {
  logger.gamification(`Evento: ${event}`, {
    event,
    userId,
    data: JSON.stringify(data),
    timestamp: new Date().toISOString()
  });
}