import { db } from './db';
import { createSupabaseServerClient } from './supabase/server';
import { cookies } from 'next/headers';

export type UserRole = 'DONO' | 'GERENTE' | 'FUNCIONARIO';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

/**
 * Get the authenticated user from Supabase session cookies.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();

    // Dev-only mock bypass — NUNCA confiar neste cookie em produção.
    if (process.env.NODE_ENV !== 'production') {
      const mockCookie = cookieStore.get('pr-store-mock-auth');
      if (mockCookie) {
        try {
          return JSON.parse(mockCookie.value);
        } catch {
          return null;
        }
      }
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    // Fetch role from our database
    const dbUser = await db.usuario.findUnique({
      where: { email: user.email },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as UserRole,
      name: dbUser.name,
    };
  } catch {
    return null;
  }
}

/**
 * Check if user has required role.
 */
export function hasRole(user: AuthUser | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

/**
 * Role hierarchy checks
 */
export function isOwner(user: AuthUser | null): boolean {
  return hasRole(user, ['DONO']);
}

export function isManager(user: AuthUser | null): boolean {
  return hasRole(user, ['DONO', 'GERENTE']);
}

export function isEmployee(user: AuthUser | null): boolean {
  return hasRole(user, ['DONO', 'GERENTE', 'FUNCIONARIO']);
}
