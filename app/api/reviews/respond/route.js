import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// POST - Provider responds to a review on their listing
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId, response } = await request.json();

    if (!reviewId || !response?.trim()) {
      return NextResponse.json({ error: "Review ID and response are required" }, { status: 400 });
    }

    if (response.length > 1000) {
      return NextResponse.json({ error: "Response must be under 1000 characters" }, { status: 400 });
    }

    // Find the review and verify ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        listing: { select: { userId: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.listing.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only respond to reviews on your own listings" }, { status: 403 });
    }

    if (review.providerResponse) {
      return NextResponse.json({ error: "You have already responded to this review" }, { status: 400 });
    }

    // Save the response
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        providerResponse: response.trim(),
        providerRespondedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Response saved", review: updated });
  } catch (error) {
    console.error("Error responding to review:", error);
    return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
  }
}
