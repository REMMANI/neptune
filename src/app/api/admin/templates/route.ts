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

    // Get all active themes using Prisma ORM
    const themes = await prisma.theme.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        previewImage: true,
        category: true,
        isDefault: true,
        isSystemTheme: true,
        colors: true,
        typography: true,
        spacing: true,
        components: true,
        tags: true,
        sortOrder: true,
        version: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Transform themes to template format for compatibility
    return NextResponse.json({
      templates: themes.map((theme: any) => ({
        id: theme.id,
        key: theme.key,
        name: theme.name,
        description: theme.description,
        preview: theme.previewImage,
        category: theme.category,
        isDefault: theme.isDefault,
        isSystemTheme: theme.isSystemTheme,
        colors: theme.colors,
        typography: theme.typography,
        spacing: theme.spacing,
        components: theme.components,
        tags: theme.tags ? theme.tags : [],
        version: theme.version,
        sortOrder: theme.sortOrder,
        isActive: true,
      })),
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}