import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateAdminCredentials, createSession } from '@/lib/auth';
import { getCurrentTenant } from '@/lib/tenant';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    // Validate credentials
    const user = await validateAdminCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get current tenant (dealer) from domain
    const tenant = await getCurrentTenant();

    // Ensure dealer admin can only access their dealer
    if (user.dealerId !== tenant.dealerId) {
      return NextResponse.json(
        { error: 'Access denied for this dealer' },
        { status: 403 }
      );
    }

    // Create session
    const token = await createSession(user);

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        dealerId: user.dealerId,
      },
    });

    response.cookies.set('admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);

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