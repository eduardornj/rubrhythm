const fs = require('fs');
const path = require('path');

// Função para buscar arquivos recursivamente
function findFiles(dir, extension) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, extension));
    } else if (file.endsWith(extension)) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Função para analisar arquivo
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  const analysis = {
    file: relativePath,
    usesPrisma: false,
    usesFileSystem: false,
    usesLocalFiles: false,
    issues: []
  };
  
  // Verificar se usa Prisma
  if (content.includes('prisma.') || content.includes('PrismaClient')) {
    analysis.usesPrisma = true;
  }
  
  // Verificar se usa sistema de arquivos para dados
  if (content.includes('fs.readFile') || content.includes('fs.writeFile') || 
      content.includes('readFileSync') || content.includes('writeFileSync')) {
    analysis.usesFileSystem = true;
  }
  
  // Verificar se importa arquivos de dados locais
  const dataImports = content.match(/import.*from.*['"]\.\.?\/.*data.*['"];?/g);
  if (dataImports) {
    analysis.usesLocalFiles = true;
    analysis.issues.push(`Importa arquivos de dados: ${dataImports.join(', ')}`);
  }
  
  // Verificar padrões problemáticos
  if (content.includes('require(') && content.includes('data/')) {
    analysis.usesLocalFiles = true;
    analysis.issues.push('Usa require() para importar dados locais');
  }
  
  if (analysis.usesFileSystem && !analysis.usesPrisma) {
    analysis.issues.push('Usa sistema de arquivos mas não Prisma');
  }
  
  if (analysis.usesLocalFiles && !analysis.usesPrisma) {
    analysis.issues.push('Usa arquivos locais de dados em vez de banco');
  }
  
  return analysis;
}

console.log('=== ANÁLISE DAS APIs ===\n');

// Buscar todos os arquivos route.js na pasta api
const apiDir = path.join(process.cwd(), 'app', 'api');
const routeFiles = findFiles(apiDir, 'route.js');

let totalFiles = 0;
let filesWithIssues = 0;
let filesUsingPrisma = 0;
let filesUsingLocalData = 0;

routeFiles.forEach(file => {
  const analysis = analyzeFile(file);
  totalFiles++;
  
  if (analysis.usesPrisma) {
    filesUsingPrisma++;
  }
  
  if (analysis.usesLocalFiles || (analysis.usesFileSystem && !analysis.usesPrisma)) {
    filesUsingLocalData++;
    filesWithIssues++;
    
    console.log(`❌ ${analysis.file}`);
    console.log(`   Usa Prisma: ${analysis.usesPrisma ? 'Sim' : 'Não'}`);
    console.log(`   Usa arquivos locais: ${analysis.usesLocalFiles ? 'Sim' : 'Não'}`);
    console.log(`   Usa sistema de arquivos: ${analysis.usesFileSystem ? 'Sim' : 'Não'}`);
    if (analysis.issues.length > 0) {
      console.log(`   Problemas: ${analysis.issues.join(', ')}`);
    }
    console.log('');
  } else if (analysis.usesPrisma) {
    console.log(`✅ ${analysis.file} - Usando Prisma corretamente`);
  } else {
    console.log(`⚠️  ${analysis.file} - Não usa Prisma nem arquivos locais`);
  }
});

console.log('\n=== RESUMO ===');
console.log(`Total de APIs: ${totalFiles}`);
console.log(`APIs usando Prisma: ${filesUsingPrisma}`);
console.log(`APIs usando dados locais: ${filesUsingLocalData}`);
console.log(`APIs com problemas: ${filesWithIssues}`);
console.log(`Porcentagem usando MySQL: ${Math.round((filesUsingPrisma / totalFiles) * 100)}%`);

if (filesWithIssues === 0) {
  console.log('\n🎉 Todas as APIs estão conectadas ao MySQL!');
} else {
  console.log(`\n⚠️  ${filesWithIssues} APIs precisam ser migradas para MySQL`);
}