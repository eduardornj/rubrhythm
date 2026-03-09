# 🏗️ PLANO MASTER DE IMPLEMENTAÇÃO — RUBRHYTHM

> **Objetivo**: Transformar o RubRhythm de um protótipo com features incompletas em um produto funcional, lucrativo e pronto para lançamento.
>
> **Stack**: Next.js 15 | React 19 | Prisma (MySQL) | Tailwind CSS v4 | NextAuth v5
>
> **Raiz do projeto**: `c:\Users\eDuArDoXP\OneDrive\Documents\rubrhythm`
>
> **Dev server**: `npm run dev` (porta 1001)

---

## 📋 ÍNDICE

1. [Estado Atual do Sistema](#estado-atual)
2. [FASE 1 — Fazer Funcionar (Fix Critical Bugs)](#fase-1)
3. [FASE 2 — Fazer Profissional (Polish & UX)](#fase-2)
4. [FASE 3 — Fazer Comunicar (Admin ↔ User)](#fase-3)
5. [FASE 4 — Fazer Vender (Payments & Revenue)](#fase-4)
6. [FASE 5 — Fazer Crescer (Growth Features)](#fase-5)
7. [O Que NÃO Mexer (Deixar para Depois)](#nao-mexer)
8. [Mapa de Arquivos do Projeto](#mapa-arquivos)

---

<a id="estado-atual"></a>
## 📊 ESTADO ATUAL DO SISTEMA

### Banco de Dados (Prisma Schema)
- **Arquivo**: `prisma/schema.prisma`
- **Database**: MySQL na porta 3306 (XAMPP)
- **Models**: 25+ (user, listing, review, creditbalance, credittransaction, transaction, conversation, message, campaign, escrow, chat, chatmessage, chatpayment, favorite, fraudreport, notification, adminnotification, usernotification, pushsubscription, securitylog, suspiciousip, verificationrequest, globalsettings, etc.)
- **Connection string**: `mysql://root:@localhost:3306/rubrhythm` (sem senha)

### Usuários no Sistema
| Nome | Email | Role | Créditos |
|---|---|---|---|
| Administrador | admin@rubrhythm.com | admin | 137 |
| Isabela | isabella17572824317188@example.com | user (massagista) | 45 |
| Test User | test@example.com | user (massagista) | 0 |

### Listings: 8 anúncios aprovados no banco

### Bugs Críticos Atuais
1. `/add-listing` — Erro `ReferenceError: handleFiles is not defined`
2. `/search-results` — URLs geram `/united-states/undefined/undefined/...`
3. `/united-states/texas/houston` — Mostra "No providers found" com anúncios no DB
4. `/api/admin/reviews` — Retorna erro 500
5. Dashboard admin Volume Financeiro mostra `$0.00` (deveria refletir 182 créditos)

---

<a id="fase-1"></a>
## 🔴 FASE 1 — FAZER FUNCIONAR (Fix Critical Bugs)

> **Meta**: Corrigir os 5 bugs que impedem o funcionamento básico do site.
> **Estimativa**: 1–2 dias de trabalho.

---

### 1.1 Fix: Add Listing Quebrado (handleFiles)

**Problema**: A página `/add-listing` dá erro `ReferenceError: handleFiles is not defined` no componente de upload de imagens.

**Arquivo principal**: `components/ModernImageUpload.js` (13.598 bytes)

**O que fazer**:
1. Abrir `components/ModernImageUpload.js`
2. Localizar onde `handleFiles` é chamado (provavelmente em um event handler de drag & drop ou input file)
3. Verificar se a função `handleFiles` está definida no componente. Se não estiver:
   - Procurar se existe em `components/ImageDragDrop.js` (6.154 bytes) — pode ter sido movida
   - Definir a função que recebe os arquivos selecionados, valida tipo/tamanho, e adiciona ao state
4. A função deve:
   - Aceitar `FileList` ou `File[]`
   - Validar extensões (jpg, png, webp)
   - Validar tamanho (max 2MB, conforme `rlConfig['upload_max_size'] = 2097152` do RubRankings)
   - Gerar preview via `URL.createObjectURL()`
   - Adicionar ao array de imagens no state

**Arquivo da página**: `app/add-listing/page.js`

**Verificação**: Após o fix, navegar para `/add-listing`, selecionar imagens, e verificar que elas aparecem como preview sem erro no console.

---

### 1.2 Fix: URLs com `undefined` nos Search Results

**Problema**: Na página `/search-results`, os links dos listings geram URLs como `/united-states/undefined/undefined/massagists/slug`.

**Arquivo principal**: `app/search-results/` (2 itens nessa pasta)

**O que fazer**:
1. Abrir o componente que renderiza os resultados de busca
2. Localizar onde o link/href de cada listing é construído
3. O problema é que `listing.state` e/ou `listing.city` estão `undefined` na resposta da API ou não estão sendo lidos corretamente
4. Verificar:
   - A API que alimenta os search results (provavelmente `/api/listings/` ou `/api/listings/similar/`)
   - Se os campos `state` e `city` estão sendo retornados pelo Prisma query
   - Se o componente `ListingCard.js` (6.713 bytes em `components/ListingCard.js`) constrói o href corretamente
5. O href correto deve ser:
   ```
   /united-states/${listing.state.toLowerCase().replace(/\s+/g, '-')}/${listing.city.toLowerCase().replace(/\s+/g, '-')}/massagists/${listing.id}
   ```
6. Adicionar fallback: se `state` ou `city` forem undefined, não renderizar o link ou usar valores default

**Verificação**: Navegar para `/search-results`, clicar em um listing, e confirmar que a URL está correta e a página carrega.

---

### 1.3 Fix: Página de Cidade Mostra "No providers found"

**Problema**: `/united-states/texas/houston` mostra "No providers found" mesmo com 8 anúncios aprovados no DB.

**Arquivo principal**: `app/united-states/[state]/[city]/page.js`

**O que fazer**:
1. Abrir `app/united-states/[state]/[city]/page.js`
2. Verificar como os params `state` e `city` são recebidos e usados na query
3. O problema provável é **case sensitivity**: a URL tem `houston` (lowercase) mas o DB pode ter `Houston` (capitalizado)
4. Verificar a query Prisma:
   ```js
   // ERRADO: match exato, case-sensitive
   where: { state: params.state, city: params.city }
   
   // CORRETO: case-insensitive ou normalização
   where: {
     state: { equals: params.state, mode: 'insensitive' },
     city: { equals: params.city, mode: 'insensitive' }
   }
   ```
   **ATENÇÃO**: MySQL com Prisma: `mode: 'insensitive'` pode não funcionar em MySQL. A alternativa é normalizar ambos os lados:
   ```js
   // Converter slug da URL para formato do DB
   const cityName = params.city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
   const stateName = params.state.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
   ```
5. Verificar também se o filtro inclui `isApproved: true` e `isActive: true`
6. Verificar a API correspondente (provavelmente em `app/api/listings/` ou `app/api/states/`)

**Dados no DB para referência**: Os listings têm `state: "Texas"`, `city: "Houston"` (capitalizado)

**Verificação**: Navegar para `/united-states/texas/houston` e confirmar que os 8 anúncios aparecem.

---

### 1.4 Fix: API de Reviews Retorna Erro 500

**Problema**: `/api/admin/reviews` retorna Internal Server Error.

**Arquivo**: `app/api/admin/reviews/route.js` e `app/admin/reviews/page.js`

**O que fazer**:
1. Abrir `app/api/admin/reviews/route.js`
2. Rodar a API manualmente: `curl http://localhost:1001/api/admin/reviews`
3. Ler o log de erro no terminal do Next.js
4. Problemas prováveis:
   - Referência a campo que não existe no schema (ex: `isVerified` em review quando o campo real é `isAnonymous`)
   - Problema no `include` ou `select` do Prisma (tentando incluir uma relação que mudou)
   - Falta de tratamento de erro (try/catch ausente)
5. O schema do model `review` tem estes campos:
   ```
   id, listingId, reviewerId, rating, comment, isVerified, isAnonymous, status, 
   rejectionReason, reviewedBy, reviewedAt, createdAt, updatedAt
   ```
6. Verificar que a query Prisma está usando campos que existem no schema
7. Adicionar try/catch adequado que retorna JSON com `{ success: false, error: ... }` em vez de deixar explodir

**Verificação**: `curl http://localhost:1001/api/admin/reviews` deve retornar JSON válido. Dashboard admin deve mostrar número correto de "Reviews Pendentes".

---

### 1.5 Fix: Volume Financeiro $0.00 no Dashboard

**Problema**: O Dashboard admin mostra "$0.00" no card "Volume Financeiro Atual" mesmo com 182 créditos no sistema.

**Arquivo**: `app/admin/page.js` (6.879 bytes)

**O que fazer**:
1. Abrir `app/admin/page.js`
2. Localizar o card "Volume Financeiro Atual"
3. Verificar de onde vem o dado — provavelmente da API `/api/admin/system`
4. Abrir `app/api/admin/system/route.js`
5. O cálculo do volume financeiro deve somar:
   - Total de créditos de TODOS os usuários: `SELECT SUM(credits) FROM user`
   - Ou total de transações: `SELECT SUM(amount) FROM transaction`
6. Verificar se a query está correta e se o campo está sendo passado para o frontend
7. O card "00 0%" que mostra "Em custódia segura" provavelmente deveria mostrar o valor em escrow também

**Verificação**: Dashboard admin deve mostrar valor financeiro real ($182.00 ou o equivalente em dólares dos créditos).

---

<a id="fase-2"></a>
## 🟡 FASE 2 — FAZER PROFISSIONAL (Polish & UX)

> **Meta**: Limpar a interface, remover artefatos de desenvolvimento, unificar o design.
> **Estimativa**: 3–5 dias.

---

### 2.1 Limpar Sidebar do My Account

**Arquivo**: `components/MyAccountLayout.js` (2.264 bytes)

**Estado atual do sidebar**:
```
Dashboard
🔧 Portal Admin
📁 Listings (Test)     ← REMOVER "(Test)"
💰 Credits (Test)      ← REMOVER "(Test)"
❤️ Favoritos
💬 Minhas Mensagens
🏠 Back to Site
🚪 Sign Out
```

**O que fazer**:
1. Remover o texto "(Test)" de todos os links
2. Reorganizar a ordem:
```
📊 Dashboard
📝 Meus Anúncios
💰 Créditos & Transações
✅ Verificação
❤️ Favoritos
💬 Mensagens
⚙️ Configurações
---
🔧 Portal Admin (só se role === 'admin')
🏠 Voltar ao Site
🚪 Sair
```
3. O link "Portal Admin" só deve aparecer se o user tem `role === 'admin'`
4. Remover a página `/myaccount/provider-dashboard` por completo e integrar analytics no Dashboard principal

**Arquivos relacionados**:
- `components/DashboardLayout.js` (10.994 bytes) — layout que wrapa as páginas /myaccount
- `app/myaccount/layout.js` (2.028 bytes)

---

### 2.2 Reconstruir My Account Dashboard

**Arquivo**: `app/myaccount/page.js` (14.289 bytes)

**Estado atual**: Todos os cards ficam em skeleton loading infinito (nunca carregam dados).

**O que fazer**:
1. O dashboard deve mostrar dados REAIS puxando das APIs existentes:
   - **Meus Anúncios**: Total de listings do user, quantos ativos, quantos pendentes
   - **Meus Créditos**: Saldo atual (campo `user.credits`)
   - **Minhas Views**: Total de visualizações dos listings (se existir tracking)
   - **Status de Verificação**: Pendente, Aprovado, ou Não enviado
2. Criar ou usar API existente: `/api/user/[id]` ou `/api/my-listings`
3. Se as APIs de dados não existem, criar:
   ```
   GET /api/user/dashboard → retorna { listings: { total, active, pending }, credits, verification_status, recent_activity }
   ```
4. Remover skeleton loading infinito — mostrar "0" ou "Nenhum dado" em vez de loading eterno
5. Adicionar **Quick Actions**:
   - "Criar Novo Anúncio" (link para /add-listing)
   - "Comprar Créditos" (link para /myaccount/credits)
   - "Solicitar Verificação" (link para /myaccount/get-verified)

---

### 2.3 Deletar Provider Dashboard Separado

**Arquivo a remover**: `app/myaccount/provider-dashboard/page.js`

**Por quê**: Tem tema claro (inconsistente com o rest do site que é dark), dados hardcoded/fake (1.234 views), e duplica funcionalidade que deveria estar no Dashboard principal.

**O que fazer**:
1. Integrar qualquer analytics útil desta página no dashboard principal (item 2.2)
2. Deletar o arquivo `app/myaccount/provider-dashboard/page.js` ou a pasta inteira
3. Remover o link do sidebar (já feito no item 2.1)
4. Remover do `components/ProviderAnalytics.js` (9.694 bytes) se tiver dados hardcoded — se tiver lógica real, mova para o dashboard

---

### 2.4 Fix Imagens Genéricas nos Listings

**Problema**: Muitos listings aparecem com ícone genérico em vez de foto real.

**Arquivos**:
- `components/ListingCard.js` (6.713 bytes) — renderiza card do listing
- `app/api/images/[fileName]/route.js` — serve imagens

**O que fazer**:
1. Verificar como as imagens são armazenadas no campo `listing.images` (é JSON no Prisma)
2. Verificar se o path das imagens está correto
3. O `ListingCard.js` provavelmente tenta renderizar `listing.images[0]` — verificar se o array está populado
4. Se as imagens estão salvas em disco, verificar o diretório (provavelmente `public/uploads/` ou similar)
5. Adicionar fallback visual bonito (placeholder gradiente com iniciais do provider em vez de ícone genérico)

---

### 2.5 Tooltips nos Botões do Admin

**Arquivo**: `app/admin/users/page.js` e `app/admin/components/AdminDataTable.js`

**O que fazer**:
1. Todos os ícones de ação no admin (verificar, banir, ajustar créditos) devem ter `title` attributes ou tooltip component
2. Se possível, adicionar texto ao lado do ícone ("Verificar", "Banir", "Créditos")
3. Para ações destrutivas (Banir), usar confirm dialog com input de motivo

---

### 2.6 Admin Não Deve Ter Créditos Visíveis

**Arquivo**: `app/admin/creditos/page.js`

**O que fazer**:
1. Filtrar o admin da lista de créditos: `where: { role: { not: 'admin' } }` na query
2. Ou mostrar mas com label diferente: "Admin (Sistema)" em vez de "Massagista"

---

### 2.7 Implementar Filtro de Role na API de Users

**Arquivo**: `app/api/admin/users/route.js`

**O que fazer**:
1. Ler o query param `role` da URL:
   ```js
   const { searchParams } = new URL(request.url);
   const roleFilter = searchParams.get('role');
   ```
2. Aplicar no Prisma query:
   ```js
   const where = {};
   if (roleFilter) where.role = roleFilter;
   const users = await prisma.user.findMany({ where });
   ```
3. O frontend em `/admin/users` deve mostrar tabs ou dropdown para filtrar por role

---

<a id="fase-3"></a>
## 🟠 FASE 3 — FAZER COMUNICAR (Admin ↔ User)

> **Meta**: Criar sistema de comunicação bidirecional entre admin e providers.
> **Estimativa**: 5–7 dias.

---

### 3.1 Sistema de Notificações Admin → User

**Models já existentes no schema**:
- `adminnotification` — Notificações criadas pelo admin
- `usernotification` — Notificações destinadas ao user
- `notification` — Notificações gerais

**Problema**: Os models existem mas **não são usados**. Nenhuma tela os popula ou exibe.

**O que criar**:

#### A) API: Enviar Notificação
```
POST /api/admin/notifications/send
Body: {
  targetUserId: string | "all",
  title: string,
  message: string,
  type: "info" | "warning" | "success" | "action_required",
  priority: "low" | "medium" | "high" | "urgent",
  actionUrl?: string
}
```

**Arquivo novo**: `app/api/admin/notifications/send/route.js`

**Lógica**:
1. Se `targetUserId === "all"`, criar uma `usernotification` para CADA user no sistema
2. Se é um userId específico, criar apenas uma
3. Usar o model `usernotification` do Prisma

#### B) Página Admin: Central de Comunicação
**Arquivo novo**: `app/admin/comunicacao/page.js`

**UI deve ter**:
1. **Formulário de envio**: Selecionar destinatário (dropdown de users ou "Todos"), título, mensagem, tipo
2. **Histórico**: Lista de notificações enviadas com data, destinatário, status de leitura
3. **Templates rápidos**: "Listing Aprovado", "Listing Rejeitado", "Verificação Aprovada", "Bem-vindo ao RubRhythm"

#### C) Painel do User: Ver Notificações
**Arquivo existente**: `components/NotificationManager.tsx` (10.985 bytes)

**O que fazer**:
1. Verificar se o `NotificationManager.tsx` já lê as notificações da API
2. Se não, conectar ao endpoint `GET /api/notifications?userId=xxx`
3. Mostrar badge vermelho com contagem de não-lidas no sidebar
4. Criar página `/myaccount/notifications` para ver todas

#### D) Adicionar link no Sidebar do Admin
No layout do admin (`app/admin/layout.js`, 5.586 bytes), adicionar:
```
📧 Comunicação
```
Entre "Créditos" e "Chats" na lista de navegação.

---

### 3.2 Notificações Automáticas (Event-driven)

**O que fazer**: Em cada ação do admin, criar automaticamente uma notificação para o user afetado.

| Ação do Admin | Notificação para o User | Tipo |
|---|---|---|
| Aprovar listing | "Seu anúncio '{title}' foi aprovado e está online!" | success |
| Rejeitar listing | "Seu anúncio '{title}' precisa de ajustes: {motivo}" | action_required |
| Aprovar verificação | "Parabéns! Sua identidade foi verificada ✅" | success |
| Rejeitar verificação | "Sua verificação não foi aprovada: {motivo}" | warning |
| Ajustar créditos | "Seu saldo de créditos foi atualizado: {novo_saldo}" | info |
| Banir user | "Sua conta foi suspensa: {motivo}" | warning |

**Implementação**: Em cada API de ação admin (`/api/admin/listings`, `/api/admin/verifications`, etc.), após a ação principal, adicionar:
```js
await prisma.usernotification.create({
  data: {
    id: generateCUID(),
    userId: targetUserId,
    title: "Seu anúncio foi aprovado!",
    message: `O anúncio "${listing.title}" está agora visível para clientes.`,
    type: "success",
    priority: "medium",
    actionUrl: `/listing/${listing.id}`,
    updatedAt: new Date()
  }
});
```

---

### 3.3 Email Transacional (Futuro, após Fase 4)

> Nota: Para implementar email real, será necessário um serviço como Resend, Mailgun, ou SendGrid. Isso depende de domínio e DNS configurados. Recomendo postergar para após ter payment gateway funcionando. Por enquanto, as notificações in-app são suficientes.

---

<a id="fase-4"></a>
## 🔵 FASE 4 — FAZER VENDER (Payments & Revenue)

> **Meta**: Integrar pagamento real para que créditos sejam comprados com dinheiro.
> **Estimativa**: 5–7 dias.

---

### 4.1 Integrar Stripe

**Pacotes**: `npm install stripe @stripe/stripe-js @stripe/react-stripe-js`

**Arquivos novos**:
```
app/api/payments/
├── create-checkout/route.js    # Cria sessão de checkout do Stripe
├── webhook/route.js            # Recebe callbacks do Stripe após pagamento
└── verify/route.js             # Verifica status de um pagamento
```

**Fluxo**:
1. User clica "Comprar Créditos" na página `/myaccount/credits`
2. Seleciona pacote (ex: $20 = 20 créditos, $50 = 55 créditos, $100 = 120 créditos)
3. Frontend chama `POST /api/payments/create-checkout` com `{ packageId, userId }`
4. Backend cria `Stripe Checkout Session` e retorna URL
5. User é redirecionado para o Stripe Checkout (hosted page)
6. Após pagamento, Stripe chama o webhook `/api/payments/webhook`
7. Webhook valida a assinatura, e adiciona os créditos ao user:
   ```js
   await prisma.user.update({
     where: { id: userId },
     data: { credits: { increment: creditAmount } }
   });
   await prisma.credittransaction.create({
     data: { userId, amount: creditAmount, type: 'purchase', description: `Comprou ${creditAmount} créditos via Stripe` }
   });
   ```

**Variáveis de ambiente necessárias** (adicionar ao `.env`):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Pacotes de créditos sugeridos** (baseado na concorrência):
| Pacote | Preço | Créditos | Bônus |
|---|---|---|---|
| Starter | $10 | 10 | — |
| Basic | $25 | 27 | +2 bônus |
| Pro | $50 | 55 | +5 bônus |
| Premium | $100 | 120 | +20 bônus |
| Ultra | $200 | 260 | +60 bônus |

---

### 4.2 Atualizar Página de Créditos

**Arquivo**: `app/myaccount/credits/page.js` e subpastas em `app/myaccount/credits/` (3 itens)

**O que fazer**:
1. Adicionar seção de "Comprar Créditos" com os pacotes acima
2. Cada pacote é um card clicável que inicia o checkout
3. Manter o histórico de transações existente embaixo
4. Mostrar saldo atual em destaque no topo

---

### 4.3 Atualizar Página Admin Financeiro

**Arquivo**: `app/admin/financeiro/page.js`

**O que fazer**:
1. Mostrar métricas reais:
   - Receita total (soma de todos os pagamentos Stripe)
   - Créditos em circulação (soma de todos os `user.credits`)
   - Créditos gastos (soma de todas as `credittransaction` com tipo 'spend')
   - Top providers por gasto de créditos
2. Gráfico de receita por semana/mês (usar Recharts — já instalado, versão 3.7.0)

---

<a id="fase-5"></a>
## 🟢 FASE 5 — FAZER CRESCER (Growth Features)

> **Meta**: Adicionar features que atraem e retêm providers e clientes.
> **Estimativa**: 2–4 semanas.

---

### 5.1 "Available Now" Toggle

**Conceito**: Providers podem ativar um toggle "Disponível Agora" que mostra um badge verde no listing e os coloca no topo da lista da cidade.

**Schema**: Adicionar ao model `listing` no `prisma/schema.prisma`:
```prisma
availableNow      Boolean   @default(false)
availableUntil    DateTime?
```

**API**: 
```
PATCH /api/listing/[id]/available
Body: { available: true }
```
- Setar `availableNow: true` e `availableUntil: now + 2 horas`
- Um cron job ou check no frontend remove o status após expirar

**Frontend**:
- Toggle no dashboard do provider
- Badge verde "🟢 Available Now" no `ListingCard.js`
- Filtro "Available Now" na página de cidade

---

### 5.2 Onboarding Wizard para Providers

**Conceito**: Em vez de jogar o provider na página `/add-listing` sem guia, criar um wizard passo a passo.

**Passos**:
1. **Perfil Básico**: Nome, telefone, cidade, estado
2. **Fotos**: Upload de 3–8 fotos com preview
3. **Serviços & Preços**: Checkboxes de serviços, faixa de preço
4. **Descrição**: Textarea com dicas de como escrever
5. **Preview & Publicar**: Mostra como o anúncio vai ficar antes de enviar

**Arquivo novo**: `app/add-listing/page.js` (reescrever com wizard multi-step)

---

### 5.3 Landing Pages de Cidade com SEO

**Conceito**: Cada cidade deve ter conteúdo único, não apenas um grid de listings.

**Arquivo**: `app/united-states/[state]/[city]/page.js`

**Adicionar**:
1. Título SEO: `"Body Rubs & Massage in Houston, Texas | RubRhythm"`
2. Meta description dinâmica
3. Contagem de providers na cidade
4. Seção "Featured Providers" no topo
5. Schema.org markup (JSON-LD) para LocalBusiness
6. Breadcrumbs: Home > United States > Texas > Houston

---

### 5.4 Programa de Referral

**Conceito**: Provider convida outro provider e ambos ganham créditos bônus quando o convidado faz a primeira compra.

**Schema**: Adicionar ao model `user`:
```prisma
referralCode    String?   @unique
referredBy      String?   // userId de quem indicou
```

**Lógica**:
1. Cada user recebe um `referralCode` único no registro
2. No registro, campo "Código de indicação" (opcional)
3. Quando o convidado compra créditos pela primeira vez:
   - Convidado ganha +5 créditos bônus
   - Quem indicou ganha +10 créditos bônus

---

### 5.5 Review System Funcional

**O que fazer**:
1. Fix a API `/api/admin/reviews` (já na Fase 1)
2. Criar interface para cliente deixar review no listing: `/listing/[id]` com seção de reviews
3. Admin aprova/rejeita reviews antes de publicar
4. Rating médio exibido no ListingCard

---

<a id="nao-mexer"></a>
## ⏸️ O QUE NÃO MEXER (Postergar)

Estes sistemas são complexos e prematuros para o momento. **Não investir tempo neles agora**:

| Feature | Por quê Postergar |
|---|---|
| **Escrow System** | Over-engineering. Nenhum concorrente direto tem. Foco em créditos simples |
| **Campaign System** | Marketing analytics sem base de users é inútil |
| **Chat Anônimo Pago** | Muito complexo para MVP. Mensagens simples resolvem |
| **MCP Server (IA)** | Funciona melhor quando o admin panel está maduro |
| **Push Notifications** | Bom ter mas in-app notifications são suficientes por agora |
| **Security Logs/Fraud** | Prematuro sem tráfego real. O schema já existe, a implementação pode esperar |

**ATENÇÃO**: NÃO deletar esses arquivos/models. Apenas não investir tempo melhorando-os agora. Eles voltam na Fase 6+.

---

<a id="mapa-arquivos"></a>
## 📁 MAPA DE ARQUIVOS DO PROJETO

### Estrutura Principal
```
rubrhythm/
├── app/
│   ├── page.js                          # Homepage (✅ Funcional, boa qualidade)
│   ├── layout.tsx                       # Root layout
│   ├── globals.css                      # CSS global
│   ├── tailwind.css                     # Tailwind config
│   ├── add-listing/page.js             # 🔴 QUEBRADO (handleFiles)
│   ├── admin/
│   │   ├── page.js                     # Dashboard admin (🟡 $0 financeiro)
│   │   ├── layout.js                   # Layout/sidebar do admin
│   │   ├── components/AdminStatCard.js
│   │   ├── components/AdminDataTable.js
│   │   ├── chats/
│   │   ├── creditos/                   # 🟡 Mostra admin com créditos
│   │   ├── escrow/                     # ⏸️ Postergar
│   │   ├── financeiro/                 # 🟡 Dados incompletos
│   │   ├── listings/
│   │   ├── relatorios/
│   │   ├── reviews/                    # 🔴 API 500
│   │   ├── users/                      # 🟡 Filtro role não funciona
│   │   ├── verificacao/
│   │   └── verification/
│   ├── api/
│   │   ├── admin/                      # 11 sub-rotas
│   │   │   ├── system/route.js         # Dashboard data
│   │   │   ├── users/route.js          # 🟡 Sem filtro role
│   │   │   ├── reviews/route.js        # 🔴 Erro 500
│   │   │   └── ...
│   │   ├── listing/                    # 11 sub-rotas (CRUD de listings)
│   │   ├── listings/                   # 7 sub-rotas (busca, similar, recentes)
│   │   ├── credits/                    # 8 sub-rotas
│   │   ├── chat/                       # 5 sub-rotas (⏸️ postergar)
│   │   ├── verification/              # 5 sub-rotas
│   │   ├── messages/                   # 3 sub-rotas
│   │   ├── notifications/             # 5 sub-rotas
│   │   └── ...
│   ├── myaccount/
│   │   ├── page.js                     # 🟡 Dashboard vazio (skeletons)
│   │   ├── layout.js
│   │   ├── listings/                   # Meus anúncios
│   │   ├── credits/                    # Créditos
│   │   ├── favorites/
│   │   ├── get-verified/
│   │   ├── provider-dashboard/         # 🗑️ DELETAR (integrar no dashboard)
│   │   ├── chat/
│   │   └── verification/
│   ├── search-results/                  # 🔴 URLs undefined
│   ├── united-states/[state]/[city]/   # 🔴 Filtro cidade quebrado
│   └── ...
├── components/
│   ├── ModernImageUpload.js            # 🔴 handleFiles undefined
│   ├── ImageDragDrop.js
│   ├── ListingCard.js                  # 🟡 URLs pode ser aqui
│   ├── SearchBar.js
│   ├── AdvancedSearchFilters.js
│   ├── Header.js
│   ├── Footer.js
│   ├── DashboardLayout.js
│   ├── MyAccountLayout.js              # 🟡 Links "(Test)"
│   ├── NotificationManager.tsx
│   ├── ProviderAnalytics.js            # 🟡 Dados fake
│   ├── FavoriteButton.js
│   ├── GeoLocationRedirect.js
│   └── ...
├── lib/
│   ├── feature-pricing.js              # Pricing de Feature tiers
│   └── featured-rotation.js            # Rotação de featured
├── prisma/
│   └── schema.prisma                   # 25+ models, 569 linhas
├── data/
│   └── datalocations.js                # Dados de estados/cidades
├── docs/
│   ├── Credits-BumpUp.md
│   ├── Credits-FEATURE.md
│   └── Credits-HighlightYourListing.md
├── .env                                # DB + NextAuth config
├── package.json                        # Next.js 15, React 19, etc.
└── reestruturacao.md                   # Plano de reestruturação anterior
```

---

## ✅ CHECKLIST DE EXECUÇÃO

Use esta checklist para marcar progresso:

### Fase 1 — Fix Critical Bugs
- [ ] 1.1 Fix `handleFiles` em `ModernImageUpload.js`
- [ ] 1.2 Fix URLs undefined em search results
- [ ] 1.3 Fix filtro de cidade (case sensitivity)
- [ ] 1.4 Fix API reviews erro 500
- [ ] 1.5 Fix volume financeiro $0 no dashboard

### Fase 2 — Polish & UX
- [ ] 2.1 Limpar sidebar myaccount (remover "Test")
- [ ] 2.2 Reconstruir myaccount dashboard com dados reais
- [ ] 2.3 Deletar provider-dashboard separado
- [ ] 2.4 Fix imagens genéricas nos listings
- [ ] 2.5 Tooltips nos botões admin
- [ ] 2.6 Remover admin da lista de créditos
- [ ] 2.7 Implementar filtro de role na API users

### Fase 3 — Comunicação Admin ↔ User
- [ ] 3.1 Sistema de notificações admin → user
- [ ] 3.2 Notificações automáticas por ação

### Fase 4 — Payments
- [ ] 4.1 Integrar Stripe
- [ ] 4.2 Atualizar página de créditos com checkout
- [ ] 4.3 Dashboard financeiro com dados reais

### Fase 5 — Growth Features
- [ ] 5.1 "Available Now" toggle
- [ ] 5.2 Onboarding wizard para providers
- [ ] 5.3 Landing pages de cidade com SEO
- [ ] 5.4 Programa de referral
- [ ] 5.5 Review system funcional

---

> **Nota final**: Este documento contém TUDO que outro AI precisa saber para trabalhar no projeto. Cada item tem o arquivo exato, o problema exato, e a solução proposta. Siga na ordem: Fase 1 → 2 → 3 → 4 → 5. Não pule fases.
