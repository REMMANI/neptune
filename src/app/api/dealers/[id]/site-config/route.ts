import { NextRequest, NextResponse } from "next/server";
import { getMockDealerConfig } from "@/lib/mock-dealer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { id: string };

export async function GET(
    _req: NextRequest,
    ctx: { params: Promise<Params> } 
) {
    const { id } = await ctx.params;
    const dealerId = Number(id);
    const cfg = getMockDealerConfig(dealerId);

    if (!cfg) {
        return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
    }
    return NextResponse.json(cfg, {
        headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" },
    });
}
