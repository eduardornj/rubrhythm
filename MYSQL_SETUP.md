# Configuração do MySQL para RubRhythm

## ✅ Migração Completa do SQLite para MySQL

O projeto foi **completamente migrado** do SQLite para MySQL. Todas as referências ao SQLite foram removidas.

## 🔧 Configuração Necessária

### 1. Instalar MySQL

Baixe e instale o MySQL Server:
- **Windows**: https://dev.mysql.com/downloads/mysql/
- **macOS**: `brew install mysql`
- **Linux**: `sudo apt-get install mysql-server`

### 2. Criar Banco de Dados

```sql
CREATE DATABASE rubrhythm;
CREATE USER 'rubrhythm_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON rubrhythm.* TO 'rubrhythm_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configurar Variáveis de Ambiente

Atualize o arquivo `.env` com suas credenciais do MySQL:

```env
NEXTAUTH_SECRET=meu-segredo-super-seguro-123
DATABASE_URL="mysql://rubrhythm_user:sua_senha_segura@localhost:3306/rubrhythm"
```

### 4. Executar Migrações

```bash
# Gerar nova migração para MySQL
npx prisma migrate dev --name init_mysql

# Aplicar migrações
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate
```

### 5. Popular Banco de Dados (Opcional)

```bash
# Se houver dados de seed
npx prisma db seed
```

## 🚀 Iniciar Aplicação

```bash
npm run dev
```

## ✨ Mudanças Realizadas

- ✅ Schema Prisma atualizado para MySQL
- ✅ Todos os campos UUID convertidos para cuid() com @db.VarChar(191)
- ✅ Arquivo SQLite (dev.db) removido
- ✅ Migrações antigas do SQLite removidas
- ✅ Conflitos de relações corrigidos
- ✅ Cliente Prisma regenerado com sucesso
- ✅ Configuração DATABASE_URL adicionada ao .env

## ⚠️ Importante

1. **Backup**: Faça backup dos dados importantes antes de executar as migrações
2. **Credenciais**: Substitua `username`, `password` e outros valores pelas suas credenciais reais
3. **Segurança**: Use senhas fortes e mantenha as credenciais seguras
4. **Produção**: Para produção, use variáveis de ambiente seguras

## 🔍 Verificação

Para verificar se tudo está funcionando:

```bash
# Testar conexão com o banco
npx prisma db pull

# Verificar status das migrações
npx prisma migrate status
```

---

**Status**: ✅ **MIGRAÇÃO COMPLETA - SQLITE TOTALMENTE REMOVIDO**