/**
 * Time Tracking Repository
 *
 * Data access layer for work order time tracking
 * Handles all database operations for time logs
 */

import { prisma } from "@/lib/prisma"
import type { TimeLogAction, PauseReason, Prisma } from "@prisma/client"
import type {
  WorkOrderTimeLog,
  WorkOrderTimeLogWithUser,
  TimeLogSummary,
} from "@/types/time-tracking.types"

export class TimeTrackingRepository {
  /**
   * Create a new time log entry
   */
  async createTimeLog(data: {
    workOrderId: string
    userId: string
    action: TimeLogAction
    pauseReason?: PauseReason
    timestamp?: Date
    latitude?: number
    longitude?: number
    notes?: string
  }): Promise<WorkOrderTimeLog> {
    // Calculate segment duration if there's a previous log
    const previousLog = await this.getLastTimeLog(data.workOrderId)
    let segmentDurationMinutes: number | null = null

    if (previousLog && data.timestamp) {
      const durationMs = data.timestamp.getTime() - previousLog.timestamp.getTime()
      segmentDurationMinutes = Math.round(durationMs / 60000) // Convert to minutes
    }

    const timestamp = data.timestamp || new Date()
    const isFirstStart = data.action === "START" && !previousLog

    // Use transaction to ensure atomic operation
    const timeLog = await prisma.$transaction(async (tx) => {
      // Create time log
      const log = await tx.workOrderTimeLog.create({
        data: {
          workOrderId: data.workOrderId,
          userId: data.userId,
          action: data.action,
          pauseReason: data.pauseReason || null,
          timestamp,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          notes: data.notes || null,
          segmentDurationMinutes,
        },
      })

      // If this is the first START, update work order startedAt and status
      if (isFirstStart) {
        await tx.workOrder.update({
          where: { id: data.workOrderId },
          data: {
            startedAt: timestamp,
            status: "IN_PROGRESS",
            updatedAt: new Date(),
          },
        })
      }

      return log
    })

    return timeLog as WorkOrderTimeLog
  }

  /**
   * Get all time logs for a work order
   */
  async getTimeLogsByWorkOrder(
    workOrderId: string,
    options?: {
      includeUser?: boolean
      limit?: number
      offset?: number
    }
  ): Promise<WorkOrderTimeLog[] | WorkOrderTimeLogWithUser[]> {
    const include = options?.includeUser
      ? {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        }
      : undefined

    return (await prisma.workOrderTimeLog.findMany({
      where: { workOrderId },
      include,
      orderBy: { timestamp: "asc" },
      take: options?.limit,
      skip: options?.offset,
    })) as WorkOrderTimeLog[] | WorkOrderTimeLogWithUser[]
  }

  /**
   * Get time logs by user
   */
  async getTimeLogsByUser(
    userId: string,
    options?: {
      startDate?: Date
      endDate?: Date
      limit?: number
      offset?: number
    }
  ): Promise<WorkOrderTimeLog[]> {
    const where: Prisma.WorkOrderTimeLogWhereInput = {
      userId,
    }

    if (options?.startDate || options?.endDate) {
      where.timestamp = {}
      if (options.startDate) {
        where.timestamp.gte = options.startDate
      }
      if (options.endDate) {
        where.timestamp.lte = options.endDate
      }
    }

    return (await prisma.workOrderTimeLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: options?.limit,
      skip: options?.offset,
    })) as WorkOrderTimeLog[]
  }

  /**
   * Get the last time log for a work order
   */
  async getLastTimeLog(workOrderId: string): Promise<WorkOrderTimeLog | null> {
    const log = await prisma.workOrderTimeLog.findFirst({
      where: { workOrderId },
      orderBy: { timestamp: "desc" },
    })

    return log as WorkOrderTimeLog | null
  }

  /**
   * Get time log by ID
   */
  async getTimeLogById(id: string): Promise<WorkOrderTimeLog | null> {
    return (await prisma.workOrderTimeLog.findUnique({
      where: { id },
    })) as WorkOrderTimeLog | null
  }

  /**
   * Update a time log
   */
  async updateTimeLog(
    id: string,
    data: {
      notes?: string
      pauseReason?: PauseReason
    }
  ): Promise<WorkOrderTimeLog> {
    return (await prisma.workOrderTimeLog.update({
      where: { id },
      data: {
        notes: data.notes,
        pauseReason: data.pauseReason,
        updatedAt: new Date(),
      },
    })) as WorkOrderTimeLog
  }

  /**
   * Delete a time log (soft delete by marking as deleted)
   */
  async deleteTimeLog(id: string): Promise<WorkOrderTimeLog> {
    // In a real scenario, you might want to soft delete
    // For now, we'll just delete it
    return (await prisma.workOrderTimeLog.delete({
      where: { id },
    })) as WorkOrderTimeLog
  }

  /**
   * Calculate time summary for a work order
   *
   * @param workOrderId - The work order ID
   * @param completedAt - Optional completion timestamp from work order record (used when order is completed but has no COMPLETE log)
   */
  async getTimeSummary(workOrderId: string, completedAt?: Date | null): Promise<TimeLogSummary> {
    const logs = await this.getTimeLogsByWorkOrder(workOrderId)

    if (logs.length === 0) {
      return {
        workOrderId,
        totalElapsedMinutes: 0,
        activeWorkMinutes: 0,
        pausedMinutes: 0,
        currentStatus: "NOT_STARTED",
        lastAction: null,
        lastActionTimestamp: null,
        pauseBreakdown: [],
      }
    }

    const lastLog = logs[logs.length - 1] as WorkOrderTimeLog
    let totalElapsedMinutes = 0
    let activeWorkMinutes = 0
    let pausedMinutes = 0
    const pauseBreakdown: Record<PauseReason, number> = {} as Record<PauseReason, number>

    // Determine end time for calculations:
    // 1. If there's a COMPLETE log, use its timestamp
    // 2. If order is completed but no COMPLETE log, use completedAt
    // 3. Otherwise, use current time (ongoing work)
    const endTime = lastLog.action === "COMPLETE"
      ? lastLog.timestamp
      : (completedAt ? new Date(completedAt) : new Date())

    // Calculate times based on logs
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i] as WorkOrderTimeLog
      const nextLog = logs[i + 1] as WorkOrderTimeLog | undefined

      if (nextLog) {
        // Calculate segment duration with second precision (use decimals, not round)
        const segmentMs = nextLog.timestamp.getTime() - log.timestamp.getTime()
        const segmentMinutes = segmentMs / 60000

        // If current action is START or RESUME, it's active work time
        if (log.action === "START" || log.action === "RESUME") {
          activeWorkMinutes += segmentMinutes
        }
        // If current action is PAUSE, it's paused time
        else if (log.action === "PAUSE") {
          pausedMinutes += segmentMinutes
          if (log.pauseReason) {
            pauseBreakdown[log.pauseReason] =
              (pauseBreakdown[log.pauseReason] || 0) + segmentMinutes
          }
        }
      } else {
        // Last log - calculate time from this log to endTime
        if (log.action === "START" || log.action === "RESUME") {
          const elapsedMs = endTime.getTime() - log.timestamp.getTime()
          const elapsedMinutes = elapsedMs / 60000
          activeWorkMinutes += elapsedMinutes
        } else if (log.action === "PAUSE") {
          const elapsedMs = endTime.getTime() - log.timestamp.getTime()
          const elapsedMinutes = elapsedMs / 60000
          pausedMinutes += elapsedMinutes
          if (log.pauseReason) {
            pauseBreakdown[log.pauseReason] =
              (pauseBreakdown[log.pauseReason] || 0) + elapsedMinutes
          }
        }
      }
    }

    // Calculate total elapsed time from first log to endTime
    const firstLog = logs[0] as WorkOrderTimeLog
    const totalMs = endTime.getTime() - firstLog.timestamp.getTime()
    totalElapsedMinutes = totalMs / 60000

    // Determine current status
    let currentStatus: TimeLogSummary["currentStatus"]
    if (lastLog.action === "COMPLETE" || completedAt) {
      currentStatus = "COMPLETED"
    } else if (lastLog.action === "PAUSE") {
      currentStatus = "PAUSED"
    } else if (lastLog.action === "START" || lastLog.action === "RESUME") {
      currentStatus = "WORKING"
    } else {
      currentStatus = "NOT_STARTED"
    }

    return {
      workOrderId,
      totalElapsedMinutes,
      activeWorkMinutes,
      pausedMinutes,
      currentStatus,
      lastAction: lastLog.action,
      lastActionTimestamp: lastLog.timestamp,
      pauseBreakdown: Object.entries(pauseBreakdown).map(([reason, minutes]) => ({
        reason: reason as PauseReason,
        minutes,
      })),
    }
  }

  /**
   * Calculate production line downtime cost
   * Only applies if asset is part of a production line
   */
  async calculateDowntimeCost(workOrderId: string): Promise<number> {
    // Get work order with asset and production line information
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: {
        assetId: true,
        startedAt: true,
        completedAt: true,
        asset: {
          select: {
            productionLineAssets: {
              select: {
                productionLine: {
                  select: {
                    unitPrice: true,
                    flowConfiguration: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // No downtime cost if no asset, no production line, or missing time data
    if (
      !workOrder?.assetId ||
      !workOrder.asset?.productionLineAssets?.[0]?.productionLine ||
      !workOrder.startedAt ||
      !workOrder.completedAt
    ) {
      return 0
    }

    const productionLine = workOrder.asset.productionLineAssets[0].productionLine
    const unitPrice = productionLine.unitPrice

    // No cost calculation if no unit price set
    if (!unitPrice) {
      return 0
    }

    // Calculate downtime hours
    const downtimeMs =
      workOrder.completedAt.getTime() - workOrder.startedAt.getTime()
    const downtimeHours = downtimeMs / (1000 * 60 * 60)

    // Get production line configuration to calculate throughput
    const flowConfig = productionLine.flowConfiguration as {
      nodes?: Array<{ data?: { cycleTime?: number } }>
    } | null

    let theoreticalThroughput = 0

    if (flowConfig?.nodes && Array.isArray(flowConfig.nodes)) {
      // Find bottleneck (highest cycle time)
      const bottleneckCycleTime = flowConfig.nodes.reduce((max, node) => {
        const cycleTime = node.data?.cycleTime || 0
        return Math.max(max, cycleTime)
      }, 0)

      // Calculate throughput: 3600 seconds / cycle time = units per hour
      if (bottleneckCycleTime > 0) {
        theoreticalThroughput = 3600 / bottleneckCycleTime
      }
    }

    // Calculate downtime cost: hours × (unitPrice × throughput)
    const costPerHour = unitPrice * theoreticalThroughput
    const downtimeCost = downtimeHours * costPerHour

    return downtimeCost
  }

  /**
   * Calculate actual cost for a work order
   * Cost = Labor Cost + Parts Cost + Other Costs + Downtime Cost
   */
  async calculateActualCost(workOrderId: string): Promise<{
    laborCost: number
    partsCost: number
    otherCosts: number
    downtimeCost: number
    totalCost: number
  }> {
    const DEFAULT_HOURLY_RATE = 20.0 // Default rate in CRC per hour

    // 1. Get time summary for labor cost calculation
    const summary = await this.getTimeSummary(workOrderId)
    const hours = summary.activeWorkMinutes / 60

    // 2. Get user's hourly rate (from first time log to get the technician)
    const firstLog = await prisma.workOrderTimeLog.findFirst({
      where: { workOrderId },
      orderBy: { timestamp: "asc" },
      include: {
        user: {
          select: {
            hourlyRate: true,
          },
        },
      },
    })

    const hourlyRate = firstLog?.user?.hourlyRate
      ? Number(firstLog.user.hourlyRate)
      : DEFAULT_HOURLY_RATE

    const laborCost = hours * hourlyRate

    // 3. Calculate parts cost from delivered inventory requests
    const inventoryRequests = await prisma.workOrderInventoryRequest.findMany({
      where: {
        workOrderId,
        status: "DELIVERED", // Only delivered items
      },
      include: {
        inventoryItem: {
          select: {
            unitCost: true,
          },
        },
      },
    })

    const partsCost = inventoryRequests.reduce((sum, request) => {
      const quantity = request.quantityDelivered
      const unitCost = request.inventoryItem.unitCost || 0
      return sum + quantity * unitCost
    }, 0)

    // 4. Get manual other costs (already saved in work order)
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: { otherCosts: true },
    })

    const otherCosts = workOrder?.otherCosts || 0

    // 5. Calculate production line downtime cost
    const downtimeCost = await this.calculateDowntimeCost(workOrderId)

    // 6. Calculate total
    const totalCost = laborCost + partsCost + otherCosts + downtimeCost

    return {
      laborCost,
      partsCost,
      otherCosts,
      downtimeCost,
      totalCost,
    }
  }

  /**
   * Update work order time metrics
   * Call this when completing a work order to update the calculated fields
   */
  async updateWorkOrderTimeMetrics(workOrderId: string): Promise<void> {
    const summary = await this.getTimeSummary(workOrderId)

    // Calculate costs automatically
    const costs = await this.calculateActualCost(workOrderId)

    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        actualDuration: summary.totalElapsedMinutes,
        activeWorkTime: summary.activeWorkMinutes,
        waitingTime: summary.pausedMinutes,
        // Auto-calculated costs
        laborCost: costs.laborCost,
        partsCost: costs.partsCost,
        downtimeCost: costs.downtimeCost,
        actualCost: costs.totalCost,
        // Status
        status: "COMPLETED",
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Get time logs for multiple work orders (batch)
   */
  async getTimeLogsBatch(
    workOrderIds: string[]
  ): Promise<Map<string, WorkOrderTimeLog[]>> {
    const logs = (await prisma.workOrderTimeLog.findMany({
      where: {
        workOrderId: { in: workOrderIds },
      },
      orderBy: { timestamp: "asc" },
    })) as WorkOrderTimeLog[]

    // Group by work order ID
    const grouped = new Map<string, WorkOrderTimeLog[]>()
    for (const log of logs) {
      const existing = grouped.get(log.workOrderId) || []
      existing.push(log)
      grouped.set(log.workOrderId, existing)
    }

    return grouped
  }

  /**
   * Get count of time logs for a work order
   */
  async getTimeLogsCount(workOrderId: string): Promise<number> {
    return await prisma.workOrderTimeLog.count({
      where: { workOrderId },
    })
  }

  /**
   * Check if work order has any time logs
   */
  async hasTimeLogs(workOrderId: string): Promise<boolean> {
    const count = await this.getTimeLogsCount(workOrderId)
    return count > 0
  }

  /**
   * Get active work orders (currently being worked on)
   */
  async getActiveWorkOrders(userId?: string): Promise<string[]> {
    const where: Prisma.WorkOrderTimeLogWhereInput = {
      action: {
        in: ["START", "RESUME"] as TimeLogAction[],
      },
    }

    if (userId) {
      where.userId = userId
    }

    // Get latest logs grouped by work order
    const logs = await prisma.workOrderTimeLog.groupBy({
      by: ["workOrderId"],
      where,
      _max: {
        timestamp: true,
      },
    })

    // Filter to only those that don't have a PAUSE or COMPLETE after
    const activeWorkOrderIds: string[] = []

    for (const group of logs) {
      const lastLog = await this.getLastTimeLog(group.workOrderId)
      if (
        lastLog &&
        (lastLog.action === "START" || lastLog.action === "RESUME")
      ) {
        activeWorkOrderIds.push(group.workOrderId)
      }
    }

    return activeWorkOrderIds
  }
}
