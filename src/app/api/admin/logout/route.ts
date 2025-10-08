import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, getSessionFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await getSessionFromRequest(request);

    if (session) {
      // Delete session from database
      const token = request.cookies.get('admin-session')?.value;
      if (token) {
        await deleteSession(token);
      }
    }

    // Clear cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin-session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}