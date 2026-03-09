const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db'
    }
  }
});

async function testChatAPI() {
  try {
    console.log('🌐 Testing Chat API with real HTTP requests...');
    
    const userId = 'cmfj29jvs0000u1k87i08w1lw'; // Maria Silva
    const providerId = 'cmfj5kapt0000u1cwub24avq8'; // Administrador
    const listingId = 'cmfj5kaq10002u1cwo64k3dyk'; // Massage Therapy by Sofia
    
    // Check initial balance
    const initialBalance = await prisma.creditbalance.findUnique({
      where: { userId }
    });
    
    console.log(`💰 Initial balance: $${initialBalance?.balance || 0}`);
    
    // Test 1: Initialize Chat
    console.log('\n🚀 Test 1: Initialize Chat...');
    
    const initResponse = await fetch('http://localhost:1001/api/chat/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: userId,
        providerId: providerId,
        listingId: listingId
      })
    });
    
    if (initResponse.ok) {
      const initData = await initResponse.json();
      console.log('✅ Chat initialized successfully!');
      console.log('📋 Full response:', initData);
      console.log(`📱 Chat ID: ${initData.chatId || initData.id || 'NOT FOUND'}`);
      
      const chatId = initData.chat?.id || initData.chatId || initData.id;
      
      // Test 2: Send Message
      console.log('\n💬 Test 2: Send Message...');
      
      if (!chatId) {
        console.log('❌ No chat ID found in response');
        return;
      }
      
      console.log('📤 Sending message with data:', {
        chatId: chatId,
        senderId: userId,
        senderType: 'client',
        content: 'Hello! This is a test message to verify the credit system.'
      });
      
      const sendResponse = await fetch('http://localhost:1001/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          senderId: userId,
          senderType: 'client',
          content: 'Hello! This is a test message to verify the credit system.'
        })
      });
      
      if (sendResponse.ok) {
        const sendData = await sendResponse.json();
        console.log('✅ Message sent successfully!');
        console.log(`💳 New balance: $${sendData.newBalance}`);
        console.log(`📊 Messages count: ${sendData.messagesCount}`);
        console.log(`💰 Total paid: $${sendData.totalPaid}`);
        
        // Verify balance in database
        const finalBalance = await prisma.creditbalance.findUnique({
          where: { userId }
        });
        
        console.log(`\n📊 VERIFICATION:`);
        console.log(`   API reported balance: $${sendData.newBalance}`);
        console.log(`   Database balance: $${finalBalance?.balance || 0}`);
        console.log(`   Initial balance: $${initialBalance?.balance || 0}`);
        console.log(`   Expected deduction: $5`);
        
        const expectedBalance = (initialBalance?.balance || 0) - 5;
        const actualBalance = finalBalance?.balance || 0;
        
        if (Math.abs(actualBalance - expectedBalance) < 0.01) {
          console.log(`\n🎉 SUCCESS! Complete chat system working correctly!`);
          console.log(`   ✅ Credit deduction: $5`);
          console.log(`   ✅ API integration: Working`);
          console.log(`   ✅ Database consistency: Verified`);
        } else {
          console.log(`\n❌ ERROR! Balance mismatch:`);
          console.log(`   Expected: $${expectedBalance}`);
          console.log(`   Actual: $${actualBalance}`);
        }
        
      } else {
        const errorData = await sendResponse.text();
        console.log(`❌ Failed to send message: ${sendResponse.status}`);
        console.log(`Error: ${errorData}`);
      }
      
    } else {
      const errorData = await initResponse.text();
      console.log(`❌ Failed to initialize chat: ${initResponse.status}`);
      console.log(`Error: ${errorData}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing chat API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChatAPI();