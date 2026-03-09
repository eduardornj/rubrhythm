import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Esta API deve ser chamada diariamente por um cron job
// Ela faz os anúncios "descerem" na lista automaticamente
export async function POST(request) {
  try {
    const session = await auth();
    
    // Verificar se é admin ou se é uma chamada de sistema (cron)
    const { searchParams } = new URL(request.url);
    const cronKey = searchParams.get('cronKey');
    
    // Chave secreta para cron jobs (deve estar no .env)
    const CRON_SECRET = process.env.CRON_SECRET;
    
    if (session?.user?.role !== 'admin' && cronKey !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar todos os anúncios ativos e aprovados
    const listings = await prisma.listing.findMany({
      where: {
        isApproved: true,
        isActive: true
      },
      orderBy: {
        updatedAt: 'desc' // Mais recentes primeiro
      }
    });

    let processedCount = 0;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Processar cada anúncio
    for (const listing of listings) {
      // Se o anúncio não foi atualizado nas últimas 24h, "degradar" ele
      if (listing.updatedAt < oneDayAgo && !listing.lastBumpUp) {
        // Diminuir a "prioridade" do anúncio fazendo ele parecer mais antigo
        const degradedDate = new Date(listing.updatedAt.getTime() - 60 * 60 * 1000); // 1 hora mais antigo
        
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            updatedAt: degradedDate
          }
        });
        
        processedCount++;
      }
      // Se teve bump up recente (últimas 24h), manter posição
      else if (listing.lastBumpUp && listing.lastBumpUp > oneDayAgo) {
        // Anúncio com bump up recente mantém posição alta
        continue;
      }
      // Se o bump up foi há mais de 24h, começar a degradar
      else if (listing.lastBumpUp && listing.lastBumpUp < oneDayAgo) {
        const degradedDate = new Date(listing.updatedAt.getTime() - 30 * 60 * 1000); // 30 min mais antigo
        
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            updatedAt: degradedDate
          }
        });
        
        processedCount++;
      }
    }

    // Log da operação
    console.log(`Auto-downgrade completed: ${processedCount} listings processed at ${now.toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Auto-downgrade completed successfully`,
      processedListings: processedCount,
      totalListings: listings.length,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error("Auto-downgrade error:", error);
    return NextResponse.json(
      { error: "Failed to process auto-downgrade" },
      { status: 500 }
    );
  }
}

// GET para verificar status
export async function GET(request) {
  try {
    const session = await auth();
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Estatísticas dos anúncios
    const stats = await prisma.listing.groupBy({
      by: ['isActive', 'isApproved'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    // Anúncios com bump up recente
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBumpUps = await prisma.listing.count({
      where: {
        lastBumpUp: {
          gte: oneDayAgo
        },
        isActive: true,
        isApproved: true
      }
    });

    return NextResponse.json({
      stats,
      recentBumpUps,
      lastCheck: new Date().toISOString()
    });

  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}