import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Default settings structure
const defaultSettings = {
  general: {
    siteName: 'RubRhythm',
    siteDescription: 'Professional escort services platform',
    contactEmail: 'contact@rubrhythm.com',
    supportPhone: '+1-555-0123',
    registrationEnabled: true,
    maintenanceMode: false
  },
  fees: {
    platformFee: 10.0,
    featuredListingFee: 29.99,
    creditPackage1: 19.99,
    creditPackage2: 49.99,
    creditPackage3: 99.99,
    withdrawalFee: 2.5
  },
  policies: {
    termsOfService: 'Terms of service content...',
    privacyPolicy: 'Privacy policy content...',
    communityGuidelines: 'Community guidelines content...'
  },
  security: {
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    requireEmailVerification: true,
    enableTwoFactor: false,
    logSecurityEvents: true
  },
  notifications: {
    smtpServer: '',
    smtpPort: 587,
    fromEmail: '',
    enableEmailNotifications: true,
    enablePushNotifications: false
  }
};

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Try to get settings from database
    let settings = await prisma.globalSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.globalSettings.create({
        data: {
          settings: defaultSettings
        }
      });
    }

    return NextResponse.json({
      success: true,
      settings: settings.settings || defaultSettings
    });

  } catch (error) {
    console.error('Error fetching global settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings, action, category } = body;

    // Handle reset to defaults
    if (action === 'reset' && category) {
      const currentSettings = await prisma.globalSettings.findFirst();
      const updatedSettings = {
        ...currentSettings?.settings,
        [category]: defaultSettings[category]
      };

      await prisma.globalSettings.upsert({
        where: { id: currentSettings?.id || 0 },
        update: { settings: updatedSettings },
        create: { settings: updatedSettings }
      });

      return NextResponse.json({
        success: true,
        message: `${category} settings reset to defaults`,
        settings: updatedSettings
      });
    }

    // Handle settings update
    if (settings) {
      const existingSettings = await prisma.globalSettings.findFirst();
      
      await prisma.globalSettings.upsert({
        where: { id: existingSettings?.id || 0 },
        update: { settings },
        create: { settings }
      });

      // Log the settings change (matches securitylog schema: id, type, severity, message, details, userId, ipAddress)
      await prisma.securitylog.create({
        data: {
          id: `sl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'SETTINGS_UPDATE',
          severity: 'info',
          message: 'Global settings updated by admin',
          details: { userAgent: request.headers.get('user-agent') || 'unknown' },
          userId: session.user.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully',
        settings
      });
    }

    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating global settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}