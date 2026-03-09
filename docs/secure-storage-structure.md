# Estrutura de Armazenamento Seguro de Arquivos

## Visão Geral

Este documento descreve a nova estrutura de armazenamento seguro implementada para fotos de usuários e documentos de verificação, seguindo as melhores práticas de segurança para aplicações web.

## Estrutura de Pastas

### Diretório Base Privado
```
private/
└── storage/
    ├── temp/                    # Arquivos temporários
    └── users/
        ├── profiles/            # Fotos de perfil
        │   └── avatars/         # Avatars de usuários
        ├── listings/            # Fotos de anúncios
        └── verification/        # Documentos de verificação
            └── {userId}/
                └── {year}/
                    └── {month}/
                        └── {timestamp}/
```

### Características de Segurança

1. **Armazenamento Privado**: Todos os arquivos são armazenados fora do diretório `public/`, impedindo acesso direto via URL.

2. **Controle de Acesso**: Arquivos são servidos através da API `/api/secure-files` com autenticação e autorização.

3. **Nomes de Arquivo Seguros**: Geração automática de nomes únicos e seguros para prevenir conflitos e ataques.

4. **Validação Rigorosa**: Verificação de tipos MIME, magic numbers e tamanhos de arquivo.

## Configuração de Armazenamento

### Tipos de Arquivo por Categoria

#### Perfis de Usuário
- **Localização**: `private/storage/users/profiles/`
- **Tamanho Máximo**: 5MB
- **Tipos Permitidos**: JPEG, PNG, WebP
- **Processamento**: Redimensionamento automático para 200x200px

#### Fotos de Anúncios
- **Localização**: `private/storage/users/listings/`
- **Tamanho Máximo**: 10MB
- **Tipos Permitidos**: JPEG, PNG, WebP
- **Limite**: Máximo 10 imagens por anúncio

#### Documentos de Verificação
- **Localização**: `private/storage/users/verification/{userId}/{year}/{month}/{timestamp}/`
- **Tamanho Máximo**: 15MB
- **Tipos Permitidos**: JPEG, PNG, PDF
- **Retenção**: 1 ano
- **Segurança Extra**: Headers de segurança adicionais

## API de Acesso Seguro

### Endpoint Principal
```
GET /api/secure-files?path={filePath}&type={fileType}
```

### Parâmetros
- `path`: Caminho relativo do arquivo dentro da estrutura privada
- `type`: Tipo de arquivo (profiles, listings, verification, temp)

### Exemplo de URLs
```
# Foto de perfil
/api/secure-files?path=users/profiles/profile_1234567890_abc123.jpg&type=profiles

# Foto de anúncio
/api/secure-files?path=users/listings/listing_1234567890_def456.jpg&type=listings

# Documento de verificação
/api/secure-files?path=users/verification/user123/2024/01/1234567890/idDocument_1234567890_ghi789.jpg&type=verification
```

## Controle de Acesso

### Autenticação
- Todos os arquivos requerem autenticação via NextAuth
- Sessão válida obrigatória para acesso

### Autorização por Tipo

#### Fotos de Perfil
- Usuário pode acessar apenas suas próprias fotos
- Administradores têm acesso total

#### Fotos de Anúncios
- Proprietário do anúncio tem acesso total
- Outros usuários autenticados podem visualizar
- Administradores têm acesso total

#### Documentos de Verificação
- Apenas o proprietário e administradores
- Headers de segurança extras (no-index, no-referrer)

## Headers de Segurança

### Headers Padrão
```
Content-Type: [tipo apropriado]
Cache-Control: private, max-age=3600
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

### Headers Extras para Verificação
```
X-Robots-Tag: noindex, nofollow, noarchive, nosnippet
Referrer-Policy: no-referrer
```

## Migração de Dados

### Script de Migração
O script `scripts/migrate-image-urls.js` foi executado para:

1. **Atualizar URLs de Usuários**: Converter `/uploads/profile-*` para URLs seguras
2. **Atualizar URLs de Anúncios**: Converter `/uploads/listing-*` para URLs seguras
3. **Manter Compatibilidade**: URLs antigas são automaticamente redirecionadas

### Resultado da Migração
- ✅ Imagens de perfil migradas
- ✅ Imagens de anúncios migradas (2 listings atualizados)
- ✅ Estrutura de pastas criada
- ✅ Arquivos movidos para local seguro

## Arquivos de Configuração

### `lib/storage-config.js`
- Configurações centralizadas de armazenamento
- Funções utilitárias para geração de nomes seguros
- Validação de tipos e tamanhos

### `lib/secure-file-server.js`
- Middleware de servimento seguro
- Controle de acesso e autenticação
- Geração de headers de segurança

### `app/api/secure-files/route.js`
- Endpoint principal para acesso a arquivos
- Integração com NextAuth
- Tratamento de erros e logs

## Benefícios de Segurança

1. **Prevenção de Acesso Direto**: Arquivos não podem ser acessados diretamente via URL
2. **Controle Granular**: Permissões específicas por tipo de arquivo e usuário
3. **Auditoria**: Logs de acesso para monitoramento
4. **Validação Rigorosa**: Verificação de conteúdo além do tipo MIME
5. **Headers de Segurança**: Proteção contra ataques comuns
6. **Organização Temporal**: Estrutura hierárquica para documentos de verificação

## Manutenção

### Limpeza Automática
- Arquivos temporários são limpos automaticamente
- Documentos de verificação seguem política de retenção

### Monitoramento
- Logs de acesso e erros
- Relatórios de uso de espaço
- Alertas de tentativas de acesso não autorizado

## Considerações de Performance

1. **Cache**: Headers de cache apropriados para reduzir carga
2. **Compressão**: Imagens são otimizadas automaticamente
3. **Lazy Loading**: Recomendado para listas com muitas imagens
4. **CDN**: Pode ser implementado futuramente para arquivos públicos

---

**Implementado em**: Janeiro 2024  
**Versão**: 1.0  
**Status**: ✅ Ativo e Funcional