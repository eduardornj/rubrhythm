📋 RubRhythm - Estrutura Completa do Projeto
🏗️ ESTRUTURA DE ARQUIVOS COMPLETA
# 📋 RubRhythm - Estrutura Completa do Projeto

## 🏗️ **ESTRUTURA COMPLETA DE ARQUIVOS E PASTAS**

```
rubrhythm/
├── 📁 .next/                        # Build files do Next.js (gerado automaticamente)
│   ├── build-manifest.json
│   ├── 📁 cache/
│   ├── package.json
│   ├── 📁 server/
│   ├── 📁 static/
│   ├── trace
│   └── 📁 types/
├── 📄 .env                          # Variáveis de ambiente (CONFIDENCIAL)
├── 📄 .gitignore                    # Arquivos ignorados pelo Git
├── 📄 MYSQL_SETUP.md                # Instruções de configuração do MySQL
├── 📄 README.md                     # Documentação básica do projeto
├── 📄 add-admin-credits.js          # Script para adicionar créditos ao admin
├── 📁 app/                          # Next.js App Router (Frontend + API)
│   ├── 📁 add-listing/              # Página para adicionar anúncios
│   │   └── page.js
│   ├── 📁 admin/                    # Painel administrativo
│   │   ├── 📁 escrow/               # Gestão de escrow
│   │   ├── 📁 reviews/              # Gestão de reviews
│   │   └── 📁 verification/         # Gestão de verificações
│   ├── 📁 api/                      # API Routes (Backend)
│   │   ├── 📁 admin/                # APIs administrativas
│   │   │   ├── 📁 adjust-credits/
│   │   │   ├── 📁 escrow/
│   │   │   ├── 📁 reviews/
│   │   │   ├── 📁 statistics/
│   │   │   ├── 📁 stats/
│   │   │   ├── 📁 sync-credits/
│   │   │   ├── 📁 user-credits/
│   │   │   ├── 📁 users/
│   │   │   ├── 📁 verification/
│   │   │   └── 📁 verifications/
│   │   ├── 📁 analytics/            # APIs de analytics
│   │   │   ├── 📁 dashboard/
│   │   │   └── 📁 provider/
│   │   ├── 📁 auth/                 # Autenticação NextAuth
│   │   │   ├── 📁 [...nextauth]/
│   │   │   └── 📁 session/
│   │   ├── 📁 campaigns/            # Campanhas promocionais
│   │   ├── 📁 credits/              # Sistema de créditos
│   │   │   ├── 📁 add/
│   │   │   ├── 📁 create-invoice/
│   │   │   ├── 📁 purchase-credits/
│   │   │   ├── 📁 transactions/
│   │   │   └── 📁 webhook-btcpay/
│   │   ├── 📁 escrow/               # Sistema de escrow
│   │   ├── 📁 favorites/            # Sistema de favoritos
│   │   │   ├── 📁 [userId]/
│   │   │   ├── 📁 add/
│   │   │   ├── 📁 check/
│   │   │   └── 📁 remove/
│   │   ├── 📁 gamification/         # Sistema de gamificação
│   │   │   ├── 📁 achievements/
│   │   │   ├── 📁 leaderboard/
│   │   │   ├── 📁 rewards/
│   │   │   └── 📁 stats/
│   │   ├── 📁 listing/              # CRUD de anúncios
│   │   │   ├── 📁 [id]/
│   │   │   ├── 📁 admin/
│   │   │   ├── 📁 approve/
│   │   │   ├── 📁 delete/
│   │   │   ├── 📁 edit/
│   │   │   ├── 📁 feature/
│   │   │   ├── 📁 list/
│   │   │   └── 📁 listing-actions/
│   │   ├── 📁 massagistas/          # API para massagistas
│   │   ├── 📁 massagists/           # API para massagists
│   │   ├── 📁 messages/             # Sistema de mensagens
│   │   │   ├── 📁 [conversationId]/
│   │   │   ├── 📁 conversations/
│   │   │   └── 📁 send/
│   │   ├── 📁 my-listings/          # Meus anúncios
│   │   ├── 📁 notifications/        # Sistema de notificações
│   │   │   ├── 📁 [id]/
│   │   │   ├── 📁 admin/
│   │   │   └── 📁 read-all/
│   │   ├── 📁 payments/             # Histórico de pagamentos
│   │   │   └── 📁 history/
│   │   ├── 📁 push/                 # Notificações push
│   │   │   ├── 📁 send/
│   │   │   └── 📁 subscribe/
│   │   ├── 📁 register/             # Registro de usuários
│   │   ├── 📁 reviews/              # Sistema de reviews
│   │   ├── 📁 security/             # Logs de segurança
│   │   │   ├── 📁 fraud/
│   │   │   ├── 📁 ips/
│   │   │   └── 📁 logs/
│   │   ├── 📁 settings/             # Configurações
│   │   │   └── 📁 global/
│   │   ├── 📁 states/               # Estados e cidades
│   │   │   └── 📁 [state]/
│   │   ├── 📁 statistics/           # Estatísticas
│   │   ├── 📁 submit-verification/  # Submissão de verificação
│   │   │   ├── 📁 approve/
│   │   │   ├── 📁 delete/
│   │   │   ├── 📁 reject/
│   │   │   └── 📁 status/
│   │   ├── 📁 transactions/         # Transações
│   │   ├── 📁 upload/               # Upload de arquivos
│   │   │   └── 📁 profile-photo/
│   │   ├── 📁 user/                 # Gestão de usuários
│   │   │   ├── 📁 [id]/
│   │   │   ├── 📁 ban/
│   │   │   ├── 📁 ban-status/
│   │   │   ├── 📁 delete/
│   │   │   ├── 📁 edit/
│   │   │   ├── 📁 list/
│   │   │   ├── 📁 settings/
│   │   │   ├── 📁 upload-photo/
│   │   │   └── 📁 verify/
│   │   └── 📁 verification/          # Sistema de verificação
│   │       ├── 📁 approve/
│   │       ├── 📁 request/
│   │       └── 📁 status/
│   ├── 📁 banned/                   # Página para usuários banidos
│   │   └── page.js
│   ├── 📁 components/               # Componentes específicos de páginas
│   │   ├── AnonymousMessaging.js
│   │   ├── EscrowSystem.js
│   │   ├── FavoriteButton.js
│   │   ├── MyAccountLayout.js
│   │   ├── PhotoGallery.js
│   │   ├── ReviewSystem.js
│   │   ├── VerificationBadge.js
│   │   └── VerificationRequest.js
│   ├── 📁 dashboard/                # Dashboard administrativo
│   │   ├── 📁 analytics/
│   │   ├── 📁 components/
│   │   ├── 📁 credits/
│   │   ├── 📁 escrow/
│   │   ├── 📁 listings/
│   │   ├── 📁 notifications/
│   │   ├── page.js
│   │   ├── 📁 reviews/
│   │   ├── 📁 security/
│   │   ├── 📁 settings/
│   │   ├── 📁 statistics/
│   │   ├── 📁 sync-credits/
│   │   ├── 📁 users/
│   │   ├── 📁 verification/
│   │   └── 📁 verifications/
│   ├── favicon.ico                  # Ícone do site
│   ├── 📁 favorites/                # Página de favoritos
│   │   └── page.js
│   ├── 📁 gamification/             # Sistema de gamificação
│   │   ├── 📁 how-it-works/
│   │   └── page.js
│   ├── 📁 get-verified/             # Página de verificação
│   │   └── page.js
│   ├── globals.css                  # Estilos globais
│   ├── 📁 info/                     # Páginas informativas
│   │   ├── 📁 anti-trafficking/
│   │   ├── 📁 eccie/
│   │   ├── 📁 get-help-from-staff/
│   │   ├── 📁 law-and-legal/
│   │   ├── 📁 rubmd/
│   │   ├── 📁 section-2257/
│   │   └── 📁 terms/
│   ├── layout.tsx                   # Layout principal
│   ├── 📁 letter-from-staff/        # Carta da equipe
│   │   └── page.js
│   ├── 📁 listing/                  # Páginas de anúncios
│   │   └── 📁 [id]/
│   ├── 📁 login/                    # Página de login
│   │   └── page.js
│   ├── 📁 messages/                 # Página de mensagens
│   │   └── page.js
│   ├── 📁 my-account/               # Área do usuário
│   │   ├── 📁 favorites/            # Favoritos do usuário
│   │   ├── page.js
│   │   ├── 📁 payment-history/      # Histórico de pagamentos
│   │   └── 📁 settings/             # Configurações do usuário
│   ├── 📁 my-listings/              # Meus anúncios
│   │   ├── 📁 bump-up/
│   │   ├── 📁 feature/
│   │   ├── 📁 highlight/
│   │   └── page.js
│   ├── page.js                      # Página inicial
│   ├── 📁 provider/                 # Dashboard do provedor
│   │   └── 📁 dashboard/
│   ├── 📁 register-on-rubrhythm/    # Página de registro
│   │   └── page.js
│   ├── 📁 rewards/                  # Página de recompensas
│   │   └── page.js
│   ├── 📁 rubrhythm-credits/        # Sistema de créditos
│   │   ├── page.js
│   │   └── 📁 payment-history/
│   ├── 📁 search-results/           # Resultados de busca
│   │   ├── SearchResultsClient.js
│   │   └── page.js
│   ├── tailwind.css                 # Estilos Tailwind
│   ├── 📁 united-states/            # Páginas por estado/cidade
│   │   └── 📁 [state]/
│   └── 📁 view-cities/              # Visualizar cidades
│       └── page.js
├── 📄 approve-listing.js            # Script para aprovar anúncios
├── 📄 approve-reviews.js            # Script para aprovar reviews
├── 📄 auth.ts                       # Configuração de autenticação
├── 📄 check-admin-credits.js        # Verificar créditos do admin
├── 📄 check-all-users.js            # Verificar todos os usuários
├── 📄 check-apis.js                 # Testar APIs
├── 📄 check-db.js                   # Verificar banco de dados
├── 📄 check-isabella-ban.js         # Verificar banimento específico
├── 📄 check-listing-stats.js        # Verificar estatísticas de anúncios
├── 📄 check-listings.js             # Verificar anúncios
├── 📄 check-reviews.js              # Verificar reviews
├── 📁 components/                   # Componentes globais
│   ├── AdvancedSearchFilters.js     # Filtros de busca avançada
│   ├── BanCheck.js                  # Verificação de banimento
│   ├── ClientFloatingBar.js         # Barra flutuante do cliente
│   ├── DashboardLayout.js           # Layout do dashboard
│   ├── FavoriteButton.js            # Botão de favoritos
│   ├── FloatingBar.js               # Barra flutuante
│   ├── Footer.js                    # Rodapé
│   ├── GamificationSystem.js        # Sistema de gamificação
│   ├── GeoLocationRedirect.js       # Redirecionamento por geolocalização
│   ├── Header.js                    # Cabeçalho
│   ├── MainLayout.js                # Layout principal
│   ├── NotificationManager.tsx      # Gerenciador de notificações
│   ├── PWAManager.tsx               # Gerenciador PWA
│   ├── PromotionalCampaigns.js      # Campanhas promocionais
│   ├── ProviderAnalytics.js         # Analytics do provedor
│   ├── SearchBar.js                 # Barra de busca
│   ├── SessionWrapper.tsx           # Wrapper de sessão
│   └── 📁 dashboard/                # Componentes do dashboard
├── 📄 comprehensive-test.js         # Teste abrangente
├── 📄 create_admin.sql              # Script SQL para criar admin
├── 📁 data/                         # Dados estáticos
│   └── datalocations.js             # Dados de localização
├── 📄 debug-reviews.js              # Debug de reviews
├── 📁 docs/                         # Documentação
│   ├── analise-comparativa-monetizacao.md
│   ├── Credits-BumpUp.md
│   ├── Credits-FEATURE.md
│   └── payment-history.md
├── 📄 eslint.config.mjs             # Configuração do ESLint
├── 📄 final-test-report.md          # Relatório final de testes
├── 📄 find-isabella.js              # Script para encontrar usuário específico
├── 📄 fix-all-credits.js            # Corrigir todos os créditos
├── 📄 fix-isabella-credits.js       # Corrigir créditos específicos
├── 📄 fix-listing-stats.js          # Corrigir estatísticas de anúncios
├── 📄 fix-mysql-connections.js      # Corrigir conexões MySQL
├── 📄 fix-nextauth-imports.js       # Corrigir imports do NextAuth
├── 📄 generate-vapid-keys.js        # Gerar chaves VAPID
├── 📄 hash_password.js              # Hash de senhas
├── 📄 jsconfig.json                 # Configuração JavaScript
├── 📁 lib/                          # Bibliotecas utilitárias
│   ├── errorHandler.js              # Manipulador de erros
│   ├── logger.js                    # Sistema de logs
│   ├── prisma.js                    # Cliente Prisma (JS)
│   └── prisma.ts                    # Cliente Prisma (TS)
├── 📄 middleware.ts                 # Middleware do Next.js
├── 📄 next-env.d.ts                 # Tipos do Next.js
├── 📄 next.config.js                # Configuração do Next.js (JS)
├── 📄 next.config.mjs               # Configuração do Next.js (MJS)
├── 📄 output.txt                    # Arquivo de saída
├── 📄 package-lock.json             # Lock de dependências
├── 📄 package.json                  # Dependências do projeto
├── 📄 postcss.config.mjs            # Configuração PostCSS
├── 📁 prisma/                       # Configuração do banco
│   ├── 📁 migrations/               # Migrações do banco
│   │   └── 📁 20250907174328_init/
│   │       └── migration.sql
│   ├── schema.prisma                # Schema do banco de dados
│   └── schema-optimized.prisma      # Schema otimizado
├── 📁 public/                       # Arquivos públicos
│   ├── default-avatar.svg           # Avatar padrão
│   ├── file.svg                     # Ícone de arquivo
│   ├── globe.svg                    # Ícone de globo
│   ├── 📁 icons/                    # Ícones PWA
│   ├── manifest.json                # Manifest PWA
│   ├── next.svg                     # Logo Next.js
│   ├── 📁 profile-photos/           # Fotos de perfil
│   ├── sw.js                        # Service Worker
│   ├── 📁 uploads/                  # Uploads
│   │   └── 📁 avatars/              # Avatares
│   ├── vercel.svg                   # Logo Vercel
│   ├── 📁 verification-docs/        # Documentos de verificação
│   └── window.svg                   # Ícone de janela
├── 📄 seed-db.js                    # Popular banco de dados
├── 📄 setup_database.sql            # Configuração do banco
├── 📁 store/                        # Estado global
│   └── useFilterStore.js            # Store de filtros
├── 📄 test-ban-redirect.js          # Teste de redirecionamento de banimento
├── 📄 test-ban-system.js            # Teste do sistema de banimento
├── 📄 test-broken-features.js       # Teste de funcionalidades quebradas
├── 📄 test-favorites.js             # Teste de favoritos
├── 📄 test-messaging.js             # Teste de mensagens
├── 📄 tsconfig.json                 # Configuração TypeScript
└── 📄 update_admin_password.sql     # Atualizar senha do admin