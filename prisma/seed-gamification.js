const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedGamification() {
  console.log('🎮 Seeding gamification data...');

  // Create achievements
  const achievements = [
    {
      name: 'Primeiro Passo',
      description: 'Faça seu primeiro login na plataforma',
      type: 'POINTS',
      category: 'ENGAGEMENT',
      requirement: 10,
      bonusPoints: 50,
      icon: 'user-check'
    },
    {
      name: 'Explorador',
      description: 'Acumule 100 pontos',
      type: 'POINTS',
      category: 'MILESTONE',
      requirement: 100,
      bonusPoints: 100,
      icon: 'compass'
    },
    {
      name: 'Veterano',
      description: 'Acumule 500 pontos',
      type: 'POINTS',
      category: 'MILESTONE',
      requirement: 500,
      bonusPoints: 200,
      icon: 'star'
    },
    {
      name: 'Lenda',
      description: 'Acumule 1000 pontos',
      type: 'POINTS',
      category: 'MILESTONE',
      requirement: 1000,
      bonusPoints: 500,
      icon: 'crown'
    },
    {
      name: 'Subindo de Nível',
      description: 'Alcance o nível 5',
      type: 'LEVEL',
      category: 'MILESTONE',
      requirement: 5,
      bonusPoints: 150,
      icon: 'trending-up'
    },
    {
      name: 'Alto Nível',
      description: 'Alcance o nível 10',
      type: 'LEVEL',
      category: 'MILESTONE',
      requirement: 10,
      bonusPoints: 300,
      icon: 'zap'
    },
    {
      name: 'Consistente',
      description: 'Mantenha uma sequência de 7 dias',
      type: 'STREAK',
      category: 'ENGAGEMENT',
      requirement: 7,
      bonusPoints: 200,
      icon: 'calendar'
    },
    {
      name: 'Dedicado',
      description: 'Mantenha uma sequência de 30 dias',
      type: 'STREAK',
      category: 'ENGAGEMENT',
      requirement: 30,
      bonusPoints: 500,
      icon: 'flame'
    },
    {
      name: 'Provider Ativo',
      description: 'Crie seu primeiro anúncio',
      type: 'LISTINGS',
      category: 'SOCIAL',
      requirement: 1,
      bonusPoints: 100,
      icon: 'plus-circle'
    },
    {
      name: 'Provider Popular',
      description: 'Tenha 5 anúncios ativos',
      type: 'LISTINGS',
      category: 'SOCIAL',
      requirement: 5,
      bonusPoints: 300,
      icon: 'heart'
    }
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement
    });
  }

  // Create rewards
  const rewards = [
    {
      name: 'Créditos Básicos',
      description: 'Ganhe $5 em créditos para usar na plataforma',
      cost: 100,
      category: 'CREDITS',
      type: 'CREDITS',
      value: '5.00',
      stock: 1000,
      icon: 'dollar-sign'
    },
    {
      name: 'Créditos Premium',
      description: 'Ganhe $10 em créditos para usar na plataforma',
      cost: 200,
      category: 'CREDITS',
      type: 'CREDITS',
      value: '10.00',
      stock: 500,
      icon: 'dollar-sign'
    },
    {
      name: 'Créditos VIP',
      description: 'Ganhe $25 em créditos para usar na plataforma',
      cost: 500,
      category: 'CREDITS',
      type: 'CREDITS',
      value: '25.00',
      stock: 100,
      icon: 'dollar-sign'
    },
    {
      name: 'Anúncio em Destaque - 1 Dia',
      description: 'Destaque seu anúncio por 1 dia',
      cost: 150,
      category: 'FEATURES',
      type: 'FEATURED_LISTING',
      value: '1',
      stock: 200,
      icon: 'star'
    },
    {
      name: 'Anúncio em Destaque - 3 Dias',
      description: 'Destaque seu anúncio por 3 dias',
      cost: 400,
      category: 'FEATURES',
      type: 'FEATURED_LISTING',
      value: '3',
      stock: 100,
      icon: 'star'
    },
    {
      name: 'Anúncio em Destaque - 7 Dias',
      description: 'Destaque seu anúncio por 7 dias',
      cost: 800,
      category: 'FEATURES',
      type: 'FEATURED_LISTING',
      value: '7',
      stock: 50,
      icon: 'star'
    },
    {
      name: 'Badge Verificado',
      description: 'Ganhe um badge de verificação especial',
      cost: 300,
      category: 'BADGES',
      type: 'BADGE',
      value: 'verified_gamification',
      stock: 1000,
      icon: 'shield-check'
    },
    {
      name: 'Badge VIP',
      description: 'Ganhe um badge VIP exclusivo',
      cost: 1000,
      category: 'BADGES',
      type: 'BADGE',
      value: 'vip_member',
      stock: 100,
      icon: 'crown'
    },
    {
      name: 'Desconto 10%',
      description: 'Desconto de 10% em serviços premium',
      cost: 250,
      category: 'DISCOUNTS',
      type: 'DISCOUNT',
      value: '10',
      stock: 500,
      icon: 'percent'
    },
    {
      name: 'Desconto 25%',
      description: 'Desconto de 25% em serviços premium',
      cost: 600,
      category: 'DISCOUNTS',
      type: 'DISCOUNT',
      value: '25',
      stock: 200,
      icon: 'percent'
    }
  ];

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { name: reward.name },
      update: reward,
      create: reward
    });
  }

  console.log('✅ Gamification data seeded successfully!');
  console.log(`📊 Created ${achievements.length} achievements`);
  console.log(`🎁 Created ${rewards.length} rewards`);
}

seedGamification()
  .catch((e) => {
    console.error('❌ Error seeding gamification data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });