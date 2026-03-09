const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveListing() {
  try {
    console.log('🔄 Aprovando anúncio "Comfort mobile body rubs"...');
    
    const updated = await prisma.listing.update({
      where: { id: 'cmfadq72b0011u1h0a6mqhzoy' },
      data: { isApproved: true }
    });
    
    console.log('✅ Anúncio aprovado:', updated.title);
    console.log('📍 Cidade:', updated.city);
    console.log('🏷️ Estado:', updated.state);
    console.log('✅ Status aprovado:', updated.isApproved);
    
  } catch (error) {
    console.error('❌ Erro ao aprovar anúncio:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveListing();