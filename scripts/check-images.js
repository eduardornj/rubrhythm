const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const listings = await p.listing.findMany({
    select: { id: true, title: true, images: true },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  for (const l of listings) {
    const imgs = Array.isArray(l.images) ? l.images : [];
    const formatted = imgs.map(img => {
      if (typeof img !== 'string') return null;
      if (img.startsWith('http') || img.startsWith('/')) return img;
      return '/api/secure-files?path=users/listings/' + img;
    }).filter(Boolean);

    console.log('\n' + l.title + ' -> ' + formatted.length + ' images');
    formatted.forEach((url, i) => console.log('  [' + i + '] ' + url.substring(0, 120)));
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
