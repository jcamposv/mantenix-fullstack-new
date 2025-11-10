/**
 * WorkOrderSchedule Service
 * Handles preventive maintenance scheduling, recurrence logic, and automatic work order generation
 */

import { Prisma, RecurrenceType, RecurrenceEndType, WorkOrderStatus } from "@prisma/client"
import { WorkOrderScheduleRepository } from "@/server/repositories/work-order-schedule.repository"
import { WorkOrderRepository } from "@/server/repositories/work-order.repository"
import type { AuthenticatedSession } from "@/types/auth.types"

// ============================================================================
// Type Definitions
// ============================================================================

export interface CreateScheduleInput {
  name: string
  description?: string
  recurrenceType: RecurrenceType
  recurrenceInterval: number
  recurrenceEndType: RecurrenceEndType
  recurrenceEndValue?: number
  recurrenceEndDate?: Date
  weekDays?: number[] // For WEEKLY: [0=Sunday, 1=Monday, ..., 6=Saturday]
  meterType?: string
  meterThreshold?: number
  templateId: string
  assetId?: string
  siteId?: string
  assignedUserIds?: string[]
  startDate?: Date
}

export interface UpdateScheduleInput extends Partial<CreateScheduleInput> {
  id: string
  isActive?: boolean
  nextGenerationDate?: Date
}

export interface ScheduleFilters {
  recurrenceType?: RecurrenceType
  assetId?: string
  siteId?: string
  templateId?: string
  isActive?: boolean
  search?: string
}

// ============================================================================
// WorkOrderSchedule Service
// ============================================================================

export class WorkOrderScheduleService {

  // ==========================================================================
  // CRUD Operations
  // ==========================================================================

  /**
   * Get schedule by ID
   */
  static async getScheduleById(session: AuthenticatedSession, id: string) {
    if (!session?.user?.companyId) {
      throw new Error("Usuario no tiene una empresa asignada")
    }

    const schedule = await WorkOrderScheduleRepository.findById(id)

    if (!schedule) {
      throw new Error("Programación no encontrada")
    }

    // Verify company ownership
    if (schedule.companyId !== session.user.companyId) {
      throw new Error("No tienes permisos para ver esta programación")
    }

    return schedule
  }

  /**
   * Get all schedules for a company with filters
   */
  static async getSchedules(
    session: AuthenticatedSession,
    filters?: ScheduleFilters,
    pagination?: { page: number; limit: number }
  ) {
    if (!session?.user?.companyId) {
      throw new Error("Usuario no tiene una empresa asignada")
    }

    const whereClause: Prisma.WorkOrderScheduleWhereInput = {
      companyId: session.user.companyId,
      deletedAt: null
    }

    // Apply filters
    if (filters?.recurrenceType) {
      whereClause.recurrenceType = filters.recurrenceType
    }

    if (filters?.assetId) {
      whereClause.assetId = filters.assetId
    }

    if (filters?.siteId) {
      whereClause.siteId = filters.siteId
    }

    if (filters?.templateId) {
      whereClause.templateId = filters.templateId
    }

    if (filters?.isActive !== undefined) {
      whereClause.isActive = filters.isActive
    }

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (pagination) {
      return await WorkOrderScheduleRepository.findMany(
        whereClause,
        pagination.page,
        pagination.limit
      )
    }

    const schedules = await WorkOrderScheduleRepository.findAll(whereClause)
    return { schedules, total: schedules.length }
  }

  /**
   * Create new schedule
   */
  static async createSchedule(
    session: AuthenticatedSession,
    input: CreateScheduleInput
  ) {
    if (!session?.user?.companyId) {
      throw new Error("Usuario no tiene una empresa asignada")
    }

    // Check if name already exists
    const nameExists = await WorkOrderScheduleRepository.checkNameExists(
      input.name,
      session.user.companyId
    )

    if (nameExists) {
      throw new Error("Ya existe una programación con ese nombre")
    }

    // Validate recurrence configuration
    this.validateRecurrenceConfig(input)

    // Use startDate as the first generation date
    // When creating a new schedule, the first work order should be generated ON the start date,
    // not AFTER applying the recurrence interval
    const nextGenerationDate = input.startDate ?? new Date()

    // Create schedule
    const scheduleData: Prisma.WorkOrderScheduleCreateInput = {
      name: input.name,
      description: input.description,
      recurrenceType: input.recurrenceType,
      recurrenceInterval: input.recurrenceInterval,
      recurrenceEndType: input.recurrenceEndType,
      recurrenceEndValue: input.recurrenceEndValue,
      recurrenceEndDate: input.recurrenceEndDate,
      weekDays: input.weekDays ?? [],
      meterType: input.meterType as any,
      meterThreshold: input.meterThreshold,
      nextGenerationDate,
      assignedUserIds: input.assignedUserIds ?? [],
      company: { connect: { id: session.user.companyId } },
      creator: { connect: { id: session.user.id } },
      template: { connect: { id: input.templateId } }
    }

    // Connect optional relations
    if (input.assetId) {
      scheduleData.asset = { connect: { id: input.assetId } }
    }

    if (input.siteId) {
      scheduleData.site = { connect: { id: input.siteId } }
    }

    return await WorkOrderScheduleRepository.create(scheduleData)
  }

  /**
   * Update schedule
   */
  static async updateSchedule(
    session: AuthenticatedSession,
    input: UpdateScheduleInput
  ) {
    const schedule = await this.getScheduleById(session, input.id)

    // Check name uniqueness if name is being changed
    if (input.name && input.name !== schedule.name) {
      const nameExists = await WorkOrderScheduleRepository.checkNameExists(
        input.name,
        session.user.companyId,
        input.id
      )

      if (nameExists) {
        throw new Error("Ya existe una programación con ese nombre")
      }
    }

    // Validate recurrence if being updated
    if (input.recurrenceType || input.recurrenceInterval || input.weekDays) {
      this.validateRecurrenceConfig({
        ...schedule,
        ...input
      } as CreateScheduleInput)
    }

    const updateData: Prisma.WorkOrderScheduleUpdateInput = {}

    // Update basic fields
    if (input.name) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.isActive !== undefined) updateData.isActive = input.isActive

    // Update recurrence configuration
    if (input.recurrenceType) updateData.recurrenceType = input.recurrenceType
    if (input.recurrenceInterval) updateData.recurrenceInterval = input.recurrenceInterval
    if (input.recurrenceEndType) updateData.recurrenceEndType = input.recurrenceEndType
    if (input.recurrenceEndValue !== undefined) updateData.recurrenceEndValue = input.recurrenceEndValue
    if (input.recurrenceEndDate !== undefined) updateData.recurrenceEndDate = input.recurrenceEndDate
    if (input.weekDays) updateData.weekDays = input.weekDays

    // Update meter configuration
    if (input.meterType !== undefined) updateData.meterType = input.meterType as any
    if (input.meterThreshold !== undefined) updateData.meterThreshold = input.meterThreshold

    // Update assignments
    if (input.assignedUserIds) updateData.assignedUserIds = input.assignedUserIds

    // Update next generation date (for drag and drop)
    if (input.nextGenerationDate !== undefined) {
      updateData.nextGenerationDate = input.nextGenerationDate
    }

    // Update relations
    if (input.templateId) updateData.template = { connect: { id: input.templateId } }
    if (input.assetId !== undefined) {
      updateData.asset = input.assetId ? { connect: { id: input.assetId } } : { disconnect: true }
    }
    if (input.siteId !== undefined) {
      updateData.site = input.siteId ? { connect: { id: input.siteId } } : { disconnect: true }
    }

    // Recalculate next generation date if recurrence changed (but not if manually set)
    if (!input.nextGenerationDate && (input.recurrenceType || input.recurrenceInterval || input.weekDays)) {
      const recurrenceType = input.recurrenceType ?? schedule.recurrenceType
      const recurrenceInterval = input.recurrenceInterval ?? schedule.recurrenceInterval
      const weekDays = input.weekDays ?? schedule.weekDays

      updateData.nextGenerationDate = this.calculateNextGenerationDate(
        schedule.lastGeneratedAt ?? new Date(),
        recurrenceType,
        recurrenceInterval,
        weekDays
      )
    }

    return await WorkOrderScheduleRepository.update(input.id, updateData)
  }

  /**
   * Delete schedule (soft delete)
   */
  static async deleteSchedule(session: AuthenticatedSession, id: string) {
    await this.getScheduleById(session, id) // Verify ownership
    return await WorkOrderScheduleRepository.delete(id)
  }

  // ==========================================================================
  // Recurrence Logic
  // ==========================================================================

  /**
   * Calculate next generation date based on recurrence type
   */
  static calculateNextGenerationDate(
    fromDate: Date,
    recurrenceType: RecurrenceType,
    interval: number = 1,
    weekDays?: number[]
  ): Date {
    const next = new Date(fromDate)

    switch (recurrenceType) {
      case 'DAILY':
        next.setDate(next.getDate() + interval)
        break

      case 'WEEKLY':
        if (weekDays && weekDays.length > 0) {
          // Find next occurrence on specified weekdays
          const currentDay = next.getDay()
          const sortedWeekDays = [...weekDays].sort((a, b) => a - b)

          // Find next weekday in current week
          let nextDay = sortedWeekDays.find(day => day > currentDay)

          if (nextDay !== undefined) {
            // Next occurrence is in the current week
            next.setDate(next.getDate() + (nextDay - currentDay))
          } else {
            // Next occurrence is in the next week
            const firstDay = sortedWeekDays[0]!
            const daysUntilNextWeek = 7 - currentDay + firstDay
            next.setDate(next.getDate() + daysUntilNextWeek)
          }
        } else {
          // Default: same day next week(s)
          next.setDate(next.getDate() + (7 * interval))
        }
        break

      case 'MONTHLY':
        next.setMonth(next.getMonth() + interval)
        break

      case 'YEARLY':
        next.setFullYear(next.getFullYear() + interval)
        break

      case 'METER_BASED':
        // For meter-based, next generation is determined by meter readings
        // Return far future date as placeholder
        next.setFullYear(next.getFullYear() + 10)
        break
    }

    return next
  }

  /**
   * Check if schedule has reached its recurrence end
   */
  static hasReachedEnd(
    schedule: {
      recurrenceEndType: RecurrenceEndType
      recurrenceEndValue?: number | null
      recurrenceEndDate?: Date | null
      totalGenerated: number
    }
  ): boolean {
    switch (schedule.recurrenceEndType) {
      case 'NEVER':
        return false

      case 'AFTER_OCCURRENCES':
        if (!schedule.recurrenceEndValue) return false
        return schedule.totalGenerated >= schedule.recurrenceEndValue

      case 'ON_DATE':
        if (!schedule.recurrenceEndDate) return false
        return new Date() >= new Date(schedule.recurrenceEndDate)

      default:
        return false
    }
  }

  /**
   * Validate recurrence configuration
   */
  private static validateRecurrenceConfig(input: CreateScheduleInput) {
    // Validate interval
    if (input.recurrenceInterval < 1) {
      throw new Error("El intervalo de recurrencia debe ser mayor a 0")
    }

    // Validate weekly configuration
    if (input.recurrenceType === 'WEEKLY' && input.weekDays) {
      if (input.weekDays.some(day => day < 0 || day > 6)) {
        throw new Error("Los días de la semana deben estar entre 0 (Domingo) y 6 (Sábado)")
      }
    }

    // Validate end configuration
    if (input.recurrenceEndType === 'AFTER_OCCURRENCES') {
      if (!input.recurrenceEndValue || input.recurrenceEndValue < 1) {
        throw new Error("Debe especificar el número de ocurrencias")
      }
    }

    if (input.recurrenceEndType === 'ON_DATE') {
      if (!input.recurrenceEndDate) {
        throw new Error("Debe especificar la fecha de fin")
      }
      if (new Date(input.recurrenceEndDate) <= new Date()) {
        throw new Error("La fecha de fin debe ser futura")
      }
    }

    // Validate meter-based configuration
    if (input.recurrenceType === 'METER_BASED') {
      if (!input.meterType) {
        throw new Error("Debe especificar el tipo de medidor")
      }
      if (!input.meterThreshold || input.meterThreshold <= 0) {
        throw new Error("Debe especificar el umbral del medidor")
      }
    }
  }

  // ==========================================================================
  // Work Order Generation
  // ==========================================================================

  /**
   * Generate work order from schedule
   */
  static async generateWorkOrderFromSchedule(scheduleId: string) {
    const schedule = await WorkOrderScheduleRepository.findById(scheduleId)

    if (!schedule) {
      throw new Error("Programación no encontrada")
    }

    // Check if schedule is active
    if (!schedule.isActive || schedule.deletedAt) {
      throw new Error("La programación no está activa")
    }

    // Check if has reached end
    if (this.hasReachedEnd(schedule)) {
      // Deactivate schedule
      await WorkOrderScheduleRepository.update(scheduleId, { isActive: false })
      throw new Error("La programación ha alcanzado su límite")
    }

    // Generate work order number
    const number = await WorkOrderRepository.generateNumber(
      schedule.companyId,
      schedule.siteId ?? undefined
    )

    // Create work order from template
    const workOrderData: Prisma.WorkOrderCreateInput = {
      number,
      title: `${schedule.template.name} - ${schedule.name}`,
      description: schedule.description ?? schedule.template.description,
      status: WorkOrderStatus.PENDING,
      isRecurring: true,
      assignedUserIds: schedule.assignedUserIds,
      company: { connect: { id: schedule.companyId } },
      createdBy: { connect: { id: schedule.createdBy } },
      schedule: { connect: { id: scheduleId } }
    }

    // Connect optional relations
    if (schedule.assetId) {
      workOrderData.asset = { connect: { id: schedule.assetId } }
    }

    if (schedule.siteId) {
      workOrderData.site = { connect: { id: schedule.siteId } }
    }

    // Create work order
    const workOrder = await WorkOrderRepository.create(workOrderData)

    // Update schedule statistics
    await WorkOrderScheduleRepository.incrementGenerated(scheduleId)

    // Calculate and set next generation date
    const nextDate = this.calculateNextGenerationDate(
      new Date(),
      schedule.recurrenceType,
      schedule.recurrenceInterval,
      schedule.weekDays
    )

    await WorkOrderScheduleRepository.update(scheduleId, {
      nextGenerationDate: nextDate
    })

    return workOrder
  }

  /**
   * Process all schedules due for generation (for cron job)
   */
  static async processDueSchedules() {
    const dueSchedules = await WorkOrderScheduleRepository.findSchedulesDueForGeneration()

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as { scheduleId: string; error: string }[]
    }

    for (const schedule of dueSchedules) {
      results.processed++

      try {
        await this.generateWorkOrderFromSchedule(schedule.id)
        results.succeeded++
      } catch (error) {
        results.failed++
        results.errors.push({
          scheduleId: schedule.id,
          error: error instanceof Error ? error.message : "Error desconocido"
        })
      }
    }

    return results
  }

  // ==========================================================================
  // Meter-Based Logic
  // ==========================================================================

  /**
   * Update meter reading and check if work order should be generated
   */
  static async updateMeterReading(
    session: AuthenticatedSession,
    scheduleId: string,
    newReading: number
  ) {
    const schedule = await this.getScheduleById(session, scheduleId)

    if (schedule.recurrenceType !== 'METER_BASED') {
      throw new Error("Esta programación no es basada en medidores")
    }

    // Update meter reading
    await WorkOrderScheduleRepository.updateMeterReading(scheduleId, newReading)

    // Check if threshold is reached
    if (schedule.meterThreshold && newReading >= schedule.meterThreshold) {
      // Generate work order
      await this.generateWorkOrderFromSchedule(scheduleId)

      // Reset meter reading
      await WorkOrderScheduleRepository.updateMeterReading(scheduleId, 0)

      return { workOrderGenerated: true }
    }

    return { workOrderGenerated: false }
  }

  // ==========================================================================
  // Statistics & Tracking
  // ==========================================================================

  /**
   * Handle work order completion (called by work order service)
   */
  static async handleWorkOrderCompletion(scheduleId: string) {
    await WorkOrderScheduleRepository.incrementCompleted(scheduleId)
  }

  /**
   * Handle work order skip (called by work order service)
   */
  static async handleWorkOrderSkip(scheduleId: string) {
    await WorkOrderScheduleRepository.incrementSkipped(scheduleId)
  }

  /**
   * Get schedules with low completion rate
   */
  static async getLowCompletionRateSchedules(
    session: AuthenticatedSession,
    threshold: number = 70
  ) {
    if (!session?.user?.companyId) {
      throw new Error("Usuario no tiene una empresa asignada")
    }

    return await WorkOrderScheduleRepository.findLowCompletionRateSchedules(
      session.user.companyId,
      threshold
    )
  }

  /**
   * Get upcoming schedules for calendar view
   */
  static async getUpcomingSchedules(
    session: AuthenticatedSession,
    startDate: Date,
    endDate: Date
  ) {
    if (!session?.user?.companyId) {
      throw new Error("Usuario no tiene una empresa asignada")
    }

    return await WorkOrderScheduleRepository.findUpcomingSchedules(
      session.user.companyId,
      startDate,
      endDate
    )
  }

  /**
   * Get schedule statistics by recurrence type
   */
  static async getScheduleStatsByRecurrenceType(session: AuthenticatedSession) {
    if (!session?.user?.companyId) {
      throw new Error("Usuario no tiene una empresa asignada")
    }

    return await WorkOrderScheduleRepository.countByRecurrenceType(
      session.user.companyId
    )
  }
}
