const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestChat() {
  try {
    // Buscar um usuário e um listing existente
    const user = await prisma.user.findFirst();
    const listing = await prisma.listing.findFirst();
    
    if (!user || !listing) {
      console.log('❌ Usuário ou listing não encontrado');
      return;
    }
    
    console.log(`👤 Usuário: ${user.email}`);
    console.log(`📋 Listing: ${listing.title}`);
    
    // Criar um chat de teste
    const chat = await prisma.chat.create({
      data: {
        clientId: user.id,
        providerId: listing.userId,
        listingId: listing.id,
        creditsRemaining: 5,
        messagesCount: 0
      }
    });
    
    console.log(`💬 Chat criado: ${chat.id}`);
    
    // Criar algumas mensagens de teste
    const messages = [
      {
        chatId: chat.id,
        content: 'Olá! Gostaria de saber mais sobre seus serviços.',
        senderId: user.id,
        senderType: 'client'
      },
      {
        chatId: chat.id,
        content: 'Olá! Claro, ficarei feliz em ajudar. Que tipo de massagem você está procurando?',
        senderId: listing.userId,
        senderType: 'provider'
      },
      {
        chatId: chat.id,
        content: 'Estou interessado em uma massagem relaxante. Qual seria o preço?',
        senderId: user.id,
        senderType: 'client'
      }
    ];
    
    for (const messageData of messages) {
      const message = await prisma.chatmessage.create({
        data: messageData
      });
      console.log(`📨 Mensagem criada: ${message.content.substring(0, 30)}...`);
    }
    
    // Atualizar o chat com o número de mensagens
    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        messagesCount: messages.length,
        creditsRemaining: 5 - messages.length
      }
    });
    
    console.log('✅ Chat de teste criado com sucesso!');
    console.log(`🔗 Chat ID: ${chat.id}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar chat de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestChat();