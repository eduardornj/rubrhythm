const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testChatData() {
  try {
    console.log('🔍 Checking users...');
    const users = await prisma.user.findMany({ take: 2 });
    console.log('Users:', users.map(u => ({ id: u.id, email: u.email })));
    
    console.log('\n🔍 Checking listings...');
    const listings = await prisma.listing.findMany({ 
      take: 2, 
      include: { 
        user: { 
          select: { id: true, email: true } 
        } 
      } 
    });
    console.log('Listings:', listings.map(l => ({ 
      id: l.id, 
      title: l.title, 
      userId: l.userId, 
      userEmail: l.user?.email 
    })));
    
    if (users.length > 0 && listings.length > 0) {
      console.log('\n✅ Test data available:');
      console.log('Client ID:', users[0].id);
      console.log('Provider ID:', listings[0].userId);
      console.log('Listing ID:', listings[0].id);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testChatData();