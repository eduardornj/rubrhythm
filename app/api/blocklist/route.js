import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const MAX_BLOCKED = 100;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blocked = await prisma.blockedcontact.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ blocked });
  } catch (error) {
    console.error("GET /api/blocklist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, value, note } = body;

    if (!type || !["phone", "email"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'phone' or 'email'" }, { status: 400 });
    }

    const trimmedValue = (value || "").trim();
    if (!trimmedValue) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 });
    }

    // Enforce max limit
    const count = await prisma.blockedcontact.count({
      where: { userId: session.user.id },
    });
    if (count >= MAX_BLOCKED) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_BLOCKED} blocked contacts reached` },
        { status: 400 }
      );
    }

    const blocked = await prisma.blockedcontact.create({
      data: {
        userId: session.user.id,
        type,
        value: trimmedValue,
        note: note?.trim() || null,
      },
    });

    return NextResponse.json({ blocked }, { status: 201 });
  } catch (error) {
    // Prisma unique constraint violation
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "This contact is already blocked" }, { status: 409 });
    }
    console.error("POST /api/blocklist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Verify ownership before deleting
    const existing = await prisma.blockedcontact.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.blockedcontact.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/blocklist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
