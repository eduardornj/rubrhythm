# Sistema de IDs e Organização de Arquivos

## Análise das Entidades que Precisam de IDs Únicos

### Entidades Principais Identificadas no Prisma Schema:

#### 1. **USUÁRIOS E AUTENTICAÇÃO**
- `user` - ID principal do usuário
- `account` - Contas de provedores OAuth
- `session` - Sessões de usuário (NextAuth)
- `verificationtoken` - Tokens de verificação

#### 2. **ANÚNCIOS E CONTEÚDO**
- `listing` - Anúncios/perfis de massagistas
- `review` - Avaliações dos anúncios
- `tip` - Gorjetas enviadas

#### 3. **COMUNICAÇÃO**
- `conversation` - Conversas entre usuários
- `message` - Mensagens individuais
- `chat` - Sistema de chat pago
- `chatmessage` - Mensagens do chat
- `chatpayment` - Pagamentos do chat

#### 4. **VERIFICAÇÃO E SEGURANÇA**
- `verificationrequest` - Solicitações de verificação
- `fraudreport` - Relatórios de fraude
- `suspiciousip` - IPs suspeitos
- `adminnotification` - Notificações administrativas

#### 5. **SISTEMA FINANCEIRO**
- `creditbalance` - Saldo de créditos
- `credittransaction` - Transações de crédito
- `transaction` - Transações gerais
- `escrow` - Sistema de custódia
- `escrowlog` - Logs do escrow

#### 6. **GAMIFICAÇÃO**
- `achievement` - Conquistas
- `userachievement` - Conquistas do usuário
- `usergamification` - Dados de gamificação
- `pointtransaction` - Transações de pontos
- `reward` - Recompensas
- `userreward` - Recompensas do usuário

#### 7. **CAMPANHAS E MARKETING**
- `campaign` - Campanhas publicitárias
- `campaignclick` - Cliques nas campanhas
- `campaignview` - Visualizações das campanhas

#### 8. **NOTIFICAÇÕES**
- `notification` - Notificações do usuário
- `usernotification` - Notificações específicas
- `pushsubscription` - Assinaturas push

## Problemas Identificados no Sistema Atual

### 1. **IDs Inconsistentes**
- Algumas entidades usam `@default(cuid())` (mais seguro)
- Outras usam apenas `String @id` (menos seguro)
- Falta padronização na geração de IDs

### 2. **Organização de Arquivos Caótica**
- Nomes de arquivo sem padrão: `listing-2075efee-9e9e-4f0f-b3c7-464c8679c2e1-1.jpg`
- Dificulta identificação do proprietário
- Não há sequência lógica
- Mistura arquivos temporários com permanentes

### 3. **Falta de Rastreabilidade**
- Impossível saber quem é o dono de uma foto pelo nome
- Não há timestamp no nome do arquivo
- Dificulta auditoria e manutenção

## Proposta de Solução

### 1. **Padronização de IDs Seguros**

#### Usar CUID2 para todas as entidades:
```prisma
model user {
  id String @id @default(cuid())
  // ...
}

model listing {
  id String @id @default(cuid())
  // ...
}
```

#### Vantagens do CUID:
- **Seguro**: Não sequencial, dificulta ataques de enumeração
- **Único**: Globalmente único
- **Ordenável**: Contém timestamp
- **URL-safe**: Pode ser usado em URLs
- **Compacto**: Menor que UUID

### 2. **Sistema de Nomenclatura de Arquivos Organizado**

#### Formato Proposto:
```
{entityType}_{entityId}_{timestamp}_{sequence}.{ext}
```

#### Exemplos Práticos:

**Fotos de Anúncios:**
```
listing_cmfj5kaq80006u1cwrk51waqa_20240115142530_01.jpg
listing_cmfj5kaq80006u1cwrk51waqa_20240115142530_02.jpg
listing_cmfj5kaq80006u1cwrk51waqa_20240115142530_03.jpg
```

**Fotos de Verificação:**
```
verify_cmfj5kapt0000u1cwub24avq8_20240115142530_01.jpg  # Documento ID
verify_cmfj5kapt0000u1cwub24avq8_20240115142530_02.jpg  # Selfie
verify_cmfj5kapt0000u1cwub24avq8_20240115142530_03.jpg  # Documento adicional
```

**Fotos de Perfil:**
```
profile_cmfj5kapt0000u1cwub24avq8_20240115142530_01.jpg
```

### 3. **Estrutura de Pastas Organizada**

```
private/storage/
├── users/
│   ├── profiles/
│   │   └── {year}/
│   │       └── {month}/
│   │           └── profile_{userId}_{timestamp}_{seq}.{ext}
│   ├── listings/
│   │   └── {year}/
│   │       └── {month}/
│   │           └── listing_{listingId}_{timestamp}_{seq}.{ext}
│   └── verification/
│       └── {year}/
│           └── {month}/
│               └── verify_{userId}_{timestamp}_{seq}.{ext}
└── temp/
    └── temp_{sessionId}_{timestamp}_{seq}.{ext}
```

### 4. **Implementação da Lógica de Geração**

#### Função Utilitária:
```javascript
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
```

### 5. **Migração Gradual**

#### Fase 1: Novos Uploads
- Implementar novo sistema para uploads futuros
- Manter compatibilidade com arquivos existentes

#### Fase 2: Migração de Arquivos Existentes
- Script para renomear arquivos existentes
- Atualizar referências no banco de dados

#### Fase 3: Limpeza
- Remover código de compatibilidade
- Padronizar todas as referências

## Benefícios da Implementação

### 1. **Organização**
- Fácil identificação do proprietário
- Sequência lógica e cronológica
- Estrutura hierárquica por data

### 2. **Segurança**
- IDs não sequenciais
- Dificulta ataques de enumeração
- Rastreabilidade completa

### 3. **Manutenção**
- Fácil limpeza de arquivos antigos
- Auditoria simplificada
- Backup e restore organizados

### 4. **Performance**
- Busca otimizada por estrutura de pastas
- Cache mais eficiente
- Menor overhead de I/O

## Próximos Passos

1. ✅ Análise completa das entidades
2. 🔄 Implementar funções utilitárias
3. 🔄 Criar sistema de upload organizado
4. 🔄 Migrar arquivos existentes
5. 🔄 Atualizar APIs e interfaces
6. 🔄 Testes e validação

---


**Status:** 📋 Planejamento Completo  
**Próxima ação:** Implementação das funções utilitárias