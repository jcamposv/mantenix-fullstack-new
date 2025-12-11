/**
 * Pending Approval Work Orders API Endpoint
 *
 * GET /api/work-orders/pending-approval
 * Returns work orders that require approval from current user.
 *
 * Following Next.js Expert standards:
 * - Server-side API route
 * - Type-safe
 * - Proper error handling
 */

import { NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { prisma } from '@/lib/prisma'
import { getCurrentCompanyId } from '@/lib/company-context'

export async function GET() {
  try {
    // Authenticate user
    const sessionResult = await AuthService.getAuthenticatedSession()
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const companyId = await getCurrentCompanyId(sessionResult)
    if (!companyId) {
      return NextResponse.json(
        { error: 'No se pudo determinar la empresa' },
        { status: 400 }
      )
    }

    // Get user's authority level
    const user = await prisma.user.findUnique({
      where: { id: sessionResult.user.id },
      select: { 
        role: {
          select: {
            key: true
          }
        }
      },
    })

    if (!user || !user.role?.key) {
      return NextResponse.json({ error: 'Usuario no encontrado o sin rol válido' }, { status: 404 })
    }

    const authorityLimit = await prisma.authorityLimit.findFirst({
      where: {
        companyId,
        roleKey: user.role.key,
        isActive: true,
      },
    })

    if (!authorityLimit) {
      // User has no authority limit configured
      return NextResponse.json({
        workOrders: [],
        total: 0,
      })
    }

    // Get work orders with pending approvals that match user's role
    const workOrders = await prisma.workOrder.findMany({
      where: {
        companyId,
        isActive: true,
        status: {
          in: ['DRAFT', 'ASSIGNED'],
        },
        approvals: {
          some: {
            requiredRole: user.role.key,
            status: 'PENDING',
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        site: {
          select: {
            id: true,
            name: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
        approvals: {
          where: {
            status: 'PENDING',
            requiredRole: user.role.key,
          },
          include: {
            approvedByUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      workOrders,
      total: workOrders.length,
    })
  } catch (error) {
    console.error('Error fetching pending approvals:', error)
    return NextResponse.json(
      { error: 'Error al obtener órdenes pendientes de aprobación' },
      { status: 500 }
    )
  }
}
