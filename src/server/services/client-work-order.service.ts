import { Prisma } from '@prisma/client'
import type {
  WorkOrderWithRelations,
  WorkOrderStats
} from '@/types/work-order.types'
import type { AuthenticatedSession } from '@/types/auth.types'
import { prisma } from '@/lib/prisma'

/**
 * Service for client users (external users) to manage work orders
 * Implements proper filtering by clientCompanyId or siteId based on role
 */
export class ClientWorkOrderService {

  /**
   * Build WHERE clause for client users based on their role
   */
  private static buildClientWhereClause(session: AuthenticatedSession): Prisma.WorkOrderWhereInput {
    const whereClause: Prisma.WorkOrderWhereInput = {}

    if (session.user.role === 'CLIENTE_ADMIN_GENERAL') {
      // Admin general sees all sites from their client company
      if (!session.user.clientCompanyId) {
        throw new Error("Usuario CLIENTE_ADMIN_GENERAL no tiene clientCompanyId asignado")
      }
      whereClause.site = {
        clientCompanyId: session.user.clientCompanyId
      }
    } else if (session.user.role === 'CLIENTE_ADMIN_SEDE' || session.user.role === 'CLIENTE_OPERARIO') {
      // Site admin and operators see only their site
      if (!session.user.siteId) {
        throw new Error(`Usuario ${session.user.role} no tiene siteId asignado`)
      }
      whereClause.siteId = session.user.siteId
    } else {
      throw new Error("Rol no autorizado para acceso de cliente")
    }

    return whereClause
  }

  /**
   * Get work orders for client users with proper filtering
   */
  static async getWorkOrders(
    session: AuthenticatedSession,
    pagination?: { page: number; limit: number }
  ): Promise<{ workOrders: WorkOrderWithRelations[]; total: number }> {
    const whereClause = this.buildClientWhereClause(session)

    const page = pagination?.page || 1
    const limit = pagination?.limit || 50
    const skip = (page - 1) * limit

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where: whereClause,
        include: {
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              clientCompany: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          asset: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
            },
          },
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
              assigner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.workOrder.count({
        where: whereClause,
      }),
    ])

    return { workOrders: workOrders as unknown as WorkOrderWithRelations[], total }
  }

  /**
   * Get work order by ID for client users
   */
  static async getWorkOrderById(
    session: AuthenticatedSession,
    id: string
  ): Promise<WorkOrderWithRelations | null> {
    const whereClause = this.buildClientWhereClause(session)

    const workOrder = await prisma.workOrder.findFirst({
      where: {
        ...whereClause,
        id,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            clientCompanyId: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            customFields: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            assigner: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    })

    return workOrder as unknown as WorkOrderWithRelations | null
  }

  /**
   * Get work order statistics for client users
   */
  static async getWorkOrderStats(
    session: AuthenticatedSession
  ): Promise<WorkOrderStats> {
    const whereClause = this.buildClientWhereClause(session)

    const [
      total,
      draft,
      assigned,
      inProgress,
      completed,
      cancelled,
    ] = await Promise.all([
      prisma.workOrder.count({ where: whereClause }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'DRAFT' } }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'ASSIGNED' } }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'IN_PROGRESS' } }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'COMPLETED' } }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'CANCELLED' } }),
    ])

    // Calculate overdue work orders
    const now = new Date()
    const overdue = await prisma.workOrder.count({
      where: {
        ...whereClause,
        status: {
          in: ['DRAFT', 'ASSIGNED', 'IN_PROGRESS'],
        },
        scheduledDate: {
          lt: now,
        },
      },
    })

    return {
      total,
      byStatus: {
        DRAFT: draft,
        ASSIGNED: assigned,
        IN_PROGRESS: inProgress,
        COMPLETED: completed,
        CANCELLED: cancelled,
      },
      byType: {
        PREVENTIVO: 0,
        CORRECTIVO: 0,
        REPARACION: 0,
      },
      byPriority: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0,
      },
      overdue,
      dueToday: 0,
      dueThisWeek: 0,
    }
  }
}
