/**
 * Available Roles API
 * GET /api/roles/available - Get all available roles (system + company custom)
 *
 * Returns system roles (except SUPER_ADMIN) and company-specific custom roles
 */

import { NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }
    const session = sessionResult

    if (!session.user.companyId) {
      return NextResponse.json(
        { error: 'Usuario sin empresa asignada' },
        { status: 400 }
      )
    }

    // Get all available roles:
    // 1. System roles (isSystemRole = true) EXCEPT SUPER_ADMIN
    // 2. Company custom roles (companyId = user's company)
    const roles = await prisma.customRole.findMany({
      where: {
        OR: [
          {
            isSystemRole: true,
            key: { not: 'SUPER_ADMIN' } // Exclude SUPER_ADMIN
          },
          { companyId: session.user.companyId }
        ],
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true,
        key: true,
        name: true,
        isSystemRole: true
      },
      orderBy: [
        { isSystemRole: 'desc' }, // System roles first
        { name: 'asc' }
      ]
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching available roles:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
