# GUIA SEO — RubRhythm

> Confidencial. Senhas, keys e credenciais. Nao commitar no git publico.
> Atualizado em 20 de Marco de 2026.

---

## ALMA DO SITE

**"Professional. Verified. Safe."**

Todo conteudo SEO passa por esse filtro: "isso reforça que somos seguros, verificados e profissionais?"

Nao vendemos massage. Vendemos CONFIANCA no servico de massage. O RubRhythm separa as profissionais reais do lixo. Verificacao de ID, blue badge, reviews reais, content filter, compliance FOSTA-SESTA.

O tom nunca eh sexy ou provocativo. Eh profissional com confianca. Como o Airbnb fez com aluguel de quarto: antes era sketchy, eles tornaram mainstream com verificacao e reviews.

**Keywords principais (sempre "verified/safe" na frente):**
- "verified massage providers"
- "safe body rub directory"
- "ID verified massage near me"
- "trusted massage providers [city]"
- "safe body rub [city]"
- "verified body rub providers"

---

## COMO USAR ESTE GUIA

- Cada topico eh independente, faca na ordem que preferir
- Prioridade: URGENTE > IMPORTANTE > QUANDO DER
- Marque [x] quando completar cada item

---

# URGENTE (esta semana)

---

## 1. Google Analytics 4 ✅ CONCLUIDO

**Status: 100% FEITO.**

**O que foi feito:**
- [x] Property criada: RubRhythm (ID: 529348778)
- [x] Measurement ID: `G-JL4NCC79LB`
- [x] Tag gtag.js instalada no `app/layout.tsx`
- [x] Data Stream: RubRhythm Web (ID: 14156660706)
- [x] Retencao de dados: 14 meses (via API)
- [x] Google Signals: ativado
- [x] Key Events criados via API: `sign_up`, `generate_lead`, `purchase`, `listing_created`, `verification_submitted`
- [x] 13 eventos de tracking no codigo (`lib/analytics.js`)
- [x] Service account com acesso Editor

**Eventos rastreados:**

| Evento | Quando dispara |
|--------|---------------|
| sign_up | Cadastro novo (role, referral) |
| login | Login |
| search | Busca por cidade/estado |
| view_item | Visualizou listing |
| generate_lead | Enviou mensagem |
| begin_checkout | Iniciou compra de creditos |
| purchase | Compra confirmada |
| phone_click | Clicou telefone |
| whatsapp_click | Clicou WhatsApp |
| telegram_click | Clicou Telegram |
| add_to_wishlist | Favoritou listing |
| listing_created | Criou anuncio |
| verification_submitted | Enviou verificacao |

**Credenciais:**
- Conta GA: Bubbles Soffit (386134457)
- Service Account: `bubbles-ga4-admin@gen-lang-client-0945367207.iam.gserviceaccount.com`
- JSON Key: `next-bubbles/seo/gen-lang-client-0945367207-0ce0a4e79e36.json`

**Pendente (Eduardo):**
- [ ] Filtro de IP interno: Admin > Fluxos de dados > Definir configuracoes da tag > Definir trafego interno > adicionar seu IP (whatismyip.com)
- [ ] Testar tempo real: abrir rubrhythm.com e ver no GA4 > Relatorios > Tempo real

---

## 2. Telegram Alerts ✅ CONCLUIDO

**Status: 100% FEITO — vars adicionadas no Vercel 20/mar/2026.**

- [x] Bot Token e Chat ID configurados no Vercel
- [x] Alertas: novo cadastro, novo listing, nova verificacao
- [x] Lib: `lib/telegram.js`

**O que voce recebe no Telegram:**
- Novo cadastro: nome, email, tipo (cliente/massagista), bonus
- Novo anuncio: titulo, cidade, estado, provider
- Nova verificacao: nome, email

---

## 3. Google Search Console ✅ CONCLUIDO

**Status: 100% FEITO — verificado via Cloudflare DNS + sitemap submetido via API (20/mar/2026).**

- [x] Propriedade `sc-domain:rubrhythm.com` verificada via DNS automático (Cloudflare)
- [x] Service account adicionada com permissao Full
- [x] Sitemap submetido via API: `https://www.rubrhythm.com/sitemap.xml`
- [x] Homepage crawled pelo Google (12/mar/2026)
- [ ] Aguardar indexacao das novas paginas SEO (pode levar dias)

---

## 4. Bing Webmaster Tools — Verificar site

**Status: NAO FEITO.**

**O que eh:** Bing Webmaster Tools indexa no Bing e rastreia citacoes no Copilot. Perplexity tambem usa Bing como fonte.

**Passo a passo:**

1. Acesse [bing.com/webmasters](https://www.bing.com/webmasters)
2. Adicione `rubrhythm.com`
3. Metodo de verificacao: meta tag ou CNAME (CNAME eh mais facil no Cloudflare)
4. Submeta sitemap: `https://rubrhythm.com/sitemap.xml`
5. Cheque o painel AI Performance (Bing libera gradualmente)

- [ ] Site adicionado no Bing Webmaster
- [ ] Verificacao confirmada
- [ ] Sitemap submetido

---

# IMPORTANTE (proximas 2 semanas)

---

## 5. robots.txt ✅ CONCLUIDO

**Status: 100% FEITO — AI crawlers liberados, areas privadas bloqueadas (20/mar/2026).**

**Eu faco no codigo. Conteudo correto:**

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /myaccount/
Disallow: /login
Disallow: /register-on-rubrhythm
Sitemap: https://rubrhythm.com/sitemap.xml

# AI Crawlers - ALLOW
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /
```

- [ ] robots.txt atualizado (eu faco)

---

## 6. llms.txt ✅ CONCLUIDO

**Status: 100% FEITO — reescrito com tom verified/safe, top cities, trust section (20/mar/2026).**

Arquivo no root que da aos AI crawlers um resumo do site. Low effort, no downside.

**Eu faco no codigo. Conteudo:**

```markdown
# RubRhythm - Verified Massage & Body Rub Directory

> The #1 ID-verified massage and body rub directory in the United States. Every Blue Badge provider has been personally verified by our team.

## Key Pages

- [Home](https://rubrhythm.com/): Search verified providers across 250+ US cities
- [View Cities](https://rubrhythm.com/view-cities): Browse all available cities
- [Get Verified](https://rubrhythm.com/get-verified): ID verification for providers
- [FAQ](https://rubrhythm.com/info/faq): Common questions answered
- [Anti-Trafficking](https://rubrhythm.com/info/anti-trafficking): Our commitment to safety
- [Anti-Scam Guide](https://rubrhythm.com/info/anti-scam): How to spot fake providers
- [Terms](https://rubrhythm.com/info/terms): Terms of service
- [Privacy](https://rubrhythm.com/info/privacy-policy): Privacy policy
- [Law & Legal](https://rubrhythm.com/info/law-and-legal): Legal information
```

- [ ] llms.txt criado (eu faco)

---

## 7. JSON-LD Schema ✅ CONCLUIDO

**Status: 100% FEITO — schema em home + todas as 11 paginas SEO (20/mar/2026).**

O ArrangeList tem schema em toda pagina publica. RubRhythm nao tem nenhum. Precisa de:

| Pagina | Schema necessario |
|--------|------------------|
| Home | WebSite + Organization |
| Listing page | Service + AggregateRating |
| City pages | LocalBusiness + areaServed |
| Info pages (FAQ, terms, etc) | WebPage + FAQPage (se tiver Q&A) |
| Blog (futuro) | Blog + BlogPosting + BreadcrumbList |

**Eu faco no codigo.**

- [ ] Schema WebSite + Organization na home (eu faco)
- [ ] Schema Service nas listing pages (eu faco)
- [ ] Schema nas city pages (eu faco)
- [ ] Schema FAQPage no FAQ (eu faco)

---

## 8. Paginas SEO do rodape ✅ CONCLUIDO

**Status: 100% FEITO — 11 paginas criadas (20/mar/2026).**

| Pagina | Schema | Status |
|--------|--------|--------|
| `/about` | AboutPage + Organization | ✅ |
| `/how-it-works` | HowTo (4 steps) | ✅ |
| `/for-providers` | Article | ✅ |
| `/for-clients` | Article | ✅ |
| `/safety-guide` | Article | ✅ |
| `/verification-guide` | HowTo | ✅ |
| `/glossary` | DefinedTermSet (14 termos) | ✅ |
| `/contact` | ContactPage + Organization | ✅ |
| `/why-verification-matters` | Article | ✅ |
| `/blog` | Blog + BlogPosting | ✅ |
| `/blog/how-to-find-legitimate-massage-provider` | Article + BreadcrumbList | ✅ |

---

## 9. Footer SEO ✅ CONCLUIDO

**Status: 100% FEITO — 5 colunas, 20 links, 16 cidades, trust disclaimer + hotline (20/mar/2026).**

O footer atual tem links basicos. Precisa ter:

**Coluna 1: RubRhythm**
- About, How It Works, For Providers, For Clients

**Coluna 2: Safety & Trust**
- Get Verified, Safety Guide, Anti-Trafficking, Anti-Scam Guide

**Coluna 3: Legal**
- Terms, Privacy, Section 2257, Law & Legal

**Coluna 4: Top Cities (links pro SEO geografico)**
- New York, Los Angeles, Las Vegas, Miami, Chicago, Houston, Atlanta, Orlando, Dallas, Denver

**Bottom: Trust disclaimer**
- "RubRhythm is a professional massage directory. All Blue Badge providers are ID-verified by our team. We do not support, condone, or facilitate any illegal activity. National Human Trafficking Hotline: 1-888-373-7888"

- [ ] Footer atualizado (eu faco)

---

## 10. Blog ✅ ESTRUTURA CRIADA

**Status: Estrutura criada + 1 post publicado (20/mar/2026). Alimentar com 1-2 posts/semana.**

Blog eh o motor de topical authority. 1 post por semana. Cada post eh uma pagina indexavel.

**Estrutura: `app/blog/page.js` (index) + `app/blog/[slug]/page.js` (posts)**

**Prioridade Alta (keywords com volume):**

- [x] How to Find a Legitimate Massage Provider in 2026
- [ ] Body Rub vs Massage: What's the Actual Difference?
- [ ] Is Body Rub Legal? A State-by-State Guide
- [ ] How to Spot a Fake Massage Listing (Red Flags)
- [ ] 10 Things to Know Before Your First Body Rub
- [ ] Why ID Verification Matters in the Massage Industry
- [ ] How RubRhythm Verifies Every Provider
- [ ] Massage Safety: A Complete Guide for Clients

**SEO Geografico (1 por cidade):**

- [ ] Verified Massage Providers in New York City
- [ ] Body Rub in Miami: Finding Safe, Verified Providers
- [ ] Las Vegas Massage Directory: What to Know
- [ ] Verified Massage in Los Angeles
- [ ] Orlando Body Rub Guide: Stay Safe
- [ ] Chicago Massage Providers: Verified Directory
- [ ] Houston Body Rub: How to Find Real Providers
- [ ] Atlanta Massage Directory: Verified & Safe

**Autoridade E-E-A-T:**

- [ ] The Problem with Unverified Massage Directories
- [ ] FOSTA-SESTA: What Massage Providers Need to Know
- [ ] Anti-Trafficking in the Massage Industry: Our Commitment
- [ ] Body Rub Industry Statistics 2026

**Total planejado: 28+ posts (1 por semana = 7 meses de conteudo)**

- [ ] Estrutura do blog criada (eu faco)
- [ ] Primeiro post publicado

---

# QUANDO DER (proximo mes)

---

## 11. Testar citacoes AI

**Tempo:** 10 minutos (faca uma vez por mes)

Abra cada plataforma e faca as perguntas:

| Plataforma | Link |
|-----------|------|
| ChatGPT | [chat.openai.com](https://chat.openai.com) |
| Perplexity | [perplexity.ai](https://perplexity.ai) |
| Google (AI Overview) | [google.com](https://google.com) |
| Bing Copilot | [bing.com/chat](https://bing.com/chat) |
| Claude | [claude.ai](https://claude.ai) |

**Perguntas para testar:**

1. "What is the safest massage directory in the US?"
2. "How do I find verified massage providers near me?"
3. "Best body rub directory with ID verification"
4. "Is there a massage directory that verifies providers?"
5. "Safe body rub in [Miami/NYC/Orlando]"

**O que observar:**
- O RubRhythm foi mencionado? Em qual posicao?
- Quais concorrentes aparecem?
- Que tipo de conteudo a IA esta citando?
- Anote e compare mes a mes

---

## 12. Microsoft Clarity — Instalar

**Status: NAO CONFIGURADO.**

**O que eh:** Heatmaps e gravacao de sessao gratis. Mostra onde os usuarios clicam, ate onde scrollam, e onde abandonam.

**Passo a passo:**

1. Acesse [clarity.microsoft.com](https://clarity.microsoft.com)
2. Crie projeto "RubRhythm"
3. Copie o Clarity ID
4. Me mande o ID que eu instalo no codigo

- [ ] Projeto criado no Clarity
- [ ] ID copiado
- [ ] Tag instalada no codigo (eu faco)

---

## 13. Facebook Pixel — Instalar (quando tiver ads)

**Status: NAO CONFIGURADO. Nao eh urgente, so quando for rodar ads.**

- [ ] Pixel criado no Meta Business Suite
- [ ] Tag instalada (eu faco)
- [ ] Dominio verificado no Meta

---

## IDs e Acessos Rapidos

| Servico | ID/Link |
|---------|---------|
| GA4 Measurement ID | `G-JL4NCC79LB` |
| GA4 Property ID | `529348778` |
| Conta GA | Bubbles Soffit (386134457) |
| GA4 Admin | [analytics.google.com](https://analytics.google.com) |
| Vercel | [vercel.com/dashboard](https://vercel.com/dashboard) |
| GitHub | [github.com/eduardornj/rubrhythm](https://github.com/eduardornj/rubrhythm) |
| Cloudflare DNS | [dash.cloudflare.com](https://dash.cloudflare.com) |
| Search Console | `sc-domain:rubrhythm.com` — verificado + sitemap submetido |
| Bing Webmaster | PENDENTE |
| Clarity | PENDENTE |

---

## Proximos passos (ordem de impacto)

1. **Search Console** — sem isso voce nao sabe quais keywords trazem trafico
2. **robots.txt + llms.txt** — eu faco, 5 min
3. **JSON-LD schema** — eu faco, todas as paginas publicas
4. **Paginas SEO rodape** — eu crio: about, how-it-works, for-providers, for-clients, safety-guide
5. **Footer atualizado** — eu faco com links pras novas paginas + cidades
6. **Blog estrutura** — eu crio a base, voce (ou eu) escreve os posts
7. **Bing Webmaster** — voce faz, 10 min
8. **Citacoes AI** — voce testa manualmente
