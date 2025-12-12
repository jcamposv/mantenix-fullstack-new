import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Repository for WorkOrderSchedule data access operations
 * Handles direct database interactions for preventive maintenance scheduling
 */
export class WorkOrderScheduleRepository {

  /**
   * Include relations for schedule queries
   */
  static getIncludeRelations(): Prisma.WorkOrderScheduleInclude {
    return {
      company: {
        select: {
          id: true,
          name: true,
          subdomain: true
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
      template: {
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          status: true
        }
      },
      asset: {
        select: {
          id: true,
          name: true,
          code: true,
          category: true,
          status: true
        }
      },
      site: {
        select: {
          id: true,
          name: true,
          address: true
        }
      },
      _count: {
        select: {
          generatedWorkOrders: true
        }
      }
    }
  }

  /**
   * Find schedule by ID with relations
   */
  static async findById(id: string) {
    return await prisma.workOrderSchedule.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    })
  }

  /**
   * Find first schedule matching conditions
   */
  static async findFirst(whereClause: Prisma.WorkOrderScheduleWhereInput) {
    return await prisma.workOrderSchedule.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    })
  }

  /**
   * Find multiple schedules with pagination
   */
  static async findMany(
    whereClause: Prisma.WorkOrderScheduleWhereInput,
    page: number,
    limit: number,
    orderBy?: Prisma.WorkOrderScheduleOrderByWithRelationInput
  ) {
    const skip = (page - 1) * limit

    const [schedules, total] = await Promise.all([
      prisma.workOrderSchedule.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: orderBy ?? { createdAt: 'desc' }
      }),
      prisma.workOrderSchedule.count({ where: whereClause })
    ])

    return { items: schedules, total }
  }

  /**
   * Find all schedules without pagination
   */
  static async findAll(
    whereClause: Prisma.WorkOrderScheduleWhereInput,
    orderBy?: Prisma.WorkOrderScheduleOrderByWithRelationInput
  ) {
    return await prisma.workOrderSchedule.findMany({
      where: whereClause,
      include: this.getIncludeRelations(),
      orderBy: orderBy ?? { createdAt: 'desc' }
    })
  }

  /**
   * Create new schedule
   */
  static async create(scheduleData: Prisma.WorkOrderScheduleCreateInput) {
    return await prisma.workOrderSchedule.create({
      data: scheduleData,
      include: this.getIncludeRelations()
    })
  }

  /**
   * Update schedule
   */
  static async update(id: string, scheduleData: Prisma.WorkOrderScheduleUpdateInput) {
    return await prisma.workOrderSchedule.update({
      where: { id },
      data: scheduleData,
      include: this.getIncludeRelations()
    })
  }

  /**
   * Soft delete schedule (set isActive to false and deletedAt)
   */
  static async delete(id: string) {
    return await prisma.workOrderSchedule.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date()
      },
      include: this.getIncludeRelations()
    })
  }

  /**
   * Find all active schedules for a company
   */
  static async findByCompanyId(companyId: string, activeOnly: boolean = true) {
    const whereClause: Prisma.WorkOrderScheduleWhereInput = {
      companyId,
      deletedAt: null
    }

    if (activeOnly) {
      whereClause.isActive = true
    }

    return await this.findAll(whereClause, { nextGenerationDate: 'asc' })
  }

  /**
   * Find schedules due for generation (for cron job)
   * Returns schedules where nextGenerationDate <= now
   */
  static async findSchedulesDueForGeneration(beforeDate: Date = new Date()) {
    return await prisma.workOrderSchedule.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        nextGenerationDate: {
          lte: beforeDate
        },
        // Check recurrence end conditions
        OR: [
          // No end date
          { recurrenceEndType: 'NEVER' },
          // End by occurrences not reached yet
          {
            AND: [
              { recurrenceEndType: 'AFTER_OCCURRENCES' },
              {
                recurrenceEndValue: {
                  gt: prisma.workOrderSchedule.fields.totalGenerated
                }
              }
            ]
          },
          // End by date not reached yet
          {
            AND: [
              { recurrenceEndType: 'ON_DATE' },
              {
                recurrenceEndDate: {
                  gte: beforeDate
                }
              }
            ]
          }
        ]
      },
      include: this.getIncludeRelations(),
      orderBy: { nextGenerationDate: 'asc' }
    })
  }

  /**
   * Find schedules by asset
   */
  static async findByAssetId(assetId: string, activeOnly: boolean = true) {
    const whereClause: Prisma.WorkOrderScheduleWhereInput = {
      assetId,
      deletedAt: null
    }

    if (activeOnly) {
      whereClause.isActive = true
    }

    return await this.findAll(whereClause, { nextGenerationDate: 'asc' })
  }

  /**
   * Find schedules by site
   */
  static async findBySiteId(siteId: string, activeOnly: boolean = true) {
    const whereClause: Prisma.WorkOrderScheduleWhereInput = {
      siteId,
      deletedAt: null
    }

    if (activeOnly) {
      whereClause.isActive = true
    }

    return await this.findAll(whereClause, { nextGenerationDate: 'asc' })
  }

  /**
   * Find schedules by template
   */
  static async findByTemplateId(templateId: string, activeOnly: boolean = true) {
    const whereClause: Prisma.WorkOrderScheduleWhereInput = {
      templateId,
      deletedAt: null
    }

    if (activeOnly) {
      whereClause.isActive = true
    }

    return await this.findAll(whereClause)
  }

  /**
   * Find schedules by recurrence type
   */
  static async findByRecurrenceType(
    companyId: string,
    recurrenceType: Prisma.EnumRecurrenceTypeFilter,
    activeOnly: boolean = true
  ) {
    const whereClause: Prisma.WorkOrderScheduleWhereInput = {
      companyId,
      recurrenceType,
      deletedAt: null
    }

    if (activeOnly) {
      whereClause.isActive = true
    }

    return await this.findAll(whereClause, { nextGenerationDate: 'asc' })
  }

  /**
   * Find meter-based schedules that need reading updates
   */
  static async findMeterBasedSchedules(companyId: string) {
    return await this.findAll({
      companyId,
      recurrenceType: 'METER_BASED',
      isActive: true,
      deletedAt: null
    })
  }

  /**
   * Update meter reading for a schedule
   */
  static async updateMeterReading(id: string, newReading: number) {
    return await this.update(id, {
      currentMeterReading: newReading,
      updatedAt: new Date()
    })
  }

  /**
   * Increment statistics after work order generation
   */
  static async incrementGenerated(id: string) {
    return await prisma.workOrderSchedule.update({
      where: { id },
      data: {
        totalGenerated: { increment: 1 },
        lastGeneratedAt: new Date(),
        updatedAt: new Date()
      },
      include: this.getIncludeRelations()
    })
  }

  /**
   * Increment completed count and recalculate completion rate
   */
  static async incrementCompleted(id: string) {
    const schedule = await this.findById(id)
    if (!schedule) throw new Error("Schedule not found")

    const newTotalCompleted = schedule.totalCompleted + 1
    const newCompletionRate = schedule.totalGenerated > 0
      ? (newTotalCompleted / schedule.totalGenerated) * 100
      : 0

    return await prisma.workOrderSchedule.update({
      where: { id },
      data: {
        totalCompleted: newTotalCompleted,
        completionRate: newCompletionRate,
        updatedAt: new Date()
      },
      include: this.getIncludeRelations()
    })
  }

  /**
   * Increment skipped count
   */
  static async incrementSkipped(id: string) {
    return await prisma.workOrderSchedule.update({
      where: { id },
      data: {
        totalSkipped: { increment: 1 },
        updatedAt: new Date()
      },
      include: this.getIncludeRelations()
    })
  }

  /**
   * Get schedules with low completion rate (for alerts/monitoring)
   */
  static async findLowCompletionRateSchedules(
    companyId: string,
    threshold: number = 70,
    minGeneratedCount: number = 3
  ) {
    return await this.findAll({
      companyId,
      isActive: true,
      deletedAt: null,
      totalGenerated: { gte: minGeneratedCount },
      completionRate: { lt: threshold }
    }, { completionRate: 'asc' })
  }

  /**
   * Count schedules by recurrence type for a company
   */
  static async countByRecurrenceType(companyId: string) {
    const result = await prisma.workOrderSchedule.groupBy({
      by: ['recurrenceType'],
      where: {
        companyId,
        isActive: true,
        deletedAt: null
      },
      _count: {
        id: true
      }
    })

    return result.reduce((acc, item) => {
      acc[item.recurrenceType] = item._count.id
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Check if schedule name exists in the same company
   */
  static async checkNameExists(name: string, companyId: string, excludeId?: string): Promise<boolean> {
    const whereClause: Prisma.WorkOrderScheduleWhereInput = {
      name,
      companyId,
      deletedAt: null
    }

    if (excludeId) {
      whereClause.id = { not: excludeId }
    }

    const count = await prisma.workOrderSchedule.count({ where: whereClause })
    return count > 0
  }

  /**
   * Find schedule with minimal data for validation
   */
  static async findMinimal(id: string) {
    return await prisma.workOrderSchedule.findUnique({
      where: { id },
      select: {
        id: true,
        companyId: true,
        createdBy: true,
        isActive: true,
        templateId: true,
        assetId: true,
        siteId: true
      }
    })
  }

  /**
   * Get upcoming schedules for calendar view
   * Returns schedules with nextGenerationDate within specified date range
   */
  static async findUpcomingSchedules(
    companyId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.findAll({
      companyId,
      isActive: true,
      deletedAt: null,
      nextGenerationDate: {
        gte: startDate,
        lte: endDate
      }
    }, { nextGenerationDate: 'asc' })
  }
}
