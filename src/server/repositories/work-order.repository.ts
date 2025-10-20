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
  ): Promise<{ workOrders: WorkOrderWithRelations[]; total: number }> {
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

    return { workOrders: serializedWorkOrders as unknown as WorkOrderWithRelations[], total }
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
            location: true
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
            location: true
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
            location: true
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
   */
  static async generateNumber(companyId: string): Promise<string> {
    const currentYear = new Date().getFullYear()
    
    // Get the last work order number for this company in the current year
    const lastWorkOrder = await prisma.workOrder.findFirst({
      where: {
        companyId,
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
  ): Promise<{ workOrders: WorkOrderWithRelations[]; total: number }> {
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
}