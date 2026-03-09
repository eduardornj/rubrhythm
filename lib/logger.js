// Sistema de logs para debugging e monitoramento
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, content);
  }

  info(message, meta = {}) {
    const logMessage = this.formatMessage('INFO', message, meta);
    console.log(`[INFO] ${message}`, meta);
    this.writeToFile('app.log', logMessage);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = error ? {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      ...meta
    } : meta;
    
    const logMessage = this.formatMessage('ERROR', message, errorMeta);
    console.error(`[ERROR] ${message}`, errorMeta);
    this.writeToFile('error.log', logMessage);
    this.writeToFile('app.log', logMessage);
  }

  warn(message, meta = {}) {
    const logMessage = this.formatMessage('WARN', message, meta);
    console.warn(`[WARN] ${message}`, meta);
    this.writeToFile('app.log', logMessage);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = this.formatMessage('DEBUG', message, meta);
      console.debug(`[DEBUG] ${message}`, meta);
      this.writeToFile('debug.log', logMessage);
    }
  }

  // Logs específicos para diferentes módulos
  auth(message, meta = {}) {
    const logMessage = this.formatMessage('AUTH', message, meta);
    console.log(`[AUTH] ${message}`, meta);
    this.writeToFile('auth.log', logMessage);
    this.writeToFile('app.log', logMessage);
  }

  database(message, meta = {}) {
    const logMessage = this.formatMessage('DB', message, meta);
    console.log(`[DB] ${message}`, meta);
    this.writeToFile('database.log', logMessage);
    this.writeToFile('app.log', logMessage);
  }

  api(message, meta = {}) {
    const logMessage = this.formatMessage('API', message, meta);
    console.log(`[API] ${message}`, meta);
    this.writeToFile('api.log', logMessage);
    this.writeToFile('app.log', logMessage);
  }

  gamification(message, meta = {}) {
    const logMessage = this.formatMessage('GAMIFICATION', message, meta);
    console.log(`[GAMIFICATION] ${message}`, meta);
    this.writeToFile('gamification.log', logMessage);
    this.writeToFile('app.log', logMessage);
  }

  // Método para limpar logs antigos
  cleanOldLogs(daysToKeep = 7) {
    const files = fs.readdirSync(this.logDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    files.forEach(file => {
      const filePath = path.join(this.logDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        this.info(`Log antigo removido: ${file}`);
      }
    });
  }
}

// Instância singleton
const logger = new Logger();

module.exports = logger;