const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar ou encontrar usuário admin
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@rubrhythm.com' }
    });

    if (!admin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      admin = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: 'admin@rubrhythm.com',
          name: 'Administrador',
          password: adminPassword,
          role: 'admin'
        }
      });
      console.log('👑 Usuário admin criado:', admin.email);
    } else {
      console.log('👑 Usuário admin já existe:', admin.email);
    }

    // Criar algumas massagistas em Orlando
    const orlandoListings = [
      {
        title: 'Massage Therapy by Sofia',
        description: 'Professional therapeutic massage services in Orlando. Specializing in deep tissue and relaxation massage.',
        city: 'Orlando',
        state: 'Florida',
        serviceLocation: 'Incall & Outcall',
        phoneArea: '407',
        phoneNumber: '555-0101',
        websiteUrl: 'https://sofiamassage.com',
        bodyType: 'Slim',
        ethnicity: 'Latina',
        isApproved: true,
        isFeatured: true,
        isHighlighted: false,
        userId: admin.id
      },
      {
        title: 'Relaxation Paradise - Maria',
        description: 'Swedish massage and aromatherapy treatments. Creating a peaceful environment for your wellness journey.',
        city: 'Orlando',
        state: 'Florida',
        serviceLocation: 'Incall Only',
        phoneArea: '407',
        phoneNumber: '555-0102',
        websiteUrl: 'https://mariamassage.com',
        bodyType: 'Curvy',
        ethnicity: 'Latina',
        isApproved: true,
        isFeatured: false,
        isHighlighted: true,
        userId: admin.id
      },
      {
        title: 'Healing Touch by Ana',
        description: 'Sports massage and injury rehabilitation. Helping athletes and active individuals recover and perform better.',
        city: 'Orlando',
        state: 'Florida',
        serviceLocation: 'Outcall Only',
        phoneArea: '407',
        phoneNumber: '555-0103',
        websiteUrl: 'https://anamassage.com',
        bodyType: 'Athletic',
        ethnicity: 'Colombian',
        isApproved: true,
        isFeatured: true,
        isHighlighted: true,
        userId: admin.id
      },
      {
        title: 'Serenity Spa - Isabella',
        description: 'Full-service spa experience with hot stone massage, prenatal massage, and couples treatments.',
        city: 'Orlando',
        state: 'Florida',
        serviceLocation: 'Incall & Outcall',
        phoneArea: '407',
        phoneNumber: '555-0104',
        websiteUrl: 'https://serenityspa.com',
        bodyType: 'Petite',
        ethnicity: 'Venezuelan',
        isApproved: true,
        isFeatured: false,
        isHighlighted: false,
        userId: admin.id
      },
      {
        title: 'Wellness Center - Carmen',
        description: 'Holistic approach to wellness with therapeutic massage, reflexology, and energy healing.',
        city: 'Orlando',
        state: 'Florida',
        serviceLocation: 'Incall Only',
        phoneArea: '407',
        phoneNumber: '555-0105',
        websiteUrl: 'https://carmenwellness.com',
        bodyType: 'Average',
        ethnicity: 'Mexican',
        isApproved: true,
        isFeatured: true,
        isHighlighted: false,
        userId: admin.id,
        availability: JSON.stringify([]),
        services: JSON.stringify([]),
        images: JSON.stringify([])
      }
    ].map(l => ({ ...l, id: crypto.randomUUID(), updatedAt: new Date(), images: JSON.stringify([]), services: JSON.stringify([]), availability: JSON.stringify([]) }));

    for (const listing of orlandoListings) {
      const created = await prisma.listing.create({
        data: listing
      });
      console.log(`📋 Listagem criada: ${created.title}`);
    }

    // Criar algumas listagens em outras cidades da Florida
    const miamiListings = [
      {
        title: 'Miami Beach Massage - Lucia',
        description: 'Beachside massage therapy with ocean views. Perfect for vacation relaxation.',
        city: 'Miami',
        state: 'Florida',
        serviceLocation: 'Incall & Outcall',
        phoneArea: '305',
        phoneNumber: '555-0201',
        websiteUrl: 'https://miamibeachmassage.com',
        bodyType: 'Slim',
        ethnicity: 'Cuban',
        isApproved: true,
        isFeatured: true,
        isHighlighted: false,
        userId: admin.id
      },
      {
        title: 'Downtown Wellness - Patricia',
        description: 'Corporate massage services and stress relief treatments in the heart of Miami.',
        city: 'Miami',
        state: 'Florida',
        serviceLocation: 'Outcall Only',
        phoneArea: '305',
        phoneNumber: '555-0202',
        websiteUrl: 'https://downtownwellness.com',
        bodyType: 'Curvy',
        ethnicity: 'Dominican',
        isApproved: true,
        isFeatured: false,
        isHighlighted: true,
        userId: admin.id,
        availability: JSON.stringify([]),
        services: JSON.stringify([]),
        images: JSON.stringify([])
      }
    ].map(l => ({ ...l, id: crypto.randomUUID(), updatedAt: new Date(), images: JSON.stringify([]), services: JSON.stringify([]), availability: JSON.stringify([]) }));

    for (const listing of miamiListings) {
      const created = await prisma.listing.create({
        data: listing
      });
      console.log(`📋 Listagem criada: ${created.title}`);
    }

    console.log('\n✅ Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - 1 usuário admin criado`);
    console.log(`   - ${orlandoListings.length} listagens em Orlando`);
    console.log(`   - ${miamiListings.length} listagens em Miami`);
    console.log('\n🔑 Credenciais do Admin:');
    console.log('   Email: admin@rubrhythm.com');
    console.log('   Senha: admin123');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();