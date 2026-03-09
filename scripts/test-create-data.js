const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    // Create test user
    const user = await prisma.user.create({
      data: {
        id: 'test_user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'provider'
      }
    });
    console.log('User created:', user.id);

    // Create test listing
    const listing = await prisma.listing.create({
      data: {
        id: 'test_listing_123',
        title: 'Test Massage',
        description: 'Test description',
        city: 'Los Angeles',
        state: 'California',
        serviceLocation: 'Incall',
        phoneArea: '555',
        phoneNumber: '1234567',
        bodyType: 'Average',
        ethnicity: 'Other',
        isApproved: true,
        userId: user.id
      }
    });
    console.log('Listing created:', listing.id);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();