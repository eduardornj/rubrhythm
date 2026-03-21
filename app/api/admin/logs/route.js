import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type") || "";
    const skip = (page - 1) * limit;

    const where = type ? { type } : {};

    const [logs, total] = await Promise.all([
      prisma.securitylog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        select: {
          id: true,
          type: true,
          severity: true,
          message: true,
          ipAddress: true,
          details: true,
          userId: true,
          createdAt: true,
        },
      }),
      prisma.securitylog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[API] Admin Logs GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
