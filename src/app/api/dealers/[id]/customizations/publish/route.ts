import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { findDealerById, getCustomization, publishDraftCustomization } from '@/lib/db';
import { invalidateDealerCache } from '@/lib/config';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: dealerId } = params;

    // Validate dealer exists
    const dealer = await findDealerById(dealerId);

    if (!dealer) {
      return NextResponse.json(
        { error: 'Dealer not found or inactive' },
        { status: 404 }
      );
    }

    // Get draft customization
    const draftCustomization = await getCustomization(dealerId, 'DRAFT');

    if (!draftCustomization) {
      return NextResponse.json(
        { error: 'No draft found to publish' },
        { status: 404 }
      );
    }

    // Publish the draft
    const result = await publishDraftCustomization(dealerId);

    // Invalidate all caches for this dealer
    await invalidateDealerCache(dealerId);

    // Revalidate Next.js cache tags
    revalidateTag(`dealer:${dealerId}`);
    revalidateTag(`cms:bundle:${dealerId}`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Customization published successfully',
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish customization' },
      { status: 500 }
    );
  }
}