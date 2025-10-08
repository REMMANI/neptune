import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag, secret } = body;

    // Verify the secret to prevent unauthorized revalidation
    const revalidateSecret = process.env.REVALIDATE_SECRET || 'default-secret';

    if (secret !== revalidateSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag is required' },
        { status: 400 }
      );
    }

    // Support wildcard revalidation for certain patterns
    if (tag.includes('*')) {
      // For wildcard tags like 'cms:*', we need to revalidate common patterns
      const baseTag = tag.replace('*', '');

      // Common CMS tags to revalidate
      if (baseTag === 'cms:') {
        const commonTags = [
          'cms:bundle:102324:en',
          'cms:bundle:102324:fr',
          'cms:bundle:100133:en',
          'cms:page:102324:en:home',
          'cms:page:102324:fr:home',
          'cms:page:100133:en:home',
        ];

        for (const commonTag of commonTags) {
          revalidateTag(commonTag);
        }
      }
      // Common inventory tags
      else if (baseTag === 'inventory:') {
        const commonTags = [
          'inventory:items:102324',
          'inventory:items:100133',
        ];

        for (const commonTag of commonTags) {
          revalidateTag(commonTag);
        }
      }
    } else {
      // Regular tag revalidation
      revalidateTag(tag);
    }

    return NextResponse.json({
      success: true,
      tag,
      revalidated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);

    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}

// GET endpoint to list common tags (for debugging)
export async function GET() {
  const commonTags = [
    'cms:bundle:*',
    'cms:page:*',
    'inventory:items:*',
    'inventory:item:*',
  ];

  return NextResponse.json({
    commonTags,
    usage: {
      'POST /api/revalidate': 'Revalidate specific cache tags',
      body: {
        tag: 'Tag to revalidate (supports wildcards like cms:*)',
        secret: 'Revalidation secret from environment',
      },
    },
    examples: [
      {
        description: 'Revalidate all CMS data',
        body: {
          tag: 'cms:*',
          secret: 'your-secret',
        },
      },
      {
        description: 'Revalidate specific page',
        body: {
          tag: 'cms:page:102324:en:home',
          secret: 'your-secret',
        },
      },
      {
        description: 'Revalidate inventory',
        body: {
          tag: 'inventory:*',
          secret: 'your-secret',
        },
      },
    ],
  });
}