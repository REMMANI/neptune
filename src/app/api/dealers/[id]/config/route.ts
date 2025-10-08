import { NextRequest, NextResponse } from 'next/server';
import { getDealerConfig } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: dealerId } = params;
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === '1';

    const config = await getDealerConfig(dealerId, { preview });

    return NextResponse.json({
      success: true,
      data: config,
    }, {
      headers: {
        'Cache-Control': preview
          ? 'no-cache, no-store, must-revalidate'
          : 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Config fetch error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch dealer configuration' },
      { status: 500 }
    );
  }
}