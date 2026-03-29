import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { scanContent } from "@/lib/contentFilter";
import { alertNewListing } from "@/lib/telegram";
import { logActivity } from "@/lib/activity";

const listingLimiter = rateLimit({ interval: 300_000, limit: 5 });

export async function POST(request) {
  const session = await auth();

  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 listings per 5 min per user
  const { success: rateLimitOk } = listingLimiter.check(session.user.id);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many requests. Please wait before creating another listing." }, { status: 429 });
  }

  const data = await request.json();
  const {
    title,
    bodyType,
    ethnicity,
    reviews,
    serviceLocation,
    description,
    phoneArea,
    phoneNumber,
    country,
    state,
    city,
    neighborhood,
    websiteUrl,
    isWhatsAppAvailable,
    images,
    priceRange,
    hourlyRate,
    availability,
    age,
    rates,
    socialLinks,
  } = data;

  const userId = session.user.id;

  if (!title || !description || !phoneArea || !phoneNumber || !country || !state || !city || !serviceLocation) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Input length validation
  if (title.length > 200) {
    return NextResponse.json({ error: "Title must be under 200 characters" }, { status: 400 });
  }
  if (description.length > 5000) {
    return NextResponse.json({ error: "Description must be under 5000 characters" }, { status: 400 });
  }

  if (/\bverified\b/i.test(title)) {
    return NextResponse.json({ error: 'The word "Verified" is not allowed in your title.' }, { status: 400 });
  }

  // Content filter — block prohibited terms
  const contentScan = scanContent(`${title} ${description}`);
  if (contentScan.hasBlocked) {
    return NextResponse.json({
      error: `Your listing contains prohibited content that violates our Terms of Service. Please remove the following and try again: ${contentScan.blocked.slice(0, 3).join(", ")}`,
      blockedTerms: contentScan.blocked,
    }, { status: 400 });
  }

  const LISTING_CREATION_COST = 10.0; // $10 para criar anúncio

  try {
    // Criar anúncio e debitar créditos em uma transação
    // Balance check INSIDE transaction to prevent TOCTOU race condition
    const result = await prisma.$transaction(async (tx) => {
      // Verify user credits atomically inside transaction
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true }
      });

      const currentBalance = user?.credits || 0;

      if (currentBalance < LISTING_CREATION_COST) {
        throw new Error(`INSUFFICIENT_CREDITS:${currentBalance}`);
      }

      // Deduct from single source of truth (user.credits)
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: LISTING_CREATION_COST } }
      });

      // Keep creditbalance in sync, create if missing
      await tx.creditbalance.upsert({
        where: { userId: session.user.id },
        update: { balance: updatedUser.credits },
        create: { id: `cb_${Date.now()}`, userId: session.user.id, balance: updatedUser.credits }
      });

      // Criar o anúncio
      const listing = await tx.listing.create({
        data: {
          id: crypto.randomUUID(),
          title,
          bodyType,
          ethnicity,
          serviceLocation,
          description,
          phoneArea,
          phoneNumber,
          country,
          state,
          city,
          neighborhood,
          websiteUrl,
          isWhatsAppAvailable: isWhatsAppAvailable || false,
          images: images || [],
          services: [],
          priceRange,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          availability: availability || {},
          age: age ? parseInt(age) : null,
          rates: rates || [],
          socialLinks: socialLinks || {},
          userId,
          isApproved: false, // Anúncio fica pendente até ser aprovado
          isFeatured: false,
          lastBumpUp: new Date(),
          updatedAt: new Date()
        },
      });

      // Registrar transação de crédito
      await tx.credittransaction.create({
        data: {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: session.user.id,
          amount: -LISTING_CREATION_COST,
          type: "LISTING_CREATION",
          description: `Listing creation: ${title}`,
          relatedId: listing.id
        }
      });

      return listing;
    });

    // Activity log + Telegram alert (non-blocking)
    logActivity(session.user.id, 'listing_create', {
      target: result.id,
      metadata: { title, city, state },
      request,
    });
    alertNewListing(title, city, state, session.user.name || session.user.email);

    return NextResponse.json({
      listing: result,
      message: "Listing created successfully",
      chargedAmount: LISTING_CREATION_COST,
    }, { status: 201 });

  } catch (error) {
    if (error.message?.startsWith("INSUFFICIENT_CREDITS")) {
      const available = parseFloat(error.message.split(":")[1]) || 0;
      return NextResponse.json({
        error: "Insufficient credits to create listing",
        required: LISTING_CREATION_COST,
        available,
        needToPurchase: LISTING_CREATION_COST - available
      }, { status: 402 });
    }
    console.error("Error creating listing:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await auth();

  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idFromQuery = searchParams.get('id');

  const data = await request.json();
  const id = idFromQuery || data.id;
  const {
    title,
    bodyType,
    ethnicity,
    reviews,
    serviceLocation,
    description,
    phoneArea,
    phoneNumber,
    country,
    state,
    city,
    neighborhood,
    websiteUrl,
    isWhatsAppAvailable,
    images,
    priceRange,
    hourlyRate,
    availability,
    age,
    rates,
    socialLinks,
  } = data;

  const userId = session.user.id;

  if (!id) {
    return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
  }

  if (!title || !description || !phoneArea || !phoneNumber || !country || !state || !city || !serviceLocation) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Input length validation
  if (title.length > 200) {
    return NextResponse.json({ error: "Title must be under 200 characters" }, { status: 400 });
  }
  if (description.length > 5000) {
    return NextResponse.json({ error: "Description must be under 5000 characters" }, { status: 400 });
  }

  if (/\bverified\b/i.test(title)) {
    return NextResponse.json({ error: 'The word "Verified" is not allowed in your title.' }, { status: 400 });
  }

  // Content filter — block prohibited terms
  const contentScan = scanContent(`${title} ${description}`);
  if (contentScan.hasBlocked) {
    return NextResponse.json({
      error: `Your listing contains prohibited content that violates our Terms of Service. Please remove the following and try again: ${contentScan.blocked.slice(0, 3).join(", ")}`,
      blockedTerms: contentScan.blocked,
    }, { status: 400 });
  }

  try {
    // Verifica se o anúncio pertence ao usuário
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existingListing.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized to edit this listing" }, { status: 403 });
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        bodyType,
        ethnicity,
        serviceLocation,
        description,
        phoneArea,
        phoneNumber,
        country,
        state,
        city,
        neighborhood,
        websiteUrl,
        isWhatsAppAvailable: isWhatsAppAvailable || false,
        images,
        priceRange,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        availability,
        age: age ? parseInt(age) : null,
        rates: rates || undefined,
        socialLinks: socialLinks || undefined,
      },
    });

    return NextResponse.json(updatedListing, { status: 200 });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}