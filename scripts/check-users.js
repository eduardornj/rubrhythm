const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db'
    }
  }
});

async function checkUsers() {
  try {
    console.log('👥 Checking existing users and listings...');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`\n📋 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'} (${user.email}) - Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
    });
    
    // Get all listings
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        userId: true
      },
      take: 5
    });
    
    console.log(`\n🏪 Found ${listings.length} listings:`);
    listings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title}`);
      console.log(`   ID: ${listing.id}`);
      console.log(`   Owner: ${listing.userId}`);
    });
    
    // Suggest valid test data
    if (users.length >= 2 && listings.length >= 1) {
      console.log(`\n✅ SUGGESTED TEST DATA:`);
      console.log(`   Client ID: ${users[0].id} (${users[0].name || users[0].email})`);
      console.log(`   Provider ID: ${users[1].id} (${users[1].name || users[1].email})`);
      console.log(`   Listing ID: ${listings[0].id} (${listings[0].title})`);
    } else {
      console.log(`\n⚠️  Not enough data for testing. Need at least 2 users and 1 listing.`);
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();