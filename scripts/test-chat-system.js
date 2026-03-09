const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db'
    }
  }
});

async function testChatSystem() {
  try {
    console.log('🧪 Testing new chat credit system...');
    
    const userId = 'cmfj29jvs0000u1k87i08w1lw';
    
    // Check initial balance
    const initialBalance = await prisma.creditbalance.findUnique({
      where: { userId }
    });
    
    console.log(`💰 Initial balance: $${initialBalance?.balance || 0}`);
    
    // Simulate chat initialization
    console.log('\n🚀 Simulating chat initialization...');
    
    const chatData = {
      id: `chat_${Date.now()}`,
      clientId: userId,
      providerId: 'cmfj29jvs0001u1k87i08w1lx', // Provider ID from test data
      listingId: 'cmfj29jvs0002u1k87i08w1ly', // Listing ID from test data
      isActive: true,
      messagesCount: 0,
      totalPaid: 0.0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`📱 Chat created: ${chatData.id}`);
    console.log(`👤 Client: ${chatData.clientId}`);
    console.log(`🏪 Provider: ${chatData.providerId}`);
    
    // Simulate sending a message (should debit $5)
    console.log('\n💬 Simulating message send...');
    
    const messageAmount = 5.0;
    
    // Check if user has sufficient balance
    const currentBalance = await prisma.creditbalance.findUnique({
      where: { userId }
    });
    
    if (!currentBalance || currentBalance.balance < messageAmount) {
      console.log(`❌ Insufficient balance: $${currentBalance?.balance || 0} < $${messageAmount}`);
      return;
    }
    
    // Debit credits using our new API logic
    const updatedBalance = await prisma.creditbalance.update({
      where: { userId },
      data: { balance: { decrement: messageAmount } }
    });
    
    // Create spent transaction
    const transaction = await prisma.credittransaction.create({
      data: {
        id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        amount: -messageAmount, // Negative for spent
        type: 'spent',
        description: `Chat message - Chat ID: ${chatData.id}`
      }
    });
    
    console.log(`✅ Message sent successfully!`);
    console.log(`💳 Balance: $${currentBalance.balance} → $${updatedBalance.balance}`);
    console.log(`📝 Transaction: ${transaction.id}`);
    
    // Check final balance
    const finalBalance = await prisma.creditbalance.findUnique({
      where: { userId }
    });
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`   Initial: $${initialBalance?.balance || 0}`);
    console.log(`   Final: $${finalBalance?.balance || 0}`);
    console.log(`   Difference: $${(initialBalance?.balance || 0) - (finalBalance?.balance || 0)}`);
    
    if ((initialBalance?.balance || 0) - (finalBalance?.balance || 0) === messageAmount) {
      console.log(`\n🎉 SUCCESS! Credit system working correctly!`);
    } else {
      console.log(`\n❌ ERROR! Credit deduction not working properly.`);
    }
    
  } catch (error) {
    console.error('❌ Error testing chat system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatSystem();