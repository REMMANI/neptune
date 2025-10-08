import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import { getCurrentTenant } from './tenant';
import { hashPassword as hash, validatePassword as validate } from './hash';

// Type augmentation for Prisma client to avoid TypeScript errors
// This is a workaround until the Prisma client is properly regenerated
declare module '@prisma/client' {
  interface PrismaClient {
    adminUser: any;
    adminSession: any;
  }
}

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'DEALER_ADMIN';
  dealerId?: string | null;
  permissions: string[];
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
    const adminUsers = await prisma.$queryRaw`
      SELECT au.*, d.id as dealer_id, d.name as dealer_name, d.slug as dealer_slug
      FROM admin_users au
      LEFT JOIN dealers d ON au."dealerId" = d.id
      WHERE au.email = ${email} AND au."isActive" = true
      LIMIT 1
    ` as any[];

    if (!adminUsers || adminUsers.length === 0) {
      return null;
    }

    const adminUser = adminUsers[0];

    if (!validatePassword(password, adminUser.password)) {
      return null;
    }

    // Update last login
    await prisma.$executeRaw`
      UPDATE admin_users
      SET "lastLogin" = NOW(), "updatedAt" = NOW()
      WHERE id = ${adminUser.id}
    `;

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role as 'SUPER_ADMIN' | 'DEALER_ADMIN',
      dealerId: adminUser.dealerId,
      permissions: Array.isArray(adminUser.permissions) ? adminUser.permissions as string[] : [],
      isActive: adminUser.isActive,
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

    await prisma.$executeRaw`
      INSERT INTO admin_sessions (id, "userId", token, "expiresAt", "createdAt", "updatedAt")
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
    const sessions = await prisma.$queryRaw`
      SELECT s.*, au.id as user_id, au.email, au.name, au.role, au."dealerId", au.permissions, au."isActive"
      FROM admin_sessions s
      JOIN admin_users au ON s."userId" = au.id
      WHERE s.token = ${token}
      LIMIT 1
    ` as any[];

    if (!sessions || sessions.length === 0) {
      return null;
    }

    const session = sessions[0];

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      await prisma.$executeRaw`
        DELETE FROM admin_sessions WHERE id = ${session.id}
      `;
      return null;
    }

    // Check if user is still active
    if (!session.isActive) {
      return null;
    }

    return {
      id: session.id,
      user: {
        id: session.user_id,
        email: session.email,
        name: session.name,
        role: session.role as 'SUPER_ADMIN' | 'DEALER_ADMIN',
        dealerId: session.dealerId,
        permissions: Array.isArray(session.permissions) ? session.permissions as string[] : [],
        isActive: session.isActive,
      },
      token: session.token,
      expiresAt: new Date(session.expiresAt),
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

  // Super admins can access any dealer
  if (session.user.role === 'SUPER_ADMIN') {
    return { session, dealerId: tenant.dealerId };
  }

  // Dealer admins can only access their own dealer
  if (session.user.role === 'DEALER_ADMIN') {
    if (session.user.dealerId !== tenant.dealerId) {
      redirect('/admin/unauthorized');
    }
    return { session, dealerId: tenant.dealerId };
  }

  redirect('/admin/unauthorized');
}

export function hasPermission(user: AdminUser, permission: string): boolean {
  if (user.permissions.includes('*')) return true;
  return user.permissions.includes(permission);
}

export async function validateDealerAccess(dealerId: string, session: AuthSession): Promise<boolean> {
  // Super admin has access to all dealers
  if (session.user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Dealer admin can only access their own dealer
  if (session.user.role === 'DEALER_ADMIN') {
    return session.user.dealerId === dealerId;
  }

  return false;
}

// Middleware helper
export async function isAuthenticatedForDealer(request: NextRequest, dealerId: string): Promise<boolean> {
  const session = await getSessionFromRequest(request);
  if (!session) return false;

  return await validateDealerAccess(dealerId, session);
}