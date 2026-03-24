const crypto = require('crypto');
const fs = require('fs');

const key = JSON.parse(fs.readFileSync('c:/Users/eDuArDoXP/.openclaw/workspace/next-bubbles/seo/gen-lang-client-0945367207-0ce0a4e79e36.json'));

function mkJwt(scope) {
  const h = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const p = Buffer.from(JSON.stringify({ iss: key.client_email, scope, aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now })).toString('base64url');
  const s = crypto.createSign('RSA-SHA256');
  s.update(h + '.' + p);
  return h + '.' + p + '.' + s.sign(key.private_key, 'base64url');
}

async function gaReport(token, body) {
  const r = await fetch('https://analyticsdata.googleapis.com/v1beta/properties/529348778:runReport', {
    method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return r.json();
}

async function scQuery(token, body) {
  const r = await fetch('https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Arubrhythm.com/searchAnalytics/query', {
    method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return r.json();
}

async function run() {
  const t1 = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + mkJwt('https://www.googleapis.com/auth/analytics.readonly') });
  const { access_token: ga } = await t1.json();

  const t2 = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + mkJwt('https://www.googleapis.com/auth/webmasters.readonly') });
  const { access_token: sc } = await t2.json();

  // GA4 - 7 days overview
  console.log('========== GA4 - ULTIMOS 7 DIAS ==========');
  const d1 = await gaReport(ga, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'averageSessionDuration' }, { name: 'bounceRate' }, { name: 'newUsers' }, { name: 'engagedSessions' }] });
  if (d1.rows && d1.rows[0]) {
    const v = d1.rows[0].metricValues;
    console.log('Usuarios ativos:', v[0].value);
    console.log('Sessoes:', v[1].value);
    console.log('Page views:', v[2].value);
    console.log('Duracao media:', Math.round(parseFloat(v[3].value)) + 's (' + Math.round(parseFloat(v[3].value) / 60) + 'min)');
    console.log('Bounce rate:', (parseFloat(v[4].value) * 100).toFixed(1) + '%');
    console.log('Novos usuarios:', v[5].value);
    console.log('Sessoes engajadas:', v[6].value);
  }

  // GA4 - 30 days
  console.log('\n========== GA4 - ULTIMOS 30 DIAS ==========');
  const d1b = await gaReport(ga, { dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'newUsers' }] });
  if (d1b.rows && d1b.rows[0]) {
    const v = d1b.rows[0].metricValues;
    console.log('Usuarios ativos:', v[0].value);
    console.log('Sessoes:', v[1].value);
    console.log('Page views:', v[2].value);
    console.log('Novos usuarios:', v[3].value);
  }

  // Top pages
  console.log('\n========== TOP PAGINAS (7d) ==========');
  const d2 = await gaReport(ga, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 15 });
  if (d2.rows) { d2.rows.forEach(r => console.log(r.dimensionValues[0].value.substring(0, 55).padEnd(55), 'views:', r.metricValues[0].value.padStart(4), 'users:', r.metricValues[1].value)); }

  // Events
  console.log('\n========== EVENTOS (7d) ==========');
  const d3 = await gaReport(ga, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 15 });
  if (d3.rows) { d3.rows.forEach(r => console.log(r.dimensionValues[0].value.padEnd(30), r.metricValues[0].value)); }

  // Traffic sources
  console.log('\n========== FONTES DE TRAFEGO (7d) ==========');
  const d4 = await gaReport(ga, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 10 });
  if (d4.rows) { d4.rows.forEach(r => console.log((r.dimensionValues[0].value + ' / ' + r.dimensionValues[1].value).padEnd(35), 'sessions:', r.metricValues[0].value.padStart(3), 'users:', r.metricValues[1].value)); }

  // Devices
  console.log('\n========== DISPOSITIVOS (7d) ==========');
  const d5 = await gaReport(ga, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] });
  if (d5.rows) { d5.rows.forEach(r => console.log(r.dimensionValues[0].value.padEnd(15), 'sessions:', r.metricValues[0].value.padStart(3), 'users:', r.metricValues[1].value)); }

  // Countries
  console.log('\n========== PAISES (7d) ==========');
  const d6 = await gaReport(ga, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], dimensions: [{ name: 'country' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 10 });
  if (d6.rows) { d6.rows.forEach(r => console.log(r.dimensionValues[0].value.padEnd(25), 'sessions:', r.metricValues[0].value.padStart(3), 'users:', r.metricValues[1].value)); }

  // Custom dimensions - searches
  console.log('\n========== BUSCAS POR CIDADE (7d) ==========');
  const d7 = await gaReport(ga, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], dimensions: [{ name: 'customEvent:city' }, { name: 'customEvent:state' }], metrics: [{ name: 'eventCount' }], dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'search' } } }, orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 10 });
  if (d7.rows && d7.rows.length > 0) { d7.rows.forEach(r => console.log((r.dimensionValues[0].value + ', ' + r.dimensionValues[1].value).padEnd(35), r.metricValues[0].value + ' buscas')); } else { console.log('Sem dados ainda (custom dimensions novas, 24-48h)'); }

  // Listings viewed
  console.log('\n========== LISTINGS MAIS VISTOS (7d) ==========');
  const d7b = await gaReport(ga, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], dimensions: [{ name: 'customEvent:item_name' }], metrics: [{ name: 'eventCount' }], dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { value: 'view_item' } } }, orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit: 10 });
  if (d7b.rows && d7b.rows.length > 0) { d7b.rows.forEach(r => console.log(r.dimensionValues[0].value.substring(0, 45).padEnd(45), r.metricValues[0].value + ' views')); } else { console.log('Sem dados ainda'); }

  // Search Console - queries
  console.log('\n========== SEARCH CONSOLE - QUERIES (30d) ==========');
  const d8 = await scQuery(sc, { startDate: '2026-02-22', endDate: '2026-03-24', dimensions: ['query'], rowLimit: 15 });
  if (d8.rows && d8.rows.length > 0) { d8.rows.forEach(r => console.log(r.keys[0].padEnd(40), 'clicks:', String(r.clicks).padStart(3), 'imp:', String(r.impressions).padStart(4), 'CTR:', (r.ctr * 100).toFixed(1) + '%', 'pos:', r.position.toFixed(1))); } else { console.log('Sem dados'); }

  // Search Console - pages
  console.log('\n========== SEARCH CONSOLE - TOP PAGINAS (30d) ==========');
  const d9 = await scQuery(sc, { startDate: '2026-02-22', endDate: '2026-03-24', dimensions: ['page'], rowLimit: 10 });
  if (d9.rows && d9.rows.length > 0) { d9.rows.forEach(r => console.log(r.keys[0].substring(0, 60).padEnd(60), 'clicks:', String(r.clicks).padStart(3), 'imp:', String(r.impressions).padStart(4))); } else { console.log('Sem dados'); }

  // Search Console - devices
  console.log('\n========== SEARCH CONSOLE - DISPOSITIVOS (30d) ==========');
  const d10 = await scQuery(sc, { startDate: '2026-02-22', endDate: '2026-03-24', dimensions: ['device'], rowLimit: 5 });
  if (d10.rows && d10.rows.length > 0) { d10.rows.forEach(r => console.log(r.keys[0].padEnd(15), 'clicks:', String(r.clicks).padStart(3), 'imp:', String(r.impressions).padStart(4), 'CTR:', (r.ctr * 100).toFixed(1) + '%')); }

  // Sitemap
  console.log('\n========== SITEMAP STATUS ==========');
  const r11 = await fetch('https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Arubrhythm.com/sitemaps', { headers: { 'Authorization': 'Bearer ' + sc } });
  const d11 = await r11.json();
  (d11.sitemap || []).forEach(s => console.log(s.path, '| submitted:', s.contents?.[0]?.submitted || '?', '| indexed:', s.contents?.[0]?.indexed || '?'));

  // Indexing status of key pages
  console.log('\n========== INDEXACAO - PAGINAS CHAVE ==========');
  const jwt3 = mkJwt('https://www.googleapis.com/auth/webmasters');
  const t3 = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt3 });
  const { access_token: scWrite } = await t3.json();
  const urls = ['https://www.rubrhythm.com/', 'https://www.rubrhythm.com/about', 'https://www.rubrhythm.com/united-states/florida/orlando', 'https://www.rubrhythm.com/blog', 'https://www.rubrhythm.com/for-providers'];
  for (const url of urls) {
    const r = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + scWrite, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspectionUrl: url, siteUrl: 'sc-domain:rubrhythm.com' })
    });
    const d = await r.json();
    const idx = d.inspectionResult?.indexStatusResult;
    console.log(url.replace('https://www.rubrhythm.com', '').padEnd(40) || '/'.padEnd(40), idx?.verdict || 'N/A', '|', idx?.coverageState || 'N/A');
  }

  console.log('\n========== DONE ==========');
}

run().catch(e => console.error(e));
