/**
 * Auth utilities for getting user role and permissions
 */

import { auth } from "./auth"
import { prisma } from "./prisma"
import { headers } from "next/headers"

/**
 * Get current user with role from server side
 */
export async function getCurrentUserWithRole() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return null
    }

    // Fetch user with company info, site, client company, and role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: {
          select: {
            id: true,
            key: true,
            name: true,
            interfaceType: true
          }
        },
        company: true,
        site: {
          select: {
            id: true,
            name: true,
            clientCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        clientCompany: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!user || !user.role) {
      return {
        ...session.user,
        role: null,
        roleId: null,
        companyId: null,
        companyGroupId: null,
        siteId: null,
        clientCompanyId: null,
        company: null,
        site: null,
        clientCompany: null
      }
    }

    return {
      ...session.user,
      role: user.role.key || '', // CustomRole.key as string (for backwards compatibility)
      roleId: user.roleId, // CustomRole.id
      roleName: user.role.name, // Full role name
      roleInterfaceType: user.role.interfaceType, // MOBILE, DASHBOARD, BOTH
      companyId: user.companyId,
      companyGroupId: user.companyGroupId,
      siteId: user.siteId,
      clientCompanyId: user.clientCompanyId,
      mfaEnabled: user.mfaEnabled,
      preferences: user.preferences,
      company: user.company,
      site: user.site,
      clientCompany: user.clientCompany
    }
  } catch (error) {
    console.error('Error getting current user with role:', error)
    return null
  }
}

/**
 * Check if user is super admin (server side)
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUserWithRole()
  return user?.role === 'SUPER_ADMIN'
}

/**
 * Result type for subdomain validation
 */
export interface SubdomainValidationResult {
  canAccess: boolean;
  error?: string;
}

/**
 * Validates if a user can access a specific subdomain
 * Server-side validation for multi-tenant access control
 *
 * Business Rules:
 * - SUPER_ADMIN: Can access any subdomain
 * - ADMIN_GRUPO: Can only access subdomains in their company group
 * - Other roles: Can only access their company's subdomain
 *
 * @param userId - User ID to validate
 * @param subdomain - Subdomain attempting to access
 * @returns Validation result with canAccess flag and optional error message
 */
export async function validateSubdomainAccess(
  userId: string,
  subdomain: string
): Promise<SubdomainValidationResult> {
  try {
    // Fetch user with company group relationships and role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            key: true
          }
        },
        company: {
          include: {
            companyGroup: {
              include: {
                companies: {
                  select: {
                    id: true,
                    subdomain: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user || !user.role) {
      return {
        canAccess: false,
        error: 'Usuario no encontrado'
      }
    }

    // SUPER_ADMIN has unrestricted access
    if (user.role.key === 'SUPER_ADMIN') {
      return { canAccess: true }
    }

    // Validate target company exists and is active
    const targetCompany = await prisma.company.findUnique({
      where: {
        subdomain,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        companyGroupId: true
      }
    })

    if (!targetCompany) {
      return {
        canAccess: false,
        error: `No existe una empresa activa con el subdominio: ${subdomain}`
      }
    }

    // ADMIN_GRUPO validation: must be in same corporate group
    if (user.role.key === 'ADMIN_GRUPO') {
      if (!user.company?.companyGroup) {
        return {
          canAccess: false,
          error: 'Tu usuario no está asignado a un grupo corporativo'
        }
      }

      const groupSubdomains = user.company.companyGroup.companies.map(c => c.subdomain)

      if (groupSubdomains.includes(subdomain)) {
        return { canAccess: true }
      }

      return {
        canAccess: false,
        error: `No tienes acceso a ${targetCompany.name}. Solo puedes acceder a empresas de tu grupo corporativo.`
      }
    }

    // All other roles: exact company subdomain match required
    if (user.company?.subdomain === subdomain) {
      return { canAccess: true }
    }

    return {
      canAccess: false,
      error: `Debes iniciar sesión en el subdominio de tu empresa: ${user.company?.subdomain || 'desconocido'}`
    }
  } catch (error) {
    console.error('Error validating subdomain access:', error)
    return {
      canAccess: false,
      error: 'Error al validar acceso al subdominio'
    }
  }
}