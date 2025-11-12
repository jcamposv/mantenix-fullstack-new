import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { CalendarFilters } from "@/types/calendar.types"

/**
 * Calendar Repository
 * Unified repository for fetching calendar events (schedules + work orders)
 * Follows Single Responsibility Principle - handles only data access
 */
export class CalendarRepository {
  /**
   * Get upcoming schedules within date range
   * Returns schedules that will generate work orders in the specified period
   */
  static async getSchedulesInRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters?: CalendarFilters
  ) {
    const whereClause: Prisma.WorkOrderScheduleWhereInput = {
      companyId,
      isActive: true,
      nextGenerationDate: {
        gte: startDate,
        lte: endDate,
      },
    }

    // Apply filters
    if (filters) {
      if (filters.assetIds.length > 0) {
        whereClause.assetId = { in: filters.assetIds }
      }
      if (filters.siteIds.length > 0) {
        whereClause.siteId = { in: filters.siteIds }
      }
    }

    return await prisma.workOrderSchedule.findMany({
      where: whereClause,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        site: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        nextGenerationDate: "asc",
      },
    })
  }

  /**
   * Get work orders within date range
   * Returns all work orders scheduled in the specified period
   */
  static async getWorkOrdersInRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
    filters?: CalendarFilters
  ) {
    const whereClause: Prisma.WorkOrderWhereInput = {
      companyId,
      isActive: true,
      scheduledDate: {
        gte: startDate,
        lte: endDate,
      },
    }

    // Apply filters
    if (filters) {
      if (filters.statuses.length > 0) {
        whereClause.status = { in: filters.statuses }
      } else if (!filters.showCompleted) {
        // If showCompleted is false and no status filter, exclude completed
        whereClause.status = { not: "COMPLETED" }
      }

      if (filters.priorities.length > 0) {
        whereClause.priority = { in: filters.priorities }
      }

      if (filters.assetIds.length > 0) {
        whereClause.assetId = { in: filters.assetIds }
      }

      if (filters.siteIds.length > 0) {
        whereClause.siteId = { in: filters.siteIds }
      }

      if (filters.assignedUserIds.length > 0) {
        whereClause.assignments = {
          some: {
            userId: { in: filters.assignedUserIds },
          },
        }
      }
    }

    return await prisma.workOrder.findMany({
      where: whereClause,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        site: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledDate: "asc",
      },
    })
  }

  /**
   * Get single schedule by ID for calendar details
   */
  static async getScheduleById(scheduleId: string, companyId: string) {
    return await prisma.workOrderSchedule.findFirst({
      where: {
        id: scheduleId,
        companyId,
        isActive: true,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            customFields: true,
          },
        },
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
            location: true,
          },
        },
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  /**
   * Get single work order by ID for calendar details
   */
  static async getWorkOrderById(workOrderId: string, companyId: string) {
    return await prisma.workOrder.findFirst({
      where: {
        id: workOrderId,
        companyId,
        isActive: true,
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
            location: true,
          },
        },
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
                image: true,
                role: true,
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  /**
   * Update schedule next generation date (for drag and drop)
   */
  static async updateScheduleDate(
    scheduleId: string,
    companyId: string,
    newDate: Date
  ) {
    return await prisma.workOrderSchedule.update({
      where: {
        id: scheduleId,
        companyId,
      },
      data: {
        nextGenerationDate: newDate,
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Update work order scheduled date (for drag and drop)
   */
  static async updateWorkOrderDate(
    workOrderId: string,
    companyId: string,
    newDate: Date
  ) {
    return await prisma.workOrder.update({
      where: {
        id: workOrderId,
        companyId,
      },
      data: {
        scheduledDate: newDate,
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Get calendar statistics for dashboard
   */
  static async getCalendarStats(
    companyId: string,
    startDate: Date,
    endDate: Date
  ) {
    const [totalSchedules, totalWorkOrders, overdueWorkOrders] = await Promise.all([
      // Total active schedules
      prisma.workOrderSchedule.count({
        where: {
          companyId,
          isActive: true,
          nextGenerationDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Total work orders in range
      prisma.workOrder.count({
        where: {
          companyId,
          isActive: true,
          scheduledDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),

      // Overdue work orders
      prisma.workOrder.count({
        where: {
          companyId,
          isActive: true,
          scheduledDate: {
            lt: new Date(),
          },
          status: {
            notIn: ["COMPLETED", "CANCELLED"],
          },
        },
      }),
    ])

    return {
      totalSchedules,
      totalWorkOrders,
      totalEvents: totalSchedules + totalWorkOrders,
      overdueWorkOrders,
    }
  }
}
