import { Prisma } from '@prisma/client'
import type {
  WorkOrderWithRelations,
  WorkOrderStats
} from '@/types/work-order.types'
import type { AuthenticatedSession } from '@/types/auth.types'
import { prisma } from '@/lib/prisma'
import { WorkOrderRepository } from '@/server/repositories/work-order.repository'

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
            manufacturer: true,
            model: true,
            location: true,
            status: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true,
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
                image: true,
              },
            },
            assigner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
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
    session: AuthenticatedSession,
    dateRange?: { from?: Date; to?: Date }
  ): Promise<WorkOrderStats> {
    const whereClause = this.buildClientWhereClause(session)

    // Add date range filter if provided
    if (dateRange?.from || dateRange?.to) {
      whereClause.createdAt = {}
      if (dateRange.from) {
        whereClause.createdAt.gte = dateRange.from
      }
      if (dateRange.to) {
        whereClause.createdAt.lte = dateRange.to
      }
    }

    const [
      total,
      draft,
      pendingApproval,
      approved,
      rejected,
      assigned,
      inProgress,
      pendingQA,
      completed,
      cancelled,
    ] = await Promise.all([
      prisma.workOrder.count({ where: whereClause }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'DRAFT' } }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'PENDING_APPROVAL' } }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'APPROVED' } }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'REJECTED' } }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'ASSIGNED' } }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'IN_PROGRESS' } }),
      prisma.workOrder.count({ where: { ...whereClause, status: 'PENDING_QA' } }),
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
        PENDING_APPROVAL: pendingApproval,
        APPROVED: approved,
        REJECTED: rejected,
        ASSIGNED: assigned,
        IN_PROGRESS: inProgress,
        PENDING_QA: pendingQA,
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

  /**
   * Get critical work orders (URGENT and HIGH priority) for client users
   */
  static async getCriticalOrders(
    session: AuthenticatedSession,
    dateRange?: { from?: Date; to?: Date }
  ) {
    const whereClause = this.buildClientWhereClause(session)
    const now = new Date()

    // Add date range filter if provided
    if (dateRange?.from || dateRange?.to) {
      whereClause.createdAt = {}
      if (dateRange.from) {
        whereClause.createdAt.gte = dateRange.from
      }
      if (dateRange.to) {
        whereClause.createdAt.lte = dateRange.to
      }
    }

    const criticalOrders = await WorkOrderRepository.getCriticalOrders(whereClause, 10)

    // Calculate days overdue for each order
    return criticalOrders.map(order => {
      let daysOverdue: number | undefined
      if (order.scheduledDate) {
        const scheduled = new Date(order.scheduledDate)
        if (scheduled < now) {
          const diffTime = Math.abs(now.getTime() - scheduled.getTime())
          daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }
      }

      return {
        id: order.id,
        number: order.number,
        title: order.title,
        priority: order.priority,
        status: order.status,
        scheduledDate: order.scheduledDate,
        site: order.site,
        daysOverdue,
      }
    })
  }

  /**
   * Get provider performance metrics for client users
   */
  static async getProviderMetrics(
    session: AuthenticatedSession,
    dateRange?: { from?: Date; to?: Date }
  ) {
    const whereClause = this.buildClientWhereClause(session)

    // Add date range filter if provided
    if (dateRange?.from || dateRange?.to) {
      whereClause.createdAt = {}
      if (dateRange.from) {
        whereClause.createdAt.gte = dateRange.from
      }
      if (dateRange.to) {
        whereClause.createdAt.lte = dateRange.to
      }
    }

    const orders = await WorkOrderRepository.getOrdersForProviderMetrics(whereClause)

    const total = orders.length
    if (total === 0) {
      return {
        slaCompliance: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
        serviceRating: 0,
      }
    }

    // Calculate SLA compliance (orders completed on time)
    const completedOrders = orders.filter(o => o.status === 'COMPLETED')
    const onTimeOrders = completedOrders.filter(order => {
      if (!order.scheduledDate) return true
      return new Date(order.updatedAt) <= new Date(order.scheduledDate)
    })
    const slaCompliance = completedOrders.length > 0
      ? Math.round((onTimeOrders.length / completedOrders.length) * 100)
      : 0

    // Calculate average response time (time from creation to first assignment)
    let totalResponseTime = 0
    let responseCount = 0
    orders.forEach(order => {
      if (order.assignments.length > 0) {
        const responseTime = new Date(order.assignments[0].assignedAt).getTime() - new Date(order.createdAt).getTime()
        totalResponseTime += responseTime / (1000 * 60 * 60) // Convert to hours
        responseCount++
      }
    })
    const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0

    // Calculate average resolution time (time from creation to completion)
    let totalResolutionTime = 0
    let resolutionCount = 0
    completedOrders.forEach(order => {
      const resolutionTime = new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()
      totalResolutionTime += resolutionTime / (1000 * 60 * 60) // Convert to hours
      resolutionCount++
    })
    const avgResolutionTime = resolutionCount > 0 ? totalResolutionTime / resolutionCount : 0

    // Calculate overall service rating
    const serviceRating = Math.round(
      (slaCompliance * 0.5) +
      (Math.max(0, 100 - avgResponseTime * 10) * 0.25) +
      (Math.max(0, 100 - avgResolutionTime * 2) * 0.25)
    )

    return {
      slaCompliance,
      avgResponseTime: Number(avgResponseTime.toFixed(1)),
      avgResolutionTime: Number(avgResolutionTime.toFixed(1)),
      serviceRating,
    }
  }

  /**
   * Get metrics grouped by site for client users
   */
  static async getSiteMetrics(
    session: AuthenticatedSession,
    dateRange?: { from?: Date; to?: Date }
  ) {
    const whereClause = this.buildClientWhereClause(session)
    const now = new Date()

    // Add date range filter if provided
    if (dateRange?.from || dateRange?.to) {
      whereClause.createdAt = {}
      if (dateRange.from) {
        whereClause.createdAt.gte = dateRange.from
      }
      if (dateRange.to) {
        whereClause.createdAt.lte = dateRange.to
      }
    }

    const orders = await WorkOrderRepository.getOrdersForSiteMetrics(whereClause)

    // Group by site
    const siteMap = new Map<string, {
      siteId: string
      siteName: string
      total: number
      completed: number
      inProgress: number
      overdue: number
      resolutionTimes: number[]
    }>()

    orders.forEach(order => {
      if (!order.site) return

      const siteId = order.site.id
      if (!siteMap.has(siteId)) {
        siteMap.set(siteId, {
          siteId,
          siteName: order.site.name,
          total: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0,
          resolutionTimes: [],
        })
      }

      const siteData = siteMap.get(siteId)!
      siteData.total++

      if (order.status === 'COMPLETED') {
        siteData.completed++
        const resolutionTime = new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()
        siteData.resolutionTimes.push(resolutionTime / (1000 * 60 * 60)) // hours
      } else if (order.status === 'IN_PROGRESS') {
        siteData.inProgress++
      }

      // Check if overdue
      if (
        order.scheduledDate &&
        new Date(order.scheduledDate) < now &&
        order.status !== 'COMPLETED' &&
        order.status !== 'CANCELLED'
      ) {
        siteData.overdue++
      }
    })

    // Convert to array and calculate metrics
    return Array.from(siteMap.values()).map(site => {
      const completionRate = site.total > 0
        ? Math.round((site.completed / site.total) * 100)
        : 0

      const avgResolutionTime = site.resolutionTimes.length > 0
        ? site.resolutionTimes.reduce((a, b) => a + b, 0) / site.resolutionTimes.length
        : undefined

      return {
        siteId: site.siteId,
        siteName: site.siteName,
        total: site.total,
        completed: site.completed,
        inProgress: site.inProgress,
        overdue: site.overdue,
        completionRate,
        avgResolutionTime: avgResolutionTime ? Number(avgResolutionTime.toFixed(1)) : undefined,
      }
    }).sort((a, b) => b.total - a.total) // Sort by total orders descending
  }
}
