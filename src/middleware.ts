import { NextResponse, NextRequest } from 'next/server';


export function middleware(req: NextRequest) {
    
    const url = req.nextUrl;
    const tenantFromQuery = url.searchParams.get('tenant');
    if (tenantFromQuery) return NextResponse.next();


    const host = req.headers.get('host') || '';
    
    
    const sub = host.split(':')[0].split('.')[0];
    if (sub && sub !== 'localhost' && sub !== 'www') {
        url.searchParams.set('tenant', sub);
        return NextResponse.rewrite(url);
    }
    return NextResponse.next();
}