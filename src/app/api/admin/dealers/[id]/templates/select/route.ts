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
    const dealerId = params.id;

    // Verify authentication and dealer access
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await validateDealerAccess(dealerId, session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Get template data
    const template = await prisma.$queryRaw`
      SELECT id, name, sections, settings
      FROM templates
      WHERE id = ${templateId} AND "isActive" = true
      LIMIT 1
    ` as any[];

    if (!template || template.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const templateData = template[0];

    // Create or update dealer customization with template data
    await prisma.$executeRaw`
      INSERT INTO dealer_customizations (id, "dealerId", "templateId", sections, settings, status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${dealerId}, ${templateId}, ${JSON.stringify(templateData.sections)}, ${JSON.stringify(templateData.settings)}, 'DRAFT', NOW(), NOW())
      ON CONFLICT ("dealerId", status)
      WHERE status = 'DRAFT'
      DO UPDATE SET
        "templateId" = ${templateId},
        sections = ${JSON.stringify(templateData.sections)},
        settings = ${JSON.stringify(templateData.settings)},
        "updatedAt" = NOW()
    `;

    return NextResponse.json({
      success: true,
      message: 'Template selected successfully',
      template: {
        id: templateData.id,
        name: templateData.name,
      },
    });
  } catch (error) {
    console.error('Error selecting template:', error);
    return NextResponse.json(
      { error: 'Failed to select template' },
      { status: 500 }
    );
  }
}