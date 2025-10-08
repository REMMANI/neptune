import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active templates using raw SQL to avoid client cache issues
    const templates = await prisma.$queryRaw`
      SELECT id, name, description, preview, sections, settings, "isActive", "createdAt", "updatedAt"
      FROM templates
      WHERE "isActive" = true
      ORDER BY "createdAt" ASC
    ` as any[];

    return NextResponse.json({
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        preview: template.preview,
        sections: template.sections,
        settings: template.settings,
        isActive: template.isActive,
      })),
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}