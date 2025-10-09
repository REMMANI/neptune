import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { getCurrentTenant } from './tenant';
import { hashPassword as hash, validatePassword as validate } from './hash';
import { findDealerAdminByEmail, createAdminSession, findValidSession, updateAdminLastLogin } from './db';
import { prisma } from './prisma';

export type DealerAdmin = {
  id: string;
  email: string;
  name: string;
  dealerId: string;
  isActive: boolean;
  dealer?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
};

export type AuthSession = {
  id: string;
  user: DealerAdmin;
  token: string;
  expiresAt: Date;
};

// Re-export password utilities
export const hashPassword = hash;
const validatePassword = validate;

export async function validateDealerCredentials(email: string, password: string): Promise<DealerAdmin | null> {
  try {
    const admin = await findDealerAdminByEmail(email);

    if (!admin) {
      return null;
    }

    if (!validatePassword(password, admin.hashedPassword)) {
      return null;
    }

    // Update last login
    await updateAdminLastLogin(admin.id);

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      dealerId: admin.dealerId,
      isActive: admin.isActive,
      dealer: admin.dealer,
    };
  } catch (error) {
    console.error('Error validating dealer credentials:', error);
    return null;
  }
}

export async function createSession(user: DealerAdmin): Promise<string> {
  try {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

    await createAdminSession(user.id, token, expiresAt);

    return token;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
}

export async function getSession(token: string): Promise<AuthSession | null> {
  try {
    const session = await findValidSession(token);

    if (!session) {
      return null;
    }

    // Check if user is still active
    if (!session.admin.isActive) {
      return null;
    }

    return {
      id: session.id,
      user: {
        id: session.admin.id,
        email: session.admin.email,
        name: session.admin.name,
        dealerId: session.admin.dealerId,
        isActive: session.admin.isActive,
        dealer: session.admin.dealer,
      },
      token: session.token,
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function deleteSession(token: string): Promise<void> {
  try {
    await prisma.$executeRaw`
      DELETE FROM admin_sessions WHERE token = ${token}
    `;
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<AuthSession | null> {
  const token = request.cookies.get('dealer-session')?.value;
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
  const sessionMatch = cookie.match(/dealer-session=([^;]+)/);
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

export async function requireDealerAccess(): Promise<{ session: AuthSession; dealerId: string }> {
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

// Backward compatibility exports
export const validateAdminCredentials = validateDealerCredentials;
export const createDealerSession = createSession;
export const getDealerSession = getSession;
export const deleteDealerSession = deleteSession;
export const getDealerSessionFromRequest = getSessionFromRequest;
export const requireDealerAuth = requireAuth;
export const validateDealershipAccess = validateDealerAccess;
export const isAuthenticatedForDealership = isAuthenticatedForDealer;

// Export types for backward compatibility
export type DealerAdminUser = DealerAdmin;
export type DealerAuthSession = AuthSession;
export type AdminUser = DealerAdmin;