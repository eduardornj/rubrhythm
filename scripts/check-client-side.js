const puppeteer = require('puppeteer');

async function checkClientSide() {
  let browser;
  try {
    console.log('=== VERIFICANDO LADO CLIENTE ===\n');
    
    browser = await puppeteer.launch({ headless: false, devtools: true });
    const page = await browser.newPage();
    
    // Capturar erros do console
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Capturar erros de rede
    const networkErrors = [];
    page.on('requestfailed', request => {
      networkErrors.push(`${request.url()} - ${request.failure().errorText}`);
    });
    
    console.log('Navegando para a página...');
    await page.goto('http://localhost:1001/united-states/florida/orlando/massagists/massage-therapy-by-sofia-cmfj5kaq10002u1cwo64k3dyk', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Aguardar um pouco para o JavaScript carregar
    await page.waitForTimeout(5000);
    
    // Verificar se a seção de featured listings existe
    const featuredSection = await page.$('h2:contains("Body Rub Providers Similar To")');
    console.log('Seção de featured listings encontrada:', !!featuredSection);
    
    // Verificar se há elementos com "FEATURED"
    const featuredBadges = await page.$$eval('*', elements => 
      elements.filter(el => el.textContent && el.textContent.includes('FEATURED')).length
    );
    console.log('Badges FEATURED encontrados:', featuredBadges);
    
    // Verificar estado do React
    const reactState = await page.evaluate(() => {
      // Tentar acessar o estado do React através do DOM
      const scripts = Array.from(document.querySelectorAll('script'));
      const nextData = scripts.find(s => s.innerHTML.includes('__NEXT_DATA__'));
      return nextData ? 'Next.js detectado' : 'Next.js não detectado';
    });
    console.log('Estado do React/Next.js:', reactState);
    
    console.log('\n=== ERROS DO CONSOLE ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    console.log('\n=== ERROS DE REDE ===');
    networkErrors.forEach(err => console.log(err));
    
    // Aguardar um pouco antes de fechar
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

checkClientSide();