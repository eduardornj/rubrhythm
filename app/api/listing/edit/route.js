import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id,
      title,
      description,
      bodyType,
      ethnicity,
      serviceLocation,
      phoneArea,
      phoneNumber,
      country,
      state,
      city,
      neighborhood,
      websiteUrl,
      telegram,
      whatsapp,
      images,
      priceRange,
      hourlyRate,
      availability,
      age,
      userId
    } = await request.json();

    if (!id || !title || !city || !state || !serviceLocation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verificar se o listing existe e pertence ao usuário
    const existingListing = await prisma.listing.findUnique({
      where: { id }
    });

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (existingListing.userId !== session.user.id) {
      return NextResponse.json({ error: "You do not have permission to edit this listing" }, { status: 403 });
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description: description || null,
        bodyType: bodyType || null,
        ethnicity: ethnicity || null,
        serviceLocation,
        phoneArea: phoneArea || null,
        phoneNumber: phoneNumber || null,
        country: country || "United States",
        state,
        city,
        neighborhood: neighborhood || null,
        websiteUrl: websiteUrl || null,
        telegram: telegram || null,
        whatsapp: whatsapp || null,
        images: images || [],
        priceRange: priceRange || null,
        hourlyRate: hourlyRate ? parseInt(hourlyRate) : null,
        availability: availability || [],
        age: age ? parseInt(age) : null,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ 
      message: "Listing updated successfully", 
      listing: updatedListing 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}