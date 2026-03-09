# 🏗️ Plano de Reestruturação do Painel Admin (RubRhythm)

> Desenvolvido pelos agentes **@[project-planner]** e **@[code-archaeologist]** aplicando as skills `clean-code`, `mcp-builder` e ferramentas de UI/UX premium.

## 🎯 Objetivo
Transformar o Painel de Administração atual em um ecossistema seguro, à prova de falhas (com tratamento de erro transparente), visualmente impressionante no padrão UI/UX 2026 e 100% preparado para ser comandado por IA (via protocolo MCP).

---

## 📂 1. Nova Hierarquia de API (Clean Code & Segurança)
**O Problema Atual:** Existem dezenas de pastas soltas com nomes no plural/singular (`/verifications` vs `/verification`), lógicas misturadas e retornos não padronizados.
**A Solução:** Consolidar tudo sob endpoints definitivos e organizados por "Entidade".

### Estrutura Proposta da API Admin
```plaintext
app/api/admin/
├── system/               # Dados do servidor (Status, Visão Geral/Stats)
│   └── route.js          # API unificada do Dashboard Home
├── users/                # Gerenciamento de Usuários (Bans, Buscas)
│   └── route.js
├── listings/             # Gestão de Anúncios (Aprovação, Bumps, Features)
│   └── route.js
├── verifications/        # Identidades (O que acabamos de consertar)
│   └── route.js
├── financial/            # Dinheiro (Créditos, Escrow, Históricos)
│   └── route.js
└── reviews/              # Moderação de Texto/Comentários
    └── route.js
```

---

## 🤖 2. Padronização de Dados Puros (Pronto para o MCP)
**O Problema Atual:** O Admin tem falhas que retornam arrays vazios `[]` quando há erros internos (ex: o campo do prisma "isVerified" estava quebrando e a interface não avisava).
**A Solução (Preparando o MCP):** As APIs vão parar de tentar agradar a interface web. Elas retornarão o formato rígido MCP-Ready. Isso garante que no futuro o *Claude Desktop* ou outra IA possa ler e atuar diretamente nesses dados.

### Exemplo do Padrão Obrigatório de Retorno (JSON)
```json
{
  "success": true,
  "data": { ... payload limpo sem HTML da entidade ... },
  "metadata": {
    "count": 10,
    "timestamp": "2026-02-25T14:00:00Z"
  }
}
```
*Se falhar, o retorno obrigatório será:*
```json
{
  "success": false,
  "error": {
    "code": "DB_QUERY_FAILED",
    "message": "Coluna 'isVerified' não existe na tabela User."
  }
}
```
*(O frontend web lerá este erro e mostrará um Pop-up/Toast Vermelho gigante na tela do Admin para alertar o dev na hora, em vez de morrer silenciosamente).*

---

## 🎨 3. Reconstrução Visual (Frontend Premium)
**O Problema Atual:** Estilos CSS soltos (`bg-white/5`, `bg-yellow-500/10`) jogados proceduralmente nas páginas sem um Design System. Interfaces não respiram.
**A Solução:** Aplicação militar das skills `ui-ux-pro-max`, `frontend-design` e `tailwind-patterns`.

### A. Elementos Core (Design System Admin)
1. **Paleta Intencional:**
   - **Superfícies:** Escuros luxuosos e gradientes radiais sutis (ex: `bg-neutral-950`).
   - **Acentos:** O Dourado/Roxo que usamos na marca para botões primários.
   - **Cartões (Glassmorphism Controlado):** Fundo translúcido `bg-white/5` mas sempre combinado com `border-white/10` e um `backdrop-blur-xl`.
2. **Tipografia Distintiva:**
   - Vamos usar tracking (espaçamento de letras) mais largo para subtítulos e métricas gigantes (ex: `tracking-tight font-black text-5xl`).

### B. Esboço de Componentes Reutilizáveis (Layouts)
Para não ter que refazer modais e listas toda vez, criaremos "peças de Lego":
- **`<AdminStatCard />`**: Elemento que pulsa suavemente quando tem pendências críticas (Verificações ou Escrows em disputa).
- **`<AdminDataTable />`**: Uma tabela padrão flexível que recebe os dados limpos das APIs preparadas acima. Com paginação elegante inserida.
- **`<AdminDangerAction />`**: Botões de Banir/Rejeitar que exigem duplo clique ou digitação de motivo (usando a cor `red-500/20` com glow vermelho no hover).

---

## 🚀 4. Como esse Arquivo e o MCP vão Conversar no Futuro
Quando formos aplicar a skill `mcp-builder` ao final do projeto, criaremos o Servidor MCP na raiz (fora do App Next.js) que se listará assim:
- `Tool: admin_get_stats` ➔ Puxa `app/api/admin/system` (Dado limpo)
- `Tool: admin_approve_verification` ➔ Puxa `app/api/admin/verifications` com `PUT`.

*(Você poderá dizer pro seu chatbot local: "Eu tenho pendências?" e ele te dirá com voz: "Sim, Isabela e 3 massagistas estão aguardando". Tudo alimentado por esta refatoração transparente que faremos agora)*.

---
**Status Final:** Arquitetura traçada. Aguardando comando para iniciar a demolição e reescrita do Frontend e das APIs do Painel Admin (Passo 3 e 4).
