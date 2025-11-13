import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Repository for Asset Status History data access
 * Handles tracking of asset status changes over time
 */
export class AssetStatusHistoryRepository {

  /**
   * Include relations for queries
   */
  private static getIncludeRelations(): Prisma.AssetStatusHistoryInclude {
    return {
      asset: {
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      },
      workOrder: {
        select: {
          id: true,
          number: true,
          title: true,
          status: true,
        }
      }
    }
  }

  /**
   * Create status change record
   */
  static async create(data: Prisma.AssetStatusHistoryCreateInput) {
    return await prisma.assetStatusHistory.create({
      data,
      include: this.getIncludeRelations()
    })
  }

  /**
   * Get current active status for an asset
   */
  static async getCurrentStatus(assetId: string) {
    return await prisma.assetStatusHistory.findFirst({
      where: {
        assetId,
        endedAt: null // Current active status
      },
      include: this.getIncludeRelations(),
      orderBy: { startedAt: 'desc' }
    })
  }

  /**
   * Close current status (set endedAt)
   */
  static async closeCurrentStatus(assetId: string, endedAt: Date = new Date()) {
    const currentStatus = await this.getCurrentStatus(assetId)

    if (currentStatus) {
      return await prisma.assetStatusHistory.update({
        where: { id: currentStatus.id },
        data: { endedAt }
      })
    }

    return null
  }

  /**
   * Get status history with pagination
   */
  static async findMany(
    whereClause: Prisma.AssetStatusHistoryWhereInput,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit

    const [history, total] = await Promise.all([
      prisma.assetStatusHistory.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' }
      }),
      prisma.assetStatusHistory.count({ where: whereClause })
    ])

    return { history, total }
  }

  /**
   * Get status history for availability calculation
   * Returns history within a date range
   */
  static async getHistoryForPeriod(
    assetId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await prisma.assetStatusHistory.findMany({
      where: {
        assetId,
        OR: [
          // Status started within period
          {
            startedAt: {
              gte: startDate,
              lte: endDate
            }
          },
          // Status ended within period
          {
            endedAt: {
              gte: startDate,
              lte: endDate
            }
          },
          // Status spans entire period (started before, ended after or still active)
          {
            AND: [
              { startedAt: { lte: startDate } },
              {
                OR: [
                  { endedAt: null },
                  { endedAt: { gte: endDate } }
                ]
              }
            ]
          }
        ]
      },
      orderBy: { startedAt: 'asc' }
    })
  }

  /**
   * Calculate uptime minutes for a period
   */
  static calculateUptimeMinutes(
    history: Prisma.AssetStatusHistoryGetPayload<Record<string, never>>[],
    startDate: Date,
    endDate: Date
  ): number {
    let uptimeMinutes = 0

    for (const record of history) {
      const periodStart = Math.max(record.startedAt.getTime(), startDate.getTime())
      const periodEnd = Math.min(
        record.endedAt?.getTime() || endDate.getTime(),
        endDate.getTime()
      )

      const durationMinutes = (periodEnd - periodStart) / (1000 * 60)

      if (record.status === 'OPERATIVO' && durationMinutes > 0) {
        uptimeMinutes += durationMinutes
      }
    }

    return uptimeMinutes
  }
}
