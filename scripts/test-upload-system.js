/**
 * Teste do Sistema de Upload
 * Verifica se o organized-upload-manager está funcionando
 */

const { uploadFiles } = require('./lib/organized-upload-manager');
const fs = require('fs');
const path = require('path');

async function testUploadSystem() {
  try {
    console.log('=== TESTANDO SISTEMA DE UPLOAD ===');
    
    // Verificar se o arquivo organized-upload-manager existe
    const managerPath = path.join(__dirname, 'lib', 'organized-upload-manager.js');
    console.log('Verificando arquivo:', managerPath);
    
    if (!fs.existsSync(managerPath)) {
      console.error('❌ Arquivo organized-upload-manager.js não encontrado!');
      return;
    }
    
    console.log('✅ Arquivo organized-upload-manager.js encontrado');
    
    // Verificar se a função uploadFiles está disponível
    if (typeof uploadFiles !== 'function') {
      console.error('❌ Função uploadFiles não está disponível!');
      console.log('Tipo de uploadFiles:', typeof uploadFiles);
      return;
    }
    
    console.log('✅ Função uploadFiles está disponível');
    
    // Verificar diretório de storage
    const storageDir = path.join(__dirname, 'private', 'storage');
    console.log('Verificando diretório de storage:', storageDir);
    
    if (!fs.existsSync(storageDir)) {
      console.log('📁 Criando diretório de storage...');
      fs.mkdirSync(storageDir, { recursive: true });
    }
    
    console.log('✅ Diretório de storage OK');
    
    // Verificar diretório de listings
    const listingsDir = path.join(storageDir, 'users', 'listings');
    console.log('Verificando diretório de listings:', listingsDir);
    
    if (!fs.existsSync(listingsDir)) {
      console.log('📁 Criando diretório de listings...');
      fs.mkdirSync(listingsDir, { recursive: true });
    }
    
    console.log('✅ Diretório de listings OK');
    
    // Listar arquivos existentes
    const existingFiles = fs.readdirSync(listingsDir);
    console.log('📋 Arquivos existentes no diretório listings:', existingFiles.length);
    existingFiles.forEach(file => console.log('  -', file));
    
    console.log('\n=== TESTE CONCLUÍDO ===');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('Stack:', error.stack);
  }
}

testUploadSystem();