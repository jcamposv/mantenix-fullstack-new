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

    return await prisma.workOrderTimeLog.create({
      data: {
        workOrderId: data.workOrderId,
        userId: data.userId,
        action: data.action,
        pauseReason: data.pauseReason || null,
        timestamp: data.timestamp || new Date(),
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        notes: data.notes || null,
        segmentDurationMinutes,
      },
    }) as WorkOrderTimeLog
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
   */
  async getTimeSummary(workOrderId: string): Promise<TimeLogSummary> {
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
        // Last log - if it's an active state (START or RESUME), count time until now
        if (log.action === "START" || log.action === "RESUME") {
          const now = new Date()
          const elapsedMs = now.getTime() - log.timestamp.getTime()
          const elapsedMinutes = elapsedMs / 60000
          activeWorkMinutes += elapsedMinutes
        }
      }
    }

    // Calculate total elapsed time from first log to now (or last log if completed)
    const firstLog = logs[0] as WorkOrderTimeLog
    const endTime = lastLog.action === "COMPLETE" ? lastLog.timestamp : new Date()
    const totalMs = endTime.getTime() - firstLog.timestamp.getTime()
    totalElapsedMinutes = totalMs / 60000

    // Determine current status
    let currentStatus: TimeLogSummary["currentStatus"]
    if (lastLog.action === "COMPLETE") {
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
   * Update work order time metrics
   * Call this when completing a work order to update the calculated fields
   */
  async updateWorkOrderTimeMetrics(workOrderId: string): Promise<void> {
    const summary = await this.getTimeSummary(workOrderId)

    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        actualDuration: summary.totalElapsedMinutes,
        activeWorkTime: summary.activeWorkMinutes,
        waitingTime: summary.pausedMinutes,
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
