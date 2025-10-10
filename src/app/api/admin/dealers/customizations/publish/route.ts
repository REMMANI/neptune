import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getSessionFromRequest, isAuthenticatedForDealer } from '@/lib/auth';
import { findDealerById, getCustomization, publishDraftCustomization } from '@/lib/db';
import { invalidateDealerCache } from '@/lib/config';

export async function POST(
  request: NextRequest
) {
  try {
    const session = await getSessionFromRequest(request);
    const dealerId = (session as any).user.id 

    // Check authentication and dealer access
    if (!(await isAuthenticatedForDealer(request, dealerId))) {
      return NextResponse.json(
        { error: 'Unauthorized - insufficient permissions for this dealer' },
        { status: 403 }
      );
    }

    // Validate dealer exists
    const dealer = await findDealerById(dealerId);
    if (!dealer) {
      return NextResponse.json(
        { error: 'Dealer not found' },
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
    console.error('Admin publish error:', error);
    return NextResponse.json(
      { error: 'Failed to publish customization' },
      { status: 500 }
    );
  }
}