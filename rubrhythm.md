---
name: RubRhythm - projeto SaaS completo
description: Diretorio SaaS de massagistas/body rub providers nos EUA. Stack, infra, deploy, bugs, status de cada modulo.
type: project
---

## O que e o RubRhythm
Diretorio SaaS de massagistas e body rub providers nos EUA. Providers criam perfis, clientes buscam por cidade/estado. Sistema de creditos, chat pago, verificação de ID, badges premium/featured/highlighted, compliance FOSTA-SESTA completo.

**Pasta:** `C:\Users\eDuArDoXP\.openclaw\workspace\rubrhythm\`

**Why:** Projeto SaaS secundario de Eduardo, separado do negocio de home services.

**How to apply:** Contexto tecnico completo abaixo. Sempre checar restricoes de versao antes de atualizar pacotes.

---

## Stack e Versoes (TRAVADAS — nao atualizar)
- Next.js: **15.5.12** (next-auth v5 incompativel com v16+)
- React: 19
- Tailwind CSS: v4
- Prisma ORM: **6.6.0**
- NextAuth: **5.0.0-beta.29**
- DB: MySQL (TiDB Cloud Serverless) + MySQL local (XAMPP dev)
- Hosting: Vercel Hobby (deploy automatico via git push)
- Storage: Vercel Blob (rubrhythm-uploads, 500MB free)
- Email: Resend (dominio rubrhythm.com verificado)
- Pagamento: NowPayments (Bitcoin) — Stripe NAO configurado

---

## URLs e Acessos
- **Produção:** https://rubrhythm.com + https://www.rubrhythm.com
- **Vercel fallback:** https://rubrhythm.vercel.app
- **Repo:** github.com/eduardornj/rubrhythm (branch: main)
- **Painel admin:** /admin — email: admin@rubrhythm.com, senha: Admin@2026!
- **Dev local:** http://localhost:1001 (`npm run dev`)

---

## Banco de Dados
### Produção (TiDB Cloud Serverless)
- Host: `gateway01.us-east-1.prod.aws.tidbcloud.com:4000`
- User: `3S4SYwQdEosx8nz.root`
- Password: `qi2uqaIpieVS4dIp`
- DB: `rubrhythm`
- SSL obrigatorio (`?sslaccept=strict`)
- Plano: Serverless Free (5GB)

### Local (dev — XAMPP)
- `/c/xampp/mysql/bin/mysql.exe`
- User: `rubrhythm`, senha: `aadd268acf2fb73d948a8ce19ffd4a02`
- Host: localhost:3306, DB: rubrhythm
- ATENÇÃO: `.env` local aponta para TiDB (produção) por padrao

### Conectar ao TiDB via terminal
```bash
/c/xampp/mysql/bin/mysql.exe -u "3S4SYwQdEosx8nz.root" -pqi2uqaIpieVS4dIp -h gateway01.us-east-1.prod.aws.tidbcloud.com -P 4000 --ssl --default-character-set=utf8mb4 rubrhythm
```

---

## DNS (Cloudflare)
- **CRITICO:** DNS DEVE ser "DNS only" (gray cloud) — orange cloud quebra verificação Vercel e Resend
- A: `rubrhythm.com` → 216.198.79.1 (Vercel)
- CNAME: `www` → `ea161d08ef255f64.vercel-dns-017.com.`
- TXT: `resend._domainkey` — Resend DKIM
- MX: `send` → feedback-smtp.us-east-1.amazonses.com (Resend SPF bounce)
- TXT: `send` → `v=spf1 include:amazonses.com ~all`
- TXT: `_dmarc` → `v=DMARC1; p=none;`

---

## Env Vars (Vercel) — CHAVES REAIS (10/mar/2026)
| Variavel | Valor |
|----------|-------|
| NEXTAUTH_SECRET | `wsJnPpCs/KTW61EJoqJX01UIP4CZR7KFcm5b/LGejE2Yis+QOivZYGOT5ooFuDQj` |
| NEXTAUTH_URL | `https://rubrhythm.com` |
| DATABASE_URL | `mysql://3S4SYwQdEosx8nz.root:qi2uqaIpieVS4dIp@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/rubrhythm?sslaccept=strict` |
| NOWPAYMENTS_API_KEY | `BJX82H8-RF8MFKC-PN5CEBX-05Y54EM` |
| NOWPAYMENTS_IPN_SECRET | `nTCI06KArozRr5+ouogfqP3so/lXu3qo` |
| RESEND_API_KEY | `re_6Bj2mTTc_jas1J2qK3cCRihVrXqG6eigL` |
| EMAIL_FROM | `RubRhythm <noreply@rubrhythm.com>` |
| CRON_SECRET | `cf3b7843246b2a4a3552ee6dc819175d1a37e18fd07ec0a0b84620f81e7b4ae6` |
| BLOB_READ_WRITE_TOKEN | `vercel_blob_rw_xyN3cM3fWWtBtSNu_Zy7GVkVn1gTuYVjWthXzSoCIYCpMnC` |
| TELEGRAM_BOT_TOKEN | `8106013583:AAGunAdgWPiavf6hso4uJYgB6lWsdBiHLVA` |
| TELEGRAM_CHAT_ID | `1715908263` |

Telegram vars adicionadas no Vercel em 2026-03-20.

---

## Google Analytics 4 (GA4)
- **Measurement ID:** `G-JL4NCC79LB`
- **Property ID:** `529348778` (properties/529348778)
- **Data Stream ID:** `14156660706`
- **Conta GA:** Bubbles Soffit (386134457)
- **Tag:** Inline gtag.js no `app/layout.tsx`
- **Service Account com acesso Editor:** `bubbles-ga4-admin@gen-lang-client-0945367207.iam.gserviceaccount.com`
- **Credencial JSON:** `next-bubbles/seo/gen-lang-client-0945367207-0ce0a4e79e36.json`

### Configuracao via API (feita 2026-03-20)
- Retencao de dados: **14 meses** (era 2 meses)
- Google Signals: PENDENTE (precisa ativar manual no painel, API exige aceite de termos)
- Key Events criados: `sign_up`, `generate_lead`, `purchase`, `listing_created`, `verification_submitted`

### Eventos rastreados no codigo (`lib/analytics.js`)
| Evento | Onde dispara |
|--------|-------------|
| `sign_up` | Register (role, referral) |
| `login` | Login |
| `search` | Search results (cidade, estado) |
| `view_item` | Listing page + ListingProfileClient |
| `generate_lead` | Chat/mensagem enviada |
| `purchase` / `begin_checkout` | Compra de creditos |
| `phone_click` | Clique telefone no listing |
| `whatsapp_click` | Clique WhatsApp no listing |
| `telegram_click` | Clique Telegram no listing |
| `add_to_wishlist` | Favoritar listing |
| `listing_created` | Criar anuncio |
| `verification_submitted` | Enviar verificacao |

---

## Prisma GOTCHA
- `npx prisma generate` falha se Next.js estiver rodando (EPERM no Windows)
- Parar servidor ANTES de rodar prisma generate
- Se der EPERM: `Remove-Item -Recurse -Force "prisma/generated/client"` depois `npx prisma generate`
- Usar `npx prisma db push` (nao migrate dev) em dev
- Todos os arquivos importam de `@/lib/prisma` (singleton)
- Relação review→user: nome gerado `user_review_reviewerIdTouser` (NAO `reviewer`)

---

## Status por Modulo (10/mar/2026)

### COMPLETO
- Fase 5: Available Now, Wizard Onboarding, SEO Cities, Referral, Reviews
- Remediação 4 Fases: Seguranca, Infra, Performance, Qualidade
- Audit 4-Rounds: Security hardening, SEO, Performance, Dead code
- FOSTA-SESTA Compliance (Fases 1-10): Age Gate, Founding Provider, Content Policy, Content Filter, Section 2257, Chat moderation
- Content Filter: `lib/contentFilter.js` — ~70 RED (auto-block) + ~30 YELLOW (flag admin)
- Content Scan: `app/admin/content-scan/` — escaneia listings do DB
- OG dinamico em listing pages
- Vercel Blob storage (7 rotas migradas)
- FloatingBar redesenhado

### PENDENTE (ação do Eduardo)
- Stripe: chaves vazias, pagamento real nao existe
- Google Search Console: adicionar rubrhythm.com como nova propriedade
- Providers reais via Reddit (r/SexWorkers, r/ClientsAndCompanions, r/OrlandoSex, max 5 DMs/dia)

---

## Bugs conhecidos (abertos)
1. `/search-results` — URLs geram `/united-states/undefined/undefined/` (state/city nao vem da API)
2. Admin financeiro — Volume Financeiro mostra $0.00 (query em `app/api/admin/system/route.js` nao soma creditos)

## Polish pendente
- Sidebar myaccount: remover labels "(Test)"
- Provider dashboard separado (`app/myaccount/provider-dashboard/`): deletar, integrar no dashboard principal
- Header.js refactor (527 linhas) — alto risco de quebrar UI

---

## Arquitetura pos-audit
- CSP: `script-src 'self' 'unsafe-inline'` (sem unsafe-eval)
- HSTS: max-age=31536000; includeSubDomains; preload
- Middleware: Edge Runtime, checa banned via JWT (sem Prisma)
- JWT sync: throttled 5min (token.lastDbSync)
- Rate limiting: in-memory Map (funciona por instancia Vercel; ideal seria Upstash Redis)
- Pricing: server-side only via `lib/feature-pricing.js`
- Images: next/image com fill+sizes em ListingCard

## Plano de badges (pendente)
- Arquivo do plano: `C:\Users\eDuArDoXP\.claude\plans\glowing-questing-pillow.md`
- Melhorar badges publicos (Premium, Featured, Verified, Highlighted, WhatsApp)
- Trocar emojis por SVG icons profissionais
