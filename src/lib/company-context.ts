/**
 * Company Context Helper
 * Resolves the current company ID based on subdomain and user role
 * Server-side only utility for multi-tenant data filtering
 */

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { AuthenticatedSession } from '@/types/auth.types';

/**
 * Result of company context resolution
 */
export interface CompanyContext {
  companyId: string;
  isGroupAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Gets the current subdomain from request headers
 * Server-side only function
 *
 * @returns Subdomain string or null if not found
 */
async function getCurrentSubdomain(): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const subdomain = host.split('.')[0];

  // Skip if no subdomain or is localhost
  if (!subdomain || subdomain === 'localhost' || subdomain === host) {
    return null;
  }

  return subdomain;
}

/**
 * Resolves the company ID to use for data filtering based on:
 * - User role (SUPER_ADMIN, ADMIN_GRUPO, etc.)
 * - Current subdomain
 *
 * Business Rules:
 * - SUPER_ADMIN: Returns undefined (can see all companies)
 * - ADMIN_GRUPO: Returns company ID of current subdomain (can access any company in their group)
 * - Other roles: Returns user's assigned company ID
 *
 * @param session - Authenticated user session
 * @returns Company ID to use for filtering, or undefined for SUPER_ADMIN
 * @throws Error if company not found for subdomain or user has no company assigned
 */
export async function getCurrentCompanyId(
  session: AuthenticatedSession
): Promise<string | undefined> {
  // SUPER_ADMIN can see all companies
  if (session.user.role === 'SUPER_ADMIN') {
    return undefined;
  }

  // ADMIN_GRUPO: Use company from current subdomain
  if (session.user.role === 'ADMIN_GRUPO') {
    const subdomain = await getCurrentSubdomain();

    if (!subdomain) {
      // If no subdomain, use their default company
      if (!session.user.companyId) {
        throw new Error('Usuario ADMIN_GRUPO sin empresa asignada');
      }
      return session.user.companyId;
    }

    // Find company by subdomain
    const company = await prisma.company.findUnique({
      where: {
        subdomain,
        isActive: true
      },
      select: {
        id: true,
        companyGroupId: true
      }
    });

    if (!company) {
      throw new Error(`Empresa no encontrada para subdominio: ${subdomain}`);
    }

    // Verify user has access to this company (must be in same group)
    if (session.user.companyGroupId !== company.companyGroupId) {
      throw new Error('No tienes acceso a esta empresa');
    }

    return company.id;
  }

  // All other roles: Use their assigned company
  if (!session.user.companyId) {
    throw new Error('Usuario sin empresa asignada');
  }

  return session.user.companyId;
}

/**
 * Gets full company context including role flags
 * Useful for complex authorization logic
 *
 * @param session - Authenticated user session
 * @returns CompanyContext with companyId and role flags
 */
export async function getCompanyContext(
  session: AuthenticatedSession
): Promise<CompanyContext> {
  const isSuperAdmin = session.user.role === 'SUPER_ADMIN';
  const isGroupAdmin = session.user.role === 'ADMIN_GRUPO';

  const companyId = await getCurrentCompanyId(session);

  if (!companyId && !isSuperAdmin) {
    throw new Error('No se pudo determinar el contexto de empresa');
  }

  return {
    companyId: companyId as string,
    isGroupAdmin,
    isSuperAdmin
  };
}

/**
 * Validates that a user has access to a specific company
 *
 * @param session - Authenticated user session
 * @param targetCompanyId - Company ID to validate access to
 * @returns true if user has access, false otherwise
 */
export async function hasCompanyAccess(
  session: AuthenticatedSession,
  targetCompanyId: string
): Promise<boolean> {
  // SUPER_ADMIN has access to all companies
  if (session.user.role === 'SUPER_ADMIN') {
    return true;
  }

  // ADMIN_GRUPO has access to all companies in their group
  if (session.user.role === 'ADMIN_GRUPO' && session.user.companyGroupId) {
    const targetCompany = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      select: { companyGroupId: true }
    });

    return targetCompany?.companyGroupId === session.user.companyGroupId;
  }

  // All other roles: Only access to their assigned company
  return session.user.companyId === targetCompanyId;
}
