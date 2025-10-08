import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import { getCurrentTenant } from './tenant';
import { hashPassword as hash, validatePassword as validate } from './hash';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  dealerId: string;
  isActive: boolean;
};

export type AuthSession = {
  id: string;
  user: AdminUser;
  token: string;
  expiresAt: Date;
};

// Re-export password utilities
export const hashPassword = hash;
const validatePassword = validate;

export async function validateAdminCredentials(email: string, password: string): Promise<AdminUser | null> {
  try {
    // Use raw SQL query to get dealer admin
    const result = await prisma.$queryRaw`
      SELECT id, email, name, password, "dealerId", "isActive"
      FROM dealer_admins
      WHERE email = ${email} AND "isActive" = true
      LIMIT 1
    ` as any[];

    if (!result || result.length === 0) {
      return null;
    }

    const dealerAdmin = result[0];

    if (!validatePassword(password, dealerAdmin.password)) {
      return null;
    }

    // Update last login using raw SQL
    await prisma.$executeRaw`
      UPDATE dealer_admins
      SET "lastLogin" = NOW(), "updatedAt" = NOW()
      WHERE id = ${dealerAdmin.id}
    `;

    return {
      id: dealerAdmin.id,
      email: dealerAdmin.email,
      name: dealerAdmin.name,
      dealerId: dealerAdmin.dealerId,
      isActive: dealerAdmin.isActive,
    };
  } catch (error) {
    console.error('Error validating admin credentials:', error);
    return null;
  }
}

export async function createSession(user: AdminUser): Promise<string> {
  try {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

    // Use raw SQL to create session
    await prisma.$executeRaw`
      INSERT INTO dealer_sessions (id, "adminId", token, "expiresAt", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${user.id}, ${token}, ${expiresAt}, NOW(), NOW())
    `;

    return token;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
}

export async function getSession(token: string): Promise<AuthSession | null> {
  try {
    // Use raw SQL to get session with admin data
    const result = await prisma.$queryRaw`
      SELECT
        s.id, s.token, s."expiresAt",
        a.id as admin_id, a.email, a.name, a."dealerId", a."isActive"
      FROM dealer_sessions s
      JOIN dealer_admins a ON s."adminId" = a.id
      WHERE s.token = ${token}
      LIMIT 1
    ` as any[];

    if (!result || result.length === 0) {
      return null;
    }

    const sessionData = result[0];

    // Check expiration
    if (new Date() > sessionData.expiresAt) {
      await prisma.$executeRaw`
        DELETE FROM dealer_sessions WHERE id = ${sessionData.id}
      `;
      return null;
    }

    // Check if user is still active
    if (!sessionData.isActive) {
      return null;
    }

    return {
      id: sessionData.id,
      user: {
        id: sessionData.admin_id,
        email: sessionData.email,
        name: sessionData.name,
        dealerId: sessionData.dealerId,
        isActive: sessionData.isActive,
      },
      token: sessionData.token,
      expiresAt: sessionData.expiresAt,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function deleteSession(token: string): Promise<void> {
  try {
    await prisma.$executeRaw`
      DELETE FROM dealer_sessions WHERE token = ${token}
    `;
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<AuthSession | null> {
  const token = request.cookies.get('admin-session')?.value;
  if (!token) return null;

  return await getSession(token);
}

export async function requireAuth(): Promise<AuthSession> {
  const headersList = await headers();
  const cookie = headersList.get('cookie');

  if (!cookie) {
    redirect('/admin/login');
  }

  // Parse session cookie
  const sessionMatch = cookie.match(/admin-session=([^;]+)/);
  if (!sessionMatch) {
    redirect('/admin/login');
  }

  const token = sessionMatch[1];
  const session = await getSession(token);

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}

export async function requireDealerAuth(): Promise<{ session: AuthSession; dealerId: string }> {
  const session = await requireAuth();
  const tenant = await getCurrentTenant();

  // Dealer admins can only access their own dealer
  if (session.user.dealerId !== tenant.dealerId) {
    redirect('/admin/unauthorized');
  }

  return { session, dealerId: tenant.dealerId };
}

export async function validateDealerAccess(dealerId: string, session: AuthSession): Promise<boolean> {
  // Dealer admin can only access their own dealer
  return session.user.dealerId === dealerId;
}

// Middleware helper
export async function isAuthenticatedForDealer(request: NextRequest, dealerId: string): Promise<boolean> {
  const session = await getSessionFromRequest(request);
  if (!session) return false;

  return await validateDealerAccess(dealerId, session);
}