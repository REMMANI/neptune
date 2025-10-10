import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateDealerCredentials, createSession } from '@/lib/auth';
import { getCurrentTenant } from '@/lib/tenant';

const DealerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = DealerLoginSchema.parse(body);

    // Validate dealer credentials
    const admin = await validateDealerCredentials(email, password);
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get current tenant (dealership) from domain
    const tenant = await getCurrentTenant();

    // Ensure dealer admin can only access their dealer
    if (admin.dealerId !== tenant.dealerId) {
      return NextResponse.json(
        { error: 'Access denied for this dealer' },
        { status: 403 }
      );
    }

    
    const sessionToken = await createSession(admin);

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        dealerId: admin.dealerId,
        dealer: admin.dealer,
      },
    });

    response.cookies.set('dealer-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Dealer login error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}