import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findDealerById, getCustomization, upsertDraftCustomization } from '@/lib/db';
import { DealerConfigSchema } from '@/types/customization';
import { invalidateDealerCache } from '@/lib/config';

const PartialConfigSchema = DealerConfigSchema.deepPartial();

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

    // Parse request body
    const body = await request.json();
    const partialConfig = PartialConfigSchema.parse(body);

    // Get existing draft customization
    const existingDraft = await getCustomization(dealerId, 'DRAFT');

    let finalData = partialConfig;

    if (existingDraft) {
      // Merge with existing draft
      finalData = deepMergePartial(existingDraft.data, partialConfig);
    } else {
      // Merge with published version as base
      const publishedCustomization = await getCustomization(dealerId, 'PUBLISHED');
      const baseData = publishedCustomization?.data || {};
      finalData = deepMergePartial(baseData, partialConfig);
    }

    // Upsert the draft
    const draftCustomization = await upsertDraftCustomization(dealerId, finalData);

    // Invalidate preview cache
    await invalidateDealerCache(dealerId);

    return NextResponse.json({
      success: true,
      data: draftCustomization,
      message: 'Draft updated successfully',
    });
  } catch (error) {
    console.error('Draft update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid configuration data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: dealerId } = params;

    const draftCustomization = await getCustomization(dealerId, 'DRAFT');

    if (!draftCustomization) {
      return NextResponse.json(
        { error: 'No draft found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: draftCustomization,
    });
  } catch (error) {
    console.error('Draft fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: dealerId } = params;

    const draftCustomization = await getCustomization(dealerId, 'DRAFT');

    if (!draftCustomization) {
      return NextResponse.json(
        { error: 'No draft found' },
        { status: 404 }
      );
    }

    await upsertDraftCustomization(dealerId, {});

    // Invalidate preview cache
    await invalidateDealerCache(dealerId);

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
    });
  } catch (error) {
    console.error('Draft delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}

function deepMergePartial(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined && source[key] !== null) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMergePartial(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}