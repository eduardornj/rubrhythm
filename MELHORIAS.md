# RubRhythm — Lista de Melhorias
# Atualizado dinamicamente durante sessão Cobalt x Ruby

---

## ⚖️ LEGAL — Consultar com Opus antes de implementar
> **NOTA:** Antes de implementar os itens legais abaixo, abrir sessão com Claude Opus e pedir análise completa de FOSTA-SESTA + Section 2257 para o modelo de negócio específico do RubRhythm. Referência: Corey Silverstein (adultcontentlaw.com).

### L1. FOSTA-SESTA — Ativação no fluxo (conteúdo das páginas já está robusto ✅)
- ✅ Terms proíbe serviços sexuais — linguagem clara
- ✅ Anti-Trafficking com hotlines ativas (Polaris, DHS, FBI)
- ✅ DMCA policy com email dedicado
- ✅ Section 2257 declarado
- ✅ CDA §230, GDPR, CCPA referenciados
- ✅ Age gate — modal bloqueante com cookie 30 dias (Fase 1)
- ✅ Checkbox no cadastro — aceite explícito de ToS + 18+ antes de criar perfil (Fase 1)
- ✅ Botão de denúncia integrado nos listings — 6 razões, severity automática, hotline de trafficking (Fase 1)

### L2. Section 2257 Compliance ✅ RESOLVIDO — Fase 10
- ✅ Análise Opus concluída: RubRhythm proíbe conteúdo sexualmente explícito, portanto § 2257 não se aplica
- ✅ Página reescrita honestamente (sem custodian falso, sem endereço fake)
- ✅ Declaração clara: "§ 2257 record-keeping requirements are not applicable"
- ✅ Seção "How We Protect Our Community" com 6 medidas reais
- ✅ Anti-trafficking notice com hotlines (Polaris, DHS, FBI)

---

## 🔴 PRIORIDADE ALTA

### 1. Age Gate (Confirmação de Idade) ✅ IMPLEMENTADO — Fase 1
- ✅ Modal bloqueante antes de ver qualquer conteúdo
- ✅ Cookie de 30 dias
- ✅ Redirect para google.com para menores de 18
- Commit: `a2ff876`

---

## 🟡 PRIORIDADE MÉDIA

### 2. Content Policy visível no cadastro ✅ IMPLEMENTADO — Fase 7
- ✅ Bloco de Content Policy exibido dinamicamente ao selecionar role "Massage Provider"
- ✅ Lista verde: o que é permitido (serviços legais, fotos reais, preços reais)
- ✅ Lista vermelha: o que não é permitido (conteúdo sexual, escort, menores, identidade falsa)
- ✅ Link para Terms of Service no rodapé do bloco

### 3. Checklist de moderação para o admin ✅ IMPLEMENTADO — Fase 8
- ✅ Bloco amarelo visível no `ListingDetail` somente quando listing está **pendente**
- ✅ 8 critérios de verificação com checkboxes (título legítimo, sem solicitação sexual, fotos adequadas, preço, localização, conta ativa, sem links proibidos, sem menores)
- ✅ Instrução: "Marque todos antes de aprovar. Se qualquer item falhar → Rejeitar."

### 4. Revisão de linguagem nos listings aprovados ✅ IMPLEMENTADO — Fase 10
- ✅ Content filter com ~70 RED terms (bloqueio automático) e ~30 YELLOW terms (flag para admin)
- ✅ Real-time: aviso no formulário do provider com debounce 300ms
- ✅ API-level: POST/PUT rejeitam listings com RED terms (status 400)
- ✅ Admin panel: badges RED/YELLOW visíveis no detalhe do listing
- ✅ Categorias: serviços sexuais, tráfico, substâncias, gírias do mercado
- **Motivo:** proteção FOSTA-SESTA + Google Safe Search + Stripe compliance

### 5. CTA para provider nas páginas de cidade e busca ✅ IMPLEMENTADO — Fase 5
- ✅ Banner "Are you a massage provider in {city}?" nas city pages
- ✅ Banner equivalente nas search results (com cidade dinâmica quando disponível)
- ✅ CTA "List for Free" → `/register-on-rubrhythm`
- ✅ Empty state da city page atualizado: "Be the first — list your services for free."

### 6. Estatísticas de visualização no dashboard do provider ✅ IMPLEMENTADO — Fase 4
- ✅ Card "Profile Views" no dashboard com total de views
- ✅ viewCount incrementado a cada visita ao perfil público
- Commit: `396f086`

### 7. Notificações de interesse de cliente ✅ IMPLEMENTADO — Fase 4
- ✅ Notificação in-app "Someone viewed your listing" a cada nova visita
- ✅ Rate limit: máximo 1 notificação por hora por listing (sem spam)
- Commit: `396f086`

### 8. Página pública de Pricing
- Não existe tabela de planos visível antes do cadastro
- Provider não sabe o que custa antes de entrar
- Comunicar claramente: Basic (grátis) / Featured / Highlighted / Premium — o que cada um entrega
- **Motivo:** provider que não entende o modelo hesita e não converte

### 9. Método de pagamento convencional (cartão)
- Único método hoje: Bitcoin (NowPayments)
- Alta fricção para o provider médio nos EUA que não usa crypto
- Stripe está configurado no projeto mas com chaves vazias — precisa ativar
- **Motivo:** sem cartão de crédito, a monetização fica travada na prática

### 10. Comunicação clara no bloqueio de contato ✅ IMPLEMENTADO — Fase 2
- ✅ Bloco com texto "Create a free account to send messages and view contact details"
- ✅ Dois botões: "Join Free — 30 sec" (primary) + "Sign In" (secondary)
- Commit: `450c296`

### 11. Domínio próprio para o RubRhythm ✅ RESOLVIDO — 10/mar/2026
- ✅ rubrhythm.com registrado e no ar
- ✅ DNS Cloudflare configurado (A + CNAME Vercel + registros Resend)
- ✅ NEXTAUTH_URL atualizado para https://rubrhythm.com
- ✅ Email transacional: noreply@rubrhythm.com via Resend
- ✅ Domínio antigo rubrhythm.bubblesenterprise.com removido do Vercel

---

## 🟢 PRIORIDADE BAIXA

### 12. Filtros étnicos/físicos — substituir por filtros de serviço ✅ IMPLEMENTADO — Fase 2
- ✅ Removido: seção Ethnicity inteira ("Asian", "Latina", etc.)
- ✅ Removido: "Slim" e "Curvy" do Body Types
- ✅ Adicionado: toggle "Verified Only" como filtro principal (topo do painel)
- Commit: `450c296`

### 13. Emojis nas cidades — remover conotação sexual ✅ IMPLEMENTADO — Fase 2
- ✅ Atlanta: 🍑 → 🌆
- Commit: `450c296`

### 14. Headline da homepage ✅ IMPLEMENTADO — Fase 2
- ✅ Novo: "Find **Verified** Massage Providers"
- ✅ Subtext foca em ID-verification, Blue Badge, 250+ cidades
- Commit: `450c296`

### 15. Conteúdo editorial nas páginas de cidade ✅ PARCIAL — Orlando implementado (Fase 9)
- ✅ Infraestrutura: `data/cityContent.js` com conteúdo curado por cidade
- ✅ City page usa conteúdo curado quando disponível, fallback genérico para demais cidades
- ✅ Orlando: conteúdo real escrito pelo Eduardo (Disney, Universal, OCCC, Dr. Phillips, I-Drive, College Park)
- 🔜 Demais cidades top: adicionar quando tiverem providers reais

### 16. noindex em páginas de cidade sem providers ✅ IMPLEMENTADO — Fase 6
- ✅ `robots: { index: false, follow: true }` no `generateMetadata` quando `count === 0`
- ✅ Automático — quando primeiro provider for aprovado na cidade, a página passa a ser indexada no próximo revalidate (60s)

---

## 🚀 GO-TO-MARKET — Founding Provider Program

### A oferta:
**"Be one of our 50 Founding Providers. Get 3 months of Premium — completely free."**

### O que o Founding Provider recebe:
- 3 meses de perfil Premium gratuito
- Badge exclusivo "Founding Provider" — permanente no perfil (mesmo depois que paga)
- Posição prioritária na cidade durante o período
- Acesso antecipado a novas features

### Por que funciona:
- Elimina o maior medo do provider: "vou criar perfil e ninguém vai me ver"
- 50 vagas por cidade = escassez real, senso de exclusividade
- Badge permanente cria status — diferencia fundadores dos providers futuros para sempre
- Não custa nada operacionalmente implementar

### Estratégia de execução:
- Conquistar cidade por cidade — começar por Orlando
- Comunidades alvo: r/bodyrub, fóruns específicos do nicho, grupos privados
- Motor de crescimento: referral já implementado — providers ganham créditos indicando outros

### Implementação técnica: ✅ COMPLETO
- ✅ Campo `isFoundingProvider: Boolean` no schema
- ✅ Marcação automática com tiers por cidade (50 / 25 / 10)
- ✅ Badge visual dourado permanente no card e no perfil
- ✅ Pré-requisitos cumpridos: age gate + compliance + filtros corrigidos

---

## ✅ JÁ IMPLEMENTADO

- Fila de aprovação manual de listings (campo `approved`)
- Dashboard do provider (`/myaccount`) com edição de perfil
- Sistema de créditos com badges (Featured, Highlighted, Premium)
- Sistema de referral (créditos por indicação)
- Verificação de ID com badge azul
- SEO técnico: title tags e meta descriptions dinâmicas por cidade
- Sitemap configurado + Google Search Console conectado
- Bloqueio de contato para visitantes não cadastrados

### ✅ Fase 1 — Legal & Compliance (commit `a2ff876`)
- Age Gate modal bloqueante com cookie 30 dias
- Checkbox de ToS + 18+ no cadastro
- Botão de denúncia nos listings (6 razões, severity automática, hotline de trafficking)
- API `/api/report` usando modelo `fraudreport` existente

### ✅ Fase 2 — Homepage & Conversion (commit `450c296`)
- Headline: "Find Verified Massage Providers" (diferencial de verificação)
- Filtro Ethnicity removido (risco legal eliminado)
- "Verified Only" toggle como filtro principal
- Atlanta 🍑 → 🌆
- CTA de bloqueio de contato: "Join Free — 30 sec" + "Sign In"

### ✅ Fase 3 — Founding Provider Program (commit `b91b733`)
- Campo `isFoundingProvider Boolean @default(false)` adicionado ao schema
- `prisma db push` executado — TiDB Cloud sincronizado
- Lógica de tiers por tamanho de mercado (sugestão do Ruby):
  - Tier 1 (NY, LA, Vegas, Miami): 50 vagas
  - Tier 2 (Orlando, Atlanta, Chicago, Houston e outros grandes mercados): 25 vagas
  - Tier 3 (todas as demais cidades): 10 vagas
- Badge dourado/amber permanente no card e no perfil do provider
- Marcação automática no momento da aprovação pelo admin (sem esforço manual)

### ✅ Fase 4 — Dashboard Stats + View Tracking (commit `396f086`)
- Card "Profile Views" no dashboard do provider (soma de views de todos os listings)
- `viewCount` incluído na API de listings (`/myaccount/api/listings`)
- Nova rota `POST /api/listing/view`: incrementa viewCount + cria notificação in-app para o provider
- Rate limiting: máximo 1 notificação por hora por listing (evita spam)
- Notificação: *"Someone viewed your listing"* com link para `/myaccount/listings`
- View tracking ativado automaticamente em cada visita ao perfil público

### ✅ Fase 5 — Provider CTA Banner dinâmico (Item 5)
- Banner "Are you a massage provider in {city}?" em todas as city pages e search results
- **Banner dinâmico com vagas restantes por cidade:**
  - Com vagas: banner âmbar/dourado ⭐, "Only X spots left in {city} — free for 3 months", botão "Claim Your Spot"
  - Sem vagas: banner primary 💆, "Create your free profile and start getting clients today", botão "List for Free"
- Query `getFoundingSpots()` por cidade: COUNT de `isFoundingProvider=true` vs limite do tier
- Tiers replicados nas city pages e search results (mesmo array TIER1/TIER2 do admin)
- Empty state da city page atualizado: "Be the first — list your services for free."
- Queries em paralelo via `Promise.all` — sem impacto de performance

### ✅ Fase 6 — noindex em cidades vazias (Item 16)
- `robots: { index: false, follow: true }` no `generateMetadata` da city page quando sem providers
- Automático: quando primeiro provider aprovado chega, a página é indexada no próximo revalidate (60s)

### ✅ Fase 7 — Content Policy no cadastro (Item 2)
- Bloco Content Policy condicional: aparece ao selecionar role "Massage Provider"
- Allowed (verde): serviços legais, fotos reais, preços reais
- Not allowed (vermelho): conteúdo sexual, escort, menores, identidade falsa
- Link para ToS no rodapé do bloco

### ✅ Fase 8 — Checklist de moderação no admin (Item 3)
- Bloco amarelo no `ListingDetail` somente para listings pendentes
- 8 critérios com checkboxes: título, linguagem, fotos, preço, localização, conta ativa, links, menores
- Instrução clara: marque todos antes de aprovar, qualquer falha = rejeitar

### ✅ Fase 9 — Conteúdo editorial por cidade (Item 15)
- Infraestrutura `data/cityContent.js` com conteúdo curado por cidade
- Orlando: conteúdo real (Disney, Universal, OCCC, Dr. Phillips, I-Drive, College Park)
- Fallback genérico para cidades sem conteúdo curado

### ✅ Fase 11 — Content Scan Tool + Domínio próprio (10/mar/2026)
- **Admin Content Scan** (`app/admin/content-scan/page.js` + `app/api/admin/content-scan/route.js`):
  - Escaneia todos os listings existentes no DB com o content filter
  - Filtros: severidade (RED/YELLOW/todos) + status (aprovados/pendentes/todos)
  - Cards de summary: total escaneado / RED count / YELLOW count
  - Lista listings flagged com termos encontrados e link direto para o admin
  - Item no menu admin sidebar: 🔍 Content Scan
- **Domínio rubrhythm.com:** ver item 11 acima
- **Email:** noreply@rubrhythm.com via Resend (domínio verificado, DKIM ativo)

### ✅ Fase 10 — Content Filter + Audit Log + 2257 Rewrite
- **Content Filter** (`lib/contentFilter.js`):
  - ~70 RED terms (bloqueio automático): escort, happy ending, rub and tug, trafficking signals, etc.
  - ~30 YELLOW terms (flag para admin review): sensual, tantric, nuru, discreet, etc.
  - Real-time no formulário (debounce 300ms) + API-level blocking + admin badges
- **Section 2257 rewrite** (`app/info/section-2257/page.js`):
  - Reescrita honesta: RubRhythm proíbe conteúdo explícito → § 2257 não se aplica
  - 6 medidas reais de proteção + anti-trafficking notice com hotlines
- **Audit log** em ações admin:
  - Listings: approve, reject, feature, delete → `securitylog`
  - Créditos: campo "Motivo" obrigatório + log com valor, razão, admin, IP
  - Broadcast: log ao deletar notificações em massa
  - Chat: log ao deletar mensagem ou conversa
- **Chat moderação** (`app/admin/chats`):
  - Deletar mensagem individual (hover trash icon)
  - Deletar conversa inteira (botão vermelho com confirm())
  - API: `DELETE /api/admin/chats` com actions: delete_message, delete_conversation
- **Broadcast confirmação**: `confirm()` antes de deletar + audit log no backend

### Pendente — Para quando escalar
- Bulk operations (aprovar vários listings de vez)
- Image moderation tools (AI: AWS Rekognition / Google Vision)
- Revenue charts no financeiro
- Warning system antes de banir (amarelo → vermelho → ban)
- Export em mais formatos (Excel/PDF)
- Scheduled notifications
