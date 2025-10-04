import { NextResponse, NextRequest } from 'next/server';


export function middleware(req: NextRequest) {
    // Read tenant from host; for localhost, allow ?tenant=demo1 fallback
    const url = req.nextUrl;
    const tenantFromQuery = url.searchParams.get('tenant');
    if (tenantFromQuery) return NextResponse.next();


    const host = req.headers.get('host') || '';
    // Map host → tenant if you use local hosts like demo1.localhost
    // Example: subdomain → tenantKey
    const sub = host.split(':')[0].split('.')[0];
    if (sub && sub !== 'localhost' && sub !== 'www') {
        url.searchParams.set('tenant', sub);
        return NextResponse.rewrite(url);
    }
    return NextResponse.next();
}