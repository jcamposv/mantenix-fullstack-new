import { PrismaClient, Prisma } from '@prisma/client'
import type { 
  WorkOrderWithRelations, 
  WorkOrderFilters,
  WorkOrderAssignmentWithUser
} from '@/types/work-order.types'

const prisma = new PrismaClient()

export class WorkOrderRepository {
  /**
   * Get all work orders with optional filtering and pagination
   */
  static async findMany(
    filters?: WorkOrderFilters,
    pagination?: { page: number; limit: number },
    companyId?: string
  ): Promise<{ items: WorkOrderWithRelations[]; total: number }> {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 50
    const offset = (page - 1) * limit

    // Build where clause
    const whereClause: Prisma.WorkOrderWhereInput = {
      isActive: filters?.isActive ?? true
    }

    // Company filter
    if (companyId) {
      whereClause.companyId = companyId
    }

    // Apply additional filters
    if (filters) {
      if (filters.siteId) whereClause.siteId = filters.siteId
      if (filters.clientCompanyId) {
        whereClause.site = {
          clientCompanyId: filters.clientCompanyId
        }
      }
      if (filters.assetId) whereClause.assetId = filters.assetId
      if (filters.templateId) whereClause.templateId = filters.templateId
      if (filters.type) whereClause.type = filters.type
      if (filters.priority) whereClause.priority = filters.priority
      if (filters.status) whereClause.status = filters.status
      if (filters.createdByMe) whereClause.createdBy = filters.createdByMe.toString()
      
      // Date range filters
      if (filters.scheduledDateFrom || filters.scheduledDateTo) {
        whereClause.scheduledDate = {}
        if (filters.scheduledDateFrom) {
          whereClause.scheduledDate.gte = filters.scheduledDateFrom
        }
        if (filters.scheduledDateTo) {
          whereClause.scheduledDate.lte = filters.scheduledDateTo
        }
      }

      // Created at date range filters
      if (filters.createdAtFrom || filters.createdAtTo) {
        whereClause.createdAt = {}
        if (filters.createdAtFrom) {
          whereClause.createdAt.gte = filters.createdAtFrom
        }
        if (filters.createdAtTo) {
          whereClause.createdAt.lte = filters.createdAtTo
        }
      }

      // Assignment filter
      if (filters.assignedToMe) {
        const userId = typeof filters.assignedToMe === 'string' ? filters.assignedToMe : undefined
        if (userId) {
          whereClause.assignments = {
            some: {
              userId: userId
            }
          }
        }
      }

      // Search filter
      if (filters.search) {
        whereClause.OR = [
          { number: { contains: filters.search, mode: 'insensitive' } },
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { observations: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    }

    // Execute queries in parallel
    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              subdomain: true
            }
          },
          site: {
            select: {
              id: true,
              name: true,
              address: true,
              clientCompany: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          asset: {
            select: {
              id: true,
              name: true,
              code: true,
              manufacturer: true,
              model: true
            }
          },
          maintenanceComponent: {
            select: {
              id: true,
              name: true,
              partNumber: true,
              criticality: true,
              mtbf: true,
              lifeExpectancy: true,
              // Hybrid maintenance scheduling
              manufacturerMaintenanceInterval: true,
              manufacturerMaintenanceIntervalUnit: true,
              workOrderSchedule: {
                select: {
                  id: true,
                  name: true,
                  recurrenceType: true,
                  nextGenerationDate: true,
                  isActive: true,
                },
              },
            }
          },
          template: {
            select: {
              id: true,
              name: true,
              category: true,
              customFields: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  image: true
                }
              },
              assigner: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              assignments: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.workOrder.count({ where: whereClause })
    ])

    // Serialize dates to strings to match TypeScript interfaces
    const serializedWorkOrders = workOrders.map(workOrder => ({
      ...workOrder,
      scheduledDate: workOrder.scheduledDate?.toISOString() || null,
      startedAt: workOrder.startedAt?.toISOString() || null,
      completedAt: workOrder.completedAt?.toISOString() || null,
      deletedAt: workOrder.deletedAt?.toISOString() || null,
      createdAt: workOrder.createdAt.toISOString(),
      updatedAt: workOrder.updatedAt.toISOString(),
      assignments: workOrder.assignments?.map(assignment => ({
        ...assignment,
        assignedAt: assignment.assignedAt.toISOString()
      }))
    }))

    return { items: serializedWorkOrders as unknown as WorkOrderWithRelations[], total }
  }

  /**
   * Get work order by ID with relations
   */
  static async findById(id: string, companyId?: string): Promise<WorkOrderWithRelations | null> {
    const whereClause: Prisma.WorkOrderWhereInput = { id, isActive: true }
    if (companyId) {
      whereClause.companyId = companyId
    }

    const workOrder = await prisma.workOrder.findFirst({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            clientCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
            manufacturer: true,
            model: true,
            location: true,
            status: true
          }
        },
        maintenanceComponent: {
          select: {
            id: true,
            name: true,
            partNumber: true,
            criticality: true,
            mtbf: true,
            lifeExpectancy: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            customFields: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
              }
            },
            assigner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        maintenanceAlerts: {
          where: {
            status: 'RESOLVED'
          },
          select: {
            id: true,
            componentName: true,
            assetName: true,
            partNumber: true,
            severity: true,
            message: true,
            createdAt: true,
            resolvedAt: true,
            resolutionNotes: true,
            resolvedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      }
    })

    if (!workOrder) return null

    // Serialize dates to strings to match TypeScript interfaces
    return {
      ...workOrder,
      scheduledDate: workOrder.scheduledDate?.toISOString() || null,
      startedAt: workOrder.startedAt?.toISOString() || null,
      completedAt: workOrder.completedAt?.toISOString() || null,
      deletedAt: workOrder.deletedAt?.toISOString() || null,
      createdAt: workOrder.createdAt.toISOString(),
      updatedAt: workOrder.updatedAt.toISOString(),
      assignments: workOrder.assignments?.map(assignment => ({
        ...assignment,
        assignedAt: assignment.assignedAt.toISOString()
      })),
      maintenanceAlerts: workOrder.maintenanceAlerts?.map(alert => ({
        ...alert,
        createdAt: alert.createdAt.toISOString(),
        resolvedAt: alert.resolvedAt?.toISOString() || null
      }))
    } as unknown as WorkOrderWithRelations
  }

  /**
   * Create new work order
   */
  static async create(data: Prisma.WorkOrderCreateInput): Promise<WorkOrderWithRelations> {
    const workOrder = await prisma.workOrder.create({
      data,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            clientCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
            manufacturer: true,
            model: true,
            location: true,
            status: true
          }
        },
        maintenanceComponent: {
          select: {
            id: true,
            name: true,
            partNumber: true,
            criticality: true,
            mtbf: true,
            lifeExpectancy: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            customFields: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
              }
            },
            assigner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      }
    })

    // Serialize dates to strings to match TypeScript interfaces
    return {
      ...workOrder,
      scheduledDate: workOrder.scheduledDate?.toISOString() || null,
      startedAt: workOrder.startedAt?.toISOString() || null,
      completedAt: workOrder.completedAt?.toISOString() || null,
      deletedAt: workOrder.deletedAt?.toISOString() || null,
      createdAt: workOrder.createdAt.toISOString(),
      updatedAt: workOrder.updatedAt.toISOString(),
      assignments: workOrder.assignments?.map(assignment => ({
        ...assignment,
        assignedAt: assignment.assignedAt.toISOString()
      }))
    } as unknown as WorkOrderWithRelations
  }

  /**
   * Update work order
   */
  static async update(id: string, data: Prisma.WorkOrderUpdateInput): Promise<WorkOrderWithRelations | null> {
    const workOrder = await prisma.workOrder.update({
      where: { id },
      data,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        },
        site: {
          select: {
            id: true,
            name: true,
            address: true,
            clientCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
            manufacturer: true,
            model: true,
            location: true,
            status: true
          }
        },
        maintenanceComponent: {
          select: {
            id: true,
            name: true,
            partNumber: true,
            criticality: true,
            mtbf: true,
            lifeExpectancy: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            customFields: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
              }
            },
            assigner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      }
    })

    // Serialize dates to strings to match TypeScript interfaces
    return {
      ...workOrder,
      scheduledDate: workOrder.scheduledDate?.toISOString() || null,
      startedAt: workOrder.startedAt?.toISOString() || null,
      completedAt: workOrder.completedAt?.toISOString() || null,
      deletedAt: workOrder.deletedAt?.toISOString() || null,
      createdAt: workOrder.createdAt.toISOString(),
      updatedAt: workOrder.updatedAt.toISOString(),
      assignments: workOrder.assignments?.map(assignment => ({
        ...assignment,
        assignedAt: assignment.assignedAt.toISOString()
      }))
    } as unknown as WorkOrderWithRelations
  }

  /**
   * Soft delete work order
   */
  static async softDelete(id: string): Promise<WorkOrderWithRelations | null> {
    return await this.update(id, {
      isActive: false,
      deletedAt: new Date()
    })
  }

  /**
   * Generate next work order number for company
   * If prefixId is provided, generates format: {PREFIX}{####}
   * Otherwise, generates legacy format: YYYY0001
   */
  static async generateNumber(companyId: string, prefixId?: string | null): Promise<string> {
    // If prefix is provided, use prefix-based numbering
    if (prefixId) {
      // Get the prefix details
      const prefix = await prisma.workOrderPrefix.findUnique({
        where: { id: prefixId },
        select: { code: true }
      })

      if (!prefix) {
        throw new Error("Prefix not found")
      }

      // Get the last work order number for this prefix
      const lastWorkOrder = await prisma.workOrder.findFirst({
        where: {
          companyId,
          prefixId,
          number: {
            startsWith: prefix.code
          }
        },
        orderBy: {
          number: 'desc'
        },
        select: {
          number: true
        }
      })

      let nextNumber = 1
      if (lastWorkOrder) {
        // Extract the numeric part from the last number (format: PREFIX0001)
        const numericPart = lastWorkOrder.number.substring(prefix.code.length)
        nextNumber = parseInt(numericPart) + 1
      }

      // Format: PREFIX + zero-padded 4-digit number
      return `${prefix.code}${nextNumber.toString().padStart(4, '0')}`
    }

    // Legacy format without prefix: YYYY0001
    const currentYear = new Date().getFullYear()

    // Get the last work order number for this company in the current year (without prefix)
    const lastWorkOrder = await prisma.workOrder.findFirst({
      where: {
        companyId,
        prefixId: null,
        number: {
          startsWith: currentYear.toString()
        }
      },
      orderBy: {
        number: 'desc'
      },
      select: {
        number: true
      }
    })

    let nextNumber = 1
    if (lastWorkOrder) {
      // Extract the numeric part from the last number (format: YYYY0001)
      const numericPart = lastWorkOrder.number.substring(4)
      nextNumber = parseInt(numericPart) + 1
    }

    // Format: YYYY + zero-padded 4-digit number
    return `${currentYear}${nextNumber.toString().padStart(4, '0')}`
  }

  /**
   * Create work order assignments
   */
  static async createAssignments(
    workOrderId: string, 
    userIds: string[], 
    assignedBy: string
  ): Promise<WorkOrderAssignmentWithUser[]> {
    // First, remove existing assignments
    await prisma.workOrderAssignment.deleteMany({
      where: { workOrderId }
    })

    // Create new assignments
    const assignments = await Promise.all(
      userIds.map(userId =>
        prisma.workOrderAssignment.create({
          data: {
            workOrderId,
            userId,
            assignedBy
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            assigner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })
      )
    )

    // Serialize dates to strings to match TypeScript interfaces
    return assignments.map(assignment => ({
      ...assignment,
      assignedAt: assignment.assignedAt.toISOString()
    })) as unknown as WorkOrderAssignmentWithUser[]
  }

  /**
   * Get work orders assigned to a specific user
   */
  static async findByAssignedUser(
    userId: string,
    filters?: Omit<WorkOrderFilters, 'assignedToMe'>,
    pagination?: { page: number; limit: number }
  ): Promise<{ items: WorkOrderWithRelations[]; total: number }> {
    return await this.findMany(
      { ...filters, assignedToMe: userId },
      pagination,
      undefined // companyId will be applied through filters if needed
    )
  }

  /**
   * Get work order statistics
   */
  static async getStats(companyId: string, filters?: WorkOrderFilters) {
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true
    }

    // Apply additional filters
    if (filters) {
      if (filters.siteId) whereClause.siteId = filters.siteId
      if (filters.clientCompanyId) {
        whereClause.site = {
          clientCompanyId: filters.clientCompanyId
        }
      }
      if (filters.assetId) whereClause.assetId = filters.assetId
      if (filters.templateId) whereClause.templateId = filters.templateId
    }

    const [
      total,
      byStatus,
      byType,
      byPriority,
      overdue,
      dueToday,
      dueThisWeek
    ] = await Promise.all([
      // Total count
      prisma.workOrder.count({ where: whereClause }),
      
      // By status
      prisma.workOrder.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true
      }),
      
      // By type
      prisma.workOrder.groupBy({
        by: ['type'],
        where: whereClause,
        _count: true
      }),
      
      // By priority
      prisma.workOrder.groupBy({
        by: ['priority'],
        where: whereClause,
        _count: true
      }),
      
      // Overdue (scheduled date is past and not completed)
      prisma.workOrder.count({
        where: {
          ...whereClause,
          scheduledDate: {
            lt: new Date()
          },
          status: {
            notIn: ['COMPLETED', 'CANCELLED']
          }
        }
      }),
      
      // Due today
      prisma.workOrder.count({
        where: {
          ...whereClause,
          scheduledDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          },
          status: {
            notIn: ['COMPLETED', 'CANCELLED']
          }
        }
      }),
      
      // Due this week
      prisma.workOrder.count({
        where: {
          ...whereClause,
          scheduledDate: {
            gte: new Date(),
            lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          status: {
            notIn: ['COMPLETED', 'CANCELLED']
          }
        }
      })
    ])

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>),
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count
        return acc
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count
        return acc
      }, {} as Record<string, number>),
      overdue,
      dueToday,
      dueThisWeek
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(companyId: string, filters?: WorkOrderFilters) {
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true
    }

    // Apply additional filters
    if (filters) {
      if (filters.siteId) whereClause.siteId = filters.siteId
      if (filters.clientCompanyId) {
        whereClause.site = {
          clientCompanyId: filters.clientCompanyId
        }
      }
      if (filters.assetId) whereClause.assetId = filters.assetId
      if (filters.templateId) whereClause.templateId = filters.templateId

      // Created at date range filters
      if (filters.createdAtFrom || filters.createdAtTo) {
        whereClause.createdAt = {}
        if (filters.createdAtFrom) {
          whereClause.createdAt.gte = filters.createdAtFrom
        }
        if (filters.createdAtTo) {
          whereClause.createdAt.lte = filters.createdAtTo
        }
      }
    }

    const [
      total,
      inProgress,
      completed,
      pending,
      overdue,
      activeUsersCount,
      completedWorkOrders,
      plannedCount,
      unplannedCount
    ] = await Promise.all([
      // Total active work orders
      prisma.workOrder.count({ where: whereClause }),

      // In progress work orders
      prisma.workOrder.count({
        where: {
          ...whereClause,
          status: 'IN_PROGRESS'
        }
      }),

      // Completed work orders
      prisma.workOrder.count({
        where: {
          ...whereClause,
          status: 'COMPLETED'
        }
      }),

      // Pending work orders (DRAFT + ASSIGNED)
      prisma.workOrder.count({
        where: {
          ...whereClause,
          status: {
            in: ['DRAFT', 'ASSIGNED']
          }
        }
      }),

      // Overdue work orders
      prisma.workOrder.count({
        where: {
          ...whereClause,
          scheduledDate: {
            lt: new Date()
          },
          status: {
            notIn: ['COMPLETED', 'CANCELLED']
          }
        }
      }),

      // Active users (users with work order assignments)
      prisma.workOrderAssignment.groupBy({
        by: ['userId'],
        where: {
          workOrder: {
            companyId,
            isActive: true,
            status: {
              notIn: ['COMPLETED', 'CANCELLED']
            }
          }
        }
      }),

      // Completed work orders with times for avgCompletionTime calculation
      prisma.workOrder.findMany({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          startedAt: { not: null },
          completedAt: { not: null }
        },
        select: {
          startedAt: true,
          completedAt: true
        }
      }),

      // Planned maintenance count (PREVENTIVO)
      prisma.workOrder.count({
        where: {
          ...whereClause,
          type: 'PREVENTIVO'
        }
      }),

      // Unplanned maintenance count (CORRECTIVO + REPARACION)
      prisma.workOrder.count({
        where: {
          ...whereClause,
          type: {
            in: ['CORRECTIVO', 'REPARACION']
          }
        }
      })
    ])

    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // Calculate average completion time in hours
    let avgCompletionTime = 0
    if (completedWorkOrders.length > 0) {
      const totalCompletionTimeMs = completedWorkOrders.reduce((sum, wo) => {
        const start = new Date(wo.startedAt!).getTime()
        const end = new Date(wo.completedAt!).getTime()
        return sum + (end - start)
      }, 0)
      // Convert to hours and round to 1 decimal
      avgCompletionTime = Math.round((totalCompletionTimeMs / completedWorkOrders.length / (1000 * 60 * 60)) * 10) / 10
    }

    return {
      total,
      inProgress,
      completed,
      pending,
      overdue,
      completionRate,
      avgCompletionTime,
      activeUsers: activeUsersCount.length,
      plannedVsUnplanned: {
        planned: plannedCount,
        unplanned: unplannedCount
      }
    }
  }

  /**
   * Get recent work order activity
   */
  static async getRecentActivity(companyId: string, limit: number = 10, filters?: WorkOrderFilters) {
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      OR: [
        { startedAt: { not: null } },
        { completedAt: { not: null } },
        { assignments: { some: {} } }
      ]
    }

    // Apply date filters
    if (filters?.createdAtFrom || filters?.createdAtTo) {
      whereClause.createdAt = {}
      if (filters.createdAtFrom) {
        whereClause.createdAt.gte = filters.createdAtFrom
      }
      if (filters.createdAtTo) {
        whereClause.createdAt.lte = filters.createdAtTo
      }
    }

    const activities = await prisma.workOrder.findMany({
      where: whereClause,
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: { assignedAt: 'desc' }
        }
      },
      orderBy: [
        { completedAt: 'desc' },
        { startedAt: 'desc' },
        { updatedAt: 'desc' }
      ],
      take: limit
    })

    // Transform to activity format
    return activities.map(workOrder => {
      let activityType: "completed" | "started" | "assigned" | "overdue" = "assigned"
      let timestamp = workOrder.updatedAt
      let userName = "Sistema"

      // Get the assigned user (most recent assignment)
      const assignedUser = workOrder.assignments && workOrder.assignments.length > 0 
        ? workOrder.assignments[0].user.name 
        : "Sistema"

      if (workOrder.completedAt) {
        activityType = "completed"
        timestamp = new Date(workOrder.completedAt)
        // For completed orders, use the assigned user (the one who completed it)
        userName = assignedUser
      } else if (workOrder.startedAt) {
        activityType = "started" 
        timestamp = new Date(workOrder.startedAt)
        // For started orders, use the assigned user (the one who started it)
        userName = assignedUser
      } else if (workOrder.assignments && workOrder.assignments.length > 0) {
        activityType = "assigned"
        timestamp = new Date(workOrder.assignments[0].assignedAt)
        userName = workOrder.assignments[0].user.name
      }

      // Check if overdue
      if (workOrder.scheduledDate && 
          new Date(workOrder.scheduledDate) < new Date() && 
          workOrder.status !== 'COMPLETED' && 
          workOrder.status !== 'CANCELLED') {
        activityType = "overdue"
        // For overdue, still show the assigned user
        userName = assignedUser
      }

      return {
        id: workOrder.id,
        type: activityType,
        workOrderNumber: workOrder.number,
        workOrderTitle: workOrder.title,
        userName,
        timestamp
      }
    })
  }

  /**
   * Get performance metrics for the last 7 days
   */
  static async getPerformanceMetrics(companyId: string, days: number = 7, filters?: WorkOrderFilters) {
    // Use filters if provided, otherwise use default date range
    const endDate = filters?.createdAtTo || new Date()
    const startDate = filters?.createdAtFrom || (() => {
      const date = new Date()
      date.setDate(date.getDate() - days)
      return date
    })()

    // Get completion data for each day
    const dailyCompletions = await prisma.workOrder.groupBy({
      by: ['completedAt'],
      where: {
        companyId,
        isActive: true,
        completedAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      _count: true
    })

    // Get total work orders for efficiency calculation
    const totalWorkOrders = await prisma.workOrder.groupBy({
      by: ['createdAt'],
      where: {
        companyId,
        isActive: true,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    })

    // Create daily performance data
    const performanceData = []
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      // Count completions for this day
      const completed = dailyCompletions.filter(item => {
        if (!item.completedAt) return false
        const completedDate = new Date(item.completedAt)
        return completedDate >= dayStart && completedDate <= dayEnd
      }).reduce((sum, item) => sum + item._count, 0)

      // Count total created for efficiency calculation
      const created = totalWorkOrders.filter(item => {
        if (!item.createdAt) return false
        const createdDate = new Date(item.createdAt)
        return createdDate >= dayStart && createdDate <= dayEnd
      }).reduce((sum, item) => sum + item._count, 0)

      // Calculate efficiency (completed vs created, min 0%, max 100%)
      const efficiency = created > 0 ? Math.min(Math.round((completed / created) * 100), 100) : 0

      performanceData.push({
        date: dayNames[date.getDay()],
        completed,
        efficiency: efficiency || 0
      })
    }

    return performanceData
  }

  /**
   * Get upcoming scheduled work orders
   */
  static async getUpcomingWorkOrders(companyId: string, limit: number = 10, filters?: WorkOrderFilters) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Build where clause
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      scheduledDate: {
        gte: today
      },
      status: {
        in: ['DRAFT', 'ASSIGNED', 'IN_PROGRESS']
      }
    }

    // Apply additional filters
    if (filters) {
      if (filters.siteId) whereClause.siteId = filters.siteId
      if (filters.clientCompanyId) {
        whereClause.site = {
          clientCompanyId: filters.clientCompanyId
        }
      }
    }

    const upcomingWorkOrders = await prisma.workOrder.findMany({
      where: whereClause,
      include: {
        site: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      },
      take: limit
    })

    return upcomingWorkOrders
  }

  /**
   * Get critical work orders (URGENT and HIGH priority) with client company filter
   */
  static async getCriticalOrders(whereClause: Prisma.WorkOrderWhereInput, limit: number = 10) {
    const criticalOrders = await prisma.workOrder.findMany({
      where: {
        ...whereClause,
        priority: {
          in: ['URGENT', 'HIGH'],
        },
        status: {
          in: ['DRAFT', 'ASSIGNED', 'IN_PROGRESS'],
        },
        isActive: true,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledDate: 'asc' },
      ],
      take: limit,
    })

    return criticalOrders
  }

  /**
   * Get work orders for provider metrics calculation
   */
  static async getOrdersForProviderMetrics(whereClause: Prisma.WorkOrderWhereInput) {
    return await prisma.workOrder.findMany({
      where: {
        ...whereClause,
        status: {
          in: ['COMPLETED', 'IN_PROGRESS'],
        },
        isActive: true,
      },
      select: {
        id: true,
        status: true,
        scheduledDate: true,
        createdAt: true,
        updatedAt: true,
        assignments: {
          select: {
            assignedAt: true,
          },
          orderBy: {
            assignedAt: 'asc',
          },
          take: 1,
        },
      },
    })
  }

  /**
   * Get all work orders for site metrics calculation
   */
  static async getOrdersForSiteMetrics(whereClause: Prisma.WorkOrderWhereInput) {
    return await prisma.workOrder.findMany({
      where: {
        ...whereClause,
        isActive: true,
      },
      select: {
        id: true,
        status: true,
        scheduledDate: true,
        createdAt: true,
        updatedAt: true,
        site: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }
}