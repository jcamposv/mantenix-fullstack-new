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

    // Fetch user with company info, site, and client company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
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

    if (!user) {
      return {
        ...session.user,
        role: null,
        companyId: null,
        siteId: null,
        clientCompanyId: null,
        company: null,
        site: null,
        clientCompany: null
      }
    }

    return {
      ...session.user,
      role: user.role,
      companyId: user.companyId,
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
export async function isSuperAdmin() {
  const user = await getCurrentUserWithRole()
  return user?.role === 'SUPER_ADMIN'
}