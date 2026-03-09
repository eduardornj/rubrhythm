import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET - Fetch user settings
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Default settings if none exist
    const defaultSettings = {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      profileVisibility: "public",
      language: "en",
      timezone: "UTC"
    };

    const settings = user.settings || defaultSettings;

    return NextResponse.json({ 
      success: true, 
      settings: { ...defaultSettings, ...settings }
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update user settings
export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      emailNotifications,
      smsNotifications,
      marketingEmails,
      profileVisibility,
      language,
      timezone
    } = body;

    // Validate settings
    const validVisibilityOptions = ["public", "private", "friends"];
    const validLanguages = ["en", "es", "pt", "fr"];
    const validTimezones = [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles"
    ];

    if (profileVisibility && !validVisibilityOptions.includes(profileVisibility)) {
      return NextResponse.json(
        { error: "Invalid profile visibility option" },
        { status: 400 }
      );
    }

    if (language && !validLanguages.includes(language)) {
      return NextResponse.json(
        { error: "Invalid language option" },
        { status: 400 }
      );
    }

    if (timezone && !validTimezones.includes(timezone)) {
      return NextResponse.json(
        { error: "Invalid timezone option" },
        { status: 400 }
      );
    }

    const settingsData = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      smsNotifications: smsNotifications !== undefined ? smsNotifications : false,
      marketingEmails: marketingEmails !== undefined ? marketingEmails : true,
      profileVisibility: profileVisibility || "public",
      language: language || "en",
      timezone: timezone || "UTC"
    };

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { settings: settingsData },
      select: { settings: true }
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: updatedUser.settings
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}