import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, validateDealerAccess } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionFromRequest(request);
    const raw = await request.clone().text();
    

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dealerId = (session as any).user.id 

    if (!dealerId) {
      // You can return 403 or 422; 403 is fine if policy requires having a tenant.
      return NextResponse.json(
        { error: "Forbidden: no dealer context in session" },
        { status: 403 }
      );
    }

    const themeId  = JSON.parse(raw).templateId;

    if (!themeId) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400 });
    }

    // Get theme data using Prisma ORM
    const theme = await prisma.theme.findMany({
      where: {
        id: themeId,
        isActive: true,
      },
      take: 1,
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        key: true,
        description: true,
        previewImage: true,
        category: true,
        isDefault: true,
        version: true,
      },
    });

    if (!theme || theme.length === 0) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    const templateData = theme[0];

    // Ensure dealer exists for this dealer
    let siteConfig = await prisma.dealer.findUnique({
      where: { id: dealerId }
    });

    if (!siteConfig) {
      siteConfig = await prisma.dealer.create({
        data: {
          id: dealerId,
          externalDealerId: dealerId, // or provide the correct externalDealerId value
          slug: `dealer-${dealerId}` // or generate the slug as needed
        }
      });
    }

    // Create or update dealer customization with theme data
    await prisma.customization.upsert({
      where: {
        dealerId_status: {
          dealerId: dealerId,
          status: 'DRAFT'
        }
      },
      update: {
        theme: { connect: { id: themeId } },
        updatedAt: new Date()
      },
      create: {
        id: crypto.randomUUID(),
        theme: { connect: { id: themeId } },
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
        siteConfig: { connect: { id: dealerId } },
        sections: [],
        content: {},
        navigation: {},
        seoSettings: {}
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Theme selected successfully',
      theme: {
        id: templateData.id,
        name: templateData.name,
      },
    });
  } catch (error) {
    console.error('Error selecting theme:', error);
    return NextResponse.json(
      { error: 'Failed to select theme' },
      { status: 500 }
    );
  }
}