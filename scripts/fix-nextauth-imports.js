const fs = require('fs');
const path = require('path');

// Lista de arquivos que precisam ser corrigidos
const filesToFix = [
  'app/api/gamification/rewards/route.js',
  'app/api/analytics/provider/route.js',
  'app/api/notifications/[id]/route.js',
  'app/api/push/send/route.js',
  'app/api/gamification/leaderboard/route.js',
  'app/api/notifications/[id]/read/route.js',
  'app/api/campaigns/[id]/route.js',
  'app/api/admin/escrow/route.js',
  'app/api/verification/request/route.js',
  'app/api/gamification/stats/route.js',
  'app/api/notifications/read-all/route.js',
  'app/api/push/subscribe/route.js',
  'app/api/admin/verification/route.js',
  'app/api/messages/conversations/route.js',
  'app/api/campaigns/route.js',
  'app/api/gamification/achievements/route.js',
  'app/api/gamification/rewards/[id]/claim/route.js',
  'app/api/messages/[conversationId]/route.js',
  'app/api/messages/send/route.js',
  'app/api/escrow/route.js',
  'app/api/campaigns/[id]/toggle/route.js'
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Arquivo não encontrado: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Substituir o import do getServerSession
  if (content.includes("import { getServerSession } from 'next-auth';")) {
    content = content.replace("import { getServerSession } from 'next-auth';", '');
    modified = true;
  }
  
  // Determinar o número correto de ../ baseado na profundidade do arquivo
  const depth = filePath.split('/').length - 2; // -2 porque começamos em app/api
  const authImportPath = '../'.repeat(depth) + 'auth';
  
  // Adicionar o import do auth se não existir
  if (!content.includes("import { auth } from")) {
    // Encontrar onde inserir o import
    const nextResponseImport = content.indexOf("import { NextResponse }");
    if (nextResponseImport !== -1) {
      const endOfLine = content.indexOf('\n', nextResponseImport);
      content = content.slice(0, endOfLine + 1) + 
                `import { auth } from '${authImportPath}';\n` + 
                content.slice(endOfLine + 1);
      modified = true;
    }
  }
  
  // Remover imports antigos do authOptions
  const authOptionsPatterns = [
    /import { authOptions } from '[^']*';\s*\n/g,
  ];
  
  authOptionsPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      modified = true;
    }
  });
  
  // Substituir getServerSession(authOptions) por auth()
  if (content.includes('getServerSession(authOptions)')) {
    content = content.replace(/getServerSession\(authOptions\)/g, 'auth()');
    modified = true;
  }
  
  if (content.includes('await getServerSession(authOptions)')) {
    content = content.replace(/await getServerSession\(authOptions\)/g, 'await auth()');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Corrigido: ${filePath}`);
  } else {
    console.log(`Já corrigido: ${filePath}`);
  }
}

console.log('Iniciando correção dos imports do next-auth para v5...');

filesToFix.forEach(fixFile);

console.log('Correção concluída!');