import { NextRequest, NextResponse } from "next/server";
import { findDealerById } from '@/lib/db';
import { getDealerConfig } from '@/lib/config';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { id: string };

export async function GET(
    request: NextRequest,
    ctx: { params: Promise<Params> }
) {
    try {
        const { id: dealerId } = await ctx.params;
        const { searchParams } = new URL(request.url);
        const preview = searchParams.get('preview') === '1';

        // Check if dealer exists
        const dealer = await findDealerById(dealerId);
        if (!dealer) {
            return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
        }

        // Get dealer configuration
        const config = await getDealerConfig(dealerId, { preview });

        return NextResponse.json(config, {
            headers: {
                "Cache-Control": preview
                    ? "no-cache, no-store, must-revalidate"
                    : "public, max-age=60, stale-while-revalidate=600"
            },
        });
    } catch (error) {
        console.error('Site config error:', error);
        return NextResponse.json(
            { error: "Failed to get dealer configuration" },
            { status: 500 }
        );
    }
}
