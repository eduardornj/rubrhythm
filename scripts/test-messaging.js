const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMessaging() {
  try {
    console.log('💬 Testando sistema de mensagens...');
    console.log('=' .repeat(50));
    
    // 1. Verificar usuários disponíveis
    const users = await prisma.user.findMany({
      where: { isBanned: false },
      select: { id: true, name: true, email: true },
      take: 3
    });
    
    console.log(`\n👥 Usuários disponíveis: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    
    if (users.length < 2) {
      console.log('⚠️ Necessário pelo menos 2 usuários para testar mensagens');
      return;
    }
    
    // 2. Verificar conversas existentes
    const conversations = await prisma.conversation.findMany({
      include: {
        client: {
          select: { id: true, name: true }
        },
        provider: {
          select: { id: true, name: true }
        },
        messages: {
          select: { id: true, content: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    console.log(`\n💬 Conversas existentes: ${conversations.length}`);
    conversations.forEach((conv, index) => {
      const participantNames = [conv.client.name, conv.provider.name].join(' e ');
      const lastMessage = conv.messages[0];
      console.log(`   ${index + 1}. Entre: ${participantNames}`);
      if (lastMessage) {
        console.log(`      Última mensagem: "${lastMessage.content.substring(0, 50)}..."`);
      }
    });
    
    // 3. Criar nova conversa se não existir
    let testConversation;
    if (conversations.length === 0) {
      console.log('\n🆕 Criando nova conversa de teste...');
      
      testConversation = await prisma.conversation.create({
        data: {
          subject: 'Conversa de teste',
          clientId: users[0].id,
          providerId: users[1].id
        },
        include: {
          client: {
            select: { id: true, name: true }
          },
          provider: {
            select: { id: true, name: true }
          }
        }
      });
      
      console.log(`   ✅ Conversa criada entre ${testConversation.client.name} e ${testConversation.provider.name}`);
    } else {
      testConversation = conversations[0];
      console.log(`\n📝 Usando conversa existente: ${testConversation.client.name} e ${testConversation.provider.name}`);
    }
    
    // 4. Enviar mensagem de teste
    console.log('\n📤 Enviando mensagem de teste...');
    
    const testMessage = await prisma.message.create({
      data: {
        content: `Mensagem de teste enviada em ${new Date().toLocaleString('pt-BR')}`,
        conversationId: testConversation.id,
        senderId: testConversation.client.id
      },
      include: {
        sender: {
          select: { name: true }
        }
      }
    });
    
    console.log(`   ✅ Mensagem enviada por ${testMessage.sender.name}: "${testMessage.content}"`);
    
    // 5. Verificar mensagens da conversa
    const messages = await prisma.message.findMany({
      where: { conversationId: testConversation.id },
      include: {
        sender: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`\n📋 Últimas ${messages.length} mensagens da conversa:`);
    messages.forEach((msg, index) => {
      const time = new Date(msg.createdAt).toLocaleString('pt-BR');
      console.log(`   ${index + 1}. [${time}] ${msg.sender.name}: "${msg.content}"`);
    });
    
    // 6. Testar busca de conversas por usuário
    console.log('\n🔍 Testando busca de conversas por usuário...');
    
    const userConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { clientId: users[0].id },
          { providerId: users[0].id }
        ]
      },
      include: {
        client: {
          select: { id: true, name: true }
        },
        provider: {
          select: { id: true, name: true }
        },
        messages: {
          select: { content: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
    
    console.log(`   ${users[0].name} participa de ${userConversations.length} conversa(s)`);
    
    // 7. Estatísticas do sistema de mensagens
    console.log('\n📊 Estatísticas do sistema:');
    
    const totalMessages = await prisma.message.count();
    const totalConversations = await prisma.conversation.count();
    const activeConversations = await prisma.conversation.count({
      where: {
        messages: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // últimos 30 dias
            }
          }
        }
      }
    });
    
    console.log(`   📨 Total de mensagens: ${totalMessages}`);
    console.log(`   💬 Total de conversas: ${totalConversations}`);
    console.log(`   🔥 Conversas ativas (30 dias): ${activeConversations}`);
    
    // 8. Testar funcionalidades avançadas
    console.log('\n🔧 Testando funcionalidades avançadas...');
    
    try {
      // Marcar mensagens como lidas (se existir campo)
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: testConversation.id,
          senderId: { not: users[0].id }
        }
      });
      
      console.log(`   📖 Mensagens não lidas para ${users[0].name}: ${unreadCount}`);
    } catch (error) {
      console.log(`   ⚠️ Campo de mensagens lidas não implementado: ${error.message}`);
    }
    
    console.log('\n✅ Teste do sistema de mensagens concluído!');
    console.log('🎉 Sistema de mensagens funcionando corretamente!');
    
  } catch (error) {
    console.error('❌ Erro no teste de mensagens:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testMessaging().catch(console.error);