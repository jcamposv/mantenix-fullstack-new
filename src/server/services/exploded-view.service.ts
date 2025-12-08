/**
 * Exploded View Service
 *
 * Business logic service for exploded views and their components.
 * Orchestrates operations and enforces business rules.
 *
 * Following Next.js Expert standards:
 * - Service layer for business logic
 * - Permission checks using PermissionGuard
 * - Company context awareness
 * - Transaction support for complex operations
 */

import { Prisma, FrequencyUnit, RecurrenceType, RecurrenceEndType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { ExplodedViewRepository, ExplodedViewHotspotRepository } from "../repositories/exploded-view.repository"
import { ExplodedViewComponentRepository } from "../repositories/exploded-view-component.repository"
import { WorkOrderScheduleRepository } from "../repositories/work-order-schedule.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import { getCurrentCompanyId } from "@/lib/company-context"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  AssetExplodedViewWithRelations,
  ExplodedViewComponentWithRelations,
  ExplodedViewHotspotWithComponent,
  ExplodedViewFilters,
  ComponentFilters,
  PaginatedExplodedViewsResponse,
  PaginatedComponentsResponse,
  CreateExplodedViewData,
  UpdateExplodedViewData,
  CreateComponentData,
  UpdateComponentData,
  CreateHotspotData,
  UpdateHotspotData,
} from "@/types/exploded-view.types"

// ============================================================================
// HELPER FUNCTIONS FOR HYBRID MAINTENANCE SCHEDULING
// ============================================================================

/**
 * Calculate next generation date based on frequency interval and unit
 */
function calculateNextGenerationDate(
  interval: number,
  unit: FrequencyUnit,
  startFrom?: Date
): Date {
  const baseDate = startFrom || new Date()
  const nextDate = new Date(baseDate)

  switch (unit) {
    case 'HOURS':
      nextDate.setHours(nextDate.getHours() + interval)
      break
    case 'DAYS':
      nextDate.setDate(nextDate.getDate() + interval)
      break
    case 'WEEKS':
      nextDate.setDate(nextDate.getDate() + interval * 7)
      break
    case 'MONTHS':
      nextDate.setMonth(nextDate.getMonth() + interval)
      break
    case 'YEARS':
      nextDate.setFullYear(nextDate.getFullYear() + interval)
      break
  }

  return nextDate
}

/**
 * Map FrequencyUnit to RecurrenceType for WorkOrderSchedule
 */
function mapFrequencyToRecurrence(unit: FrequencyUnit): RecurrenceType {
  switch (unit) {
    case 'HOURS':
      return 'METER_BASED' // Hours are meter-based
    case 'DAYS':
      return 'DAILY'
    case 'WEEKS':
      return 'WEEKLY'
    case 'MONTHS':
      return 'MONTHLY'
    case 'YEARS':
      return 'YEARLY'
  }
}

export class ExplodedViewService {
  // ============================================================================
  // PRIVATE HELPER METHODS - HYBRID MAINTENANCE SCHEDULING
  // ============================================================================

  /**
   * Create maintenance schedule for a component
   * Uses WorkOrderScheduleRepository (following Repository pattern)
   */
  private static async createComponentSchedule(
    componentName: string,
    interval: number,
    intervalUnit: FrequencyUnit,
    templateId: string,
    companyId: string,
    userId: string
  ): Promise<string> {
    const recurrenceType = mapFrequencyToRecurrence(intervalUnit)
    const nextGenerationDate = calculateNextGenerationDate(interval, intervalUnit)

    const scheduleData: Prisma.WorkOrderScheduleCreateInput = {
      name: `Mantenimiento Programado: ${componentName}`,
      description: `Schedule automático generado para componente ${componentName}`,
      recurrenceType,
      recurrenceInterval: interval,
      recurrenceEndType: RecurrenceEndType.NEVER,
      meterType: intervalUnit === 'HOURS' ? 'HOURS_RUN' : null,
      meterThreshold: intervalUnit === 'HOURS' ? interval : null,
      template: { connect: { id: templateId } },
      company: { connect: { id: companyId } },
      creator: { connect: { id: userId } },
      nextGenerationDate,
      isActive: true,
    }

    const schedule = await WorkOrderScheduleRepository.create(scheduleData)
    return schedule.id
  }

  // ============================================================================
  // EXPLODED VIEWS
  // ============================================================================

  /**
   * Build WHERE clause for exploded views based on session and filters
   */
  static async buildViewWhereClause(
    session: AuthenticatedSession,
    viewId?: string,
    filters?: ExplodedViewFilters
  ): Promise<Prisma.AssetExplodedViewWhereInput> {
    const whereClause: Prisma.AssetExplodedViewWhereInput = viewId ? { id: viewId } : {}

    // Apply role-based access
    if (session.user.role === "SUPER_ADMIN") {
      // Super admin can see all views
    } else if (
      session.user.role === "ADMIN_EMPRESA" ||
      session.user.role === "ADMIN_GRUPO" ||
      session.user.role === "JEFE_MANTENIMIENTO" ||
      session.user.role === "SUPERVISOR"
    ) {
      const companyId = await getCurrentCompanyId(session)
      if (!companyId) {
        throw new Error("No se pudo determinar la empresa")
      }

      // Internal staff can see views for assets in their company
      whereClause.asset = {
        site: {
          clientCompany: {
            tenantCompanyId: companyId,
          },
        },
      }
    } else if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
      if (!session.user.clientCompanyId) {
        throw new Error("Usuario sin empresa cliente asociada")
      }
      whereClause.asset = {
        site: {
          clientCompanyId: session.user.clientCompanyId,
        },
      }
    } else if (session.user.role === "CLIENTE_ADMIN_SEDE") {
      if (!session.user.siteId) {
        throw new Error("Usuario sin sede asociada")
      }
      whereClause.asset = {
        siteId: session.user.siteId,
      }
    }

    // Apply filters
    if (filters) {
      if (filters.assetId) whereClause.assetId = filters.assetId
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ]
      }
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive
      }
    }

    // Default to active only
    if (whereClause.isActive === undefined) {
      whereClause.isActive = true
    }

    return whereClause
  }

  /**
   * Get exploded view by ID
   */
  static async getViewById(
    viewId: string,
    session: AuthenticatedSession
  ): Promise<AssetExplodedViewWithRelations | null> {
    await PermissionGuard.require(session, 'assets.view')
    const whereClause = await this.buildViewWhereClause(session, viewId)
    return await ExplodedViewRepository.findFirst(whereClause)
  }

  /**
   * Get paginated list of exploded views
   */
  static async getViewList(
    session: AuthenticatedSession,
    filters: ExplodedViewFilters,
    page: number,
    limit: number
  ): Promise<PaginatedExplodedViewsResponse> {
    await PermissionGuard.require(session, 'assets.view')
    const whereClause = await this.buildViewWhereClause(session, undefined, filters)
    const { items, total } = await ExplodedViewRepository.findMany(whereClause, page, limit)

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Create new exploded view
   */
  static async createView(
    data: CreateExplodedViewData,
    session: AuthenticatedSession
  ): Promise<AssetExplodedViewWithRelations> {
    await PermissionGuard.require(session, 'assets.edit')

    // Verify user has access to the asset
    const whereClause = await this.buildViewWhereClause(session)
    const asset = await prisma.asset.findFirst({
      where: { id: data.assetId, ...whereClause.asset },
    })

    if (!asset) {
      throw new Error("No tienes acceso a este activo")
    }

    const createData: Prisma.AssetExplodedViewCreateInput = {
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl,
      imageWidth: data.imageWidth,
      imageHeight: data.imageHeight,
      order: data.order || 0,
      asset: { connect: { id: data.assetId } },
      creator: { connect: { id: session.user.id } },
    }

    return await ExplodedViewRepository.create(createData)
  }

  /**
   * Update exploded view
   */
  static async updateView(
    viewId: string,
    data: UpdateExplodedViewData,
    session: AuthenticatedSession
  ): Promise<AssetExplodedViewWithRelations> {
    await PermissionGuard.require(session, 'assets.edit')

    // Verify access
    const view = await this.getViewById(viewId, session)
    if (!view) {
      throw new Error("Vista no encontrada o sin acceso")
    }

    const updateData: Prisma.AssetExplodedViewUpdateInput = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
    if (data.imageWidth !== undefined) updateData.imageWidth = data.imageWidth
    if (data.imageHeight !== undefined) updateData.imageHeight = data.imageHeight
    if (data.order !== undefined) updateData.order = data.order
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    return await ExplodedViewRepository.update(viewId, updateData)
  }

  /**
   * Delete exploded view (soft delete)
   */
  static async deleteView(
    viewId: string,
    session: AuthenticatedSession
  ): Promise<AssetExplodedViewWithRelations> {
    await PermissionGuard.require(session, 'assets.delete')

    // Verify access
    const view = await this.getViewById(viewId, session)
    if (!view) {
      throw new Error("Vista no encontrada o sin acceso")
    }

    return await ExplodedViewRepository.softDelete(viewId)
  }

  // ============================================================================
  // COMPONENTS
  // ============================================================================

  /**
   * Build WHERE clause for components based on session
   */
  static async buildComponentWhereClause(
    session: AuthenticatedSession,
    componentId?: string,
    filters?: ComponentFilters
  ): Promise<Prisma.ExplodedViewComponentWhereInput> {
    const whereClause: Prisma.ExplodedViewComponentWhereInput = componentId
      ? { id: componentId }
      : {}

    // Apply role-based access
    if (session.user.role === "SUPER_ADMIN") {
      // Super admin can see all components
    } else {
      const companyId = await getCurrentCompanyId(session)
      if (!companyId) {
        throw new Error("No se pudo determinar la empresa")
      }
      whereClause.companyId = companyId
    }

    // Apply filters
    if (filters) {
      if (filters.manufacturer) {
        whereClause.manufacturer = filters.manufacturer
      }
      if (filters.hasInventoryItem !== undefined) {
        whereClause.inventoryItemId = filters.hasInventoryItem ? { not: null } : null
      }
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { partNumber: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { manufacturer: { contains: filters.search, mode: 'insensitive' } },
        ]
      }
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive
      }
    }

    // Default to active only
    if (whereClause.isActive === undefined) {
      whereClause.isActive = true
    }

    return whereClause
  }

  /**
   * Get component by ID
   */
  static async getComponentById(
    componentId: string,
    session: AuthenticatedSession
  ): Promise<ExplodedViewComponentWithRelations | null> {
    const whereClause = await this.buildComponentWhereClause(session, componentId)
    return await ExplodedViewComponentRepository.findFirst(whereClause)
  }

  /**
   * Get paginated list of components
   */
  static async getComponentList(
    session: AuthenticatedSession,
    filters: ComponentFilters,
    page: number,
    limit: number
  ): Promise<PaginatedComponentsResponse> {
    const whereClause = await this.buildComponentWhereClause(session, undefined, filters)
    const { items, total } = await ExplodedViewComponentRepository.findMany(
      whereClause,
      page,
      limit
    )

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Create new component
   */
  static async createComponent(
    data: CreateComponentData,
    session: AuthenticatedSession
  ): Promise<ExplodedViewComponentWithRelations> {
    await PermissionGuard.require(session, 'assets.create')

    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    // Check for duplicate part number
    if (data.partNumber) {
      const existing = await ExplodedViewComponentRepository.findByPartNumber(
        companyId,
        data.partNumber
      )
      if (existing) {
        throw new Error(`Ya existe un componente con el número de parte ${data.partNumber}`)
      }
    }

    const createData: Prisma.ExplodedViewComponentCreateInput = {
      name: data.name,
      partNumber: data.partNumber || null,
      description: data.description || null,
      manufacturer: data.manufacturer || null,

      // Jerarquía ISO 14224
      hierarchyLevel: data.hierarchyLevel || 4,
      criticality: data.criticality || null,

      // Datos técnicos
      lifeExpectancy: data.lifeExpectancy || null,
      mtbf: data.mtbf || null,
      mttr: data.mttr || null,

      specifications: data.specifications !== undefined
        ? (data.specifications === null
            ? Prisma.JsonNull
            : (data.specifications as Prisma.InputJsonValue))
        : undefined,
      manualUrl: data.manualUrl || null,
      installationUrl: data.installationUrl || null,
      imageUrl: data.imageUrl || null,
      company: { connect: { id: companyId } },
      creator: { connect: { id: session.user.id } },
    }

    if (data.parentComponentId) {
      createData.parentComponent = { connect: { id: data.parentComponentId } }
    }

    if (data.inventoryItemId) {
      createData.inventoryItem = { connect: { id: data.inventoryItemId } }
    }

    // Mantenimiento programado híbrido - agregar campos
    if (data.manufacturerMaintenanceInterval !== undefined) {
      createData.manufacturerMaintenanceInterval = data.manufacturerMaintenanceInterval
    }
    if (data.manufacturerMaintenanceIntervalUnit !== undefined) {
      createData.manufacturerMaintenanceIntervalUnit = data.manufacturerMaintenanceIntervalUnit
    }
    if (data.mtbfAlertThreshold !== undefined) {
      createData.mtbfAlertThreshold = data.mtbfAlertThreshold
    }
    if (data.maintenanceStrategy !== undefined) {
      createData.maintenanceStrategy = data.maintenanceStrategy
    }
    if (data.autoCreateSchedule !== undefined) {
      createData.autoCreateSchedule = data.autoCreateSchedule
    }
    if (data.workOrderTemplateId) {
      createData.workOrderTemplate = { connect: { id: data.workOrderTemplateId } }
    }

    // Create component first
    const component = await ExplodedViewComponentRepository.create(createData)

    // Auto-create schedule if requested
    if (
      data.autoCreateSchedule &&
      data.manufacturerMaintenanceInterval &&
      data.manufacturerMaintenanceIntervalUnit &&
      data.workOrderTemplateId
    ) {
      // Use helper method following DRY principle
      const scheduleId = await this.createComponentSchedule(
        data.name,
        data.manufacturerMaintenanceInterval,
        data.manufacturerMaintenanceIntervalUnit,
        data.workOrderTemplateId,
        companyId,
        session.user.id
      )

      // Link schedule to component using Repository
      await ExplodedViewComponentRepository.update(component.id, {
        workOrderSchedule: { connect: { id: scheduleId } },
      })

      // Return updated component with schedule relation
      return (await ExplodedViewComponentRepository.findById(
        component.id
      )) as ExplodedViewComponentWithRelations
    }

    return component
  }

  /**
   * Update component
   */
  static async updateComponent(
    componentId: string,
    data: UpdateComponentData,
    session: AuthenticatedSession
  ): Promise<ExplodedViewComponentWithRelations> {
    await PermissionGuard.require(session, 'assets.edit')

    // Verify access
    const component = await this.getComponentById(componentId, session)
    if (!component) {
      throw new Error("Componente no encontrado o sin acceso")
    }

    // Check for duplicate part number
    if (data.partNumber) {
      const existing = await ExplodedViewComponentRepository.findByPartNumber(
        component.companyId,
        data.partNumber
      )
      if (existing && existing.id !== componentId) {
        throw new Error(`Ya existe un componente con el número de parte ${data.partNumber}`)
      }
    }

    const updateData: Prisma.ExplodedViewComponentUpdateInput = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.partNumber !== undefined) updateData.partNumber = data.partNumber
    if (data.description !== undefined) updateData.description = data.description
    if (data.manufacturer !== undefined) updateData.manufacturer = data.manufacturer

    // Jerarquía ISO 14224
    if (data.parentComponentId !== undefined) {
      updateData.parentComponent = data.parentComponentId
        ? { connect: { id: data.parentComponentId } }
        : { disconnect: true }
    }
    if (data.hierarchyLevel !== undefined) updateData.hierarchyLevel = data.hierarchyLevel
    if (data.criticality !== undefined) updateData.criticality = data.criticality

    // Datos técnicos
    if (data.lifeExpectancy !== undefined) updateData.lifeExpectancy = data.lifeExpectancy
    if (data.mtbf !== undefined) updateData.mtbf = data.mtbf
    if (data.mttr !== undefined) updateData.mttr = data.mttr

    if (data.specifications !== undefined) {
      updateData.specifications = data.specifications as Prisma.InputJsonValue
    }
    if (data.manualUrl !== undefined) updateData.manualUrl = data.manualUrl
    if (data.installationUrl !== undefined) updateData.installationUrl = data.installationUrl
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
    if (data.inventoryItemId !== undefined) {
      updateData.inventoryItem = data.inventoryItemId
        ? { connect: { id: data.inventoryItemId } }
        : { disconnect: true }
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    // Mantenimiento programado híbrido - actualizar campos
    if (data.manufacturerMaintenanceInterval !== undefined) {
      updateData.manufacturerMaintenanceInterval = data.manufacturerMaintenanceInterval
    }
    if (data.manufacturerMaintenanceIntervalUnit !== undefined) {
      updateData.manufacturerMaintenanceIntervalUnit = data.manufacturerMaintenanceIntervalUnit
    }
    if (data.mtbfAlertThreshold !== undefined) {
      updateData.mtbfAlertThreshold = data.mtbfAlertThreshold
    }
    if (data.maintenanceStrategy !== undefined) {
      updateData.maintenanceStrategy = data.maintenanceStrategy
    }
    if (data.autoCreateSchedule !== undefined) {
      updateData.autoCreateSchedule = data.autoCreateSchedule
    }
    if (data.workOrderTemplateId !== undefined) {
      updateData.workOrderTemplate = data.workOrderTemplateId
        ? { connect: { id: data.workOrderTemplateId } }
        : { disconnect: true }
    }

    // Handle schedule auto-creation/update/deletion
    const shouldHaveSchedule = data.autoCreateSchedule ?? component.autoCreateSchedule
    const oldScheduleId = component.workOrderScheduleId

    // Case 1: Disable schedule (autoCreateSchedule changed to false)
    if (shouldHaveSchedule === false && oldScheduleId) {
      await WorkOrderScheduleRepository.delete(oldScheduleId)
      updateData.workOrderSchedule = { disconnect: true }
    }

    // Case 2: Enable or update schedule
    if (shouldHaveSchedule === true) {
      const interval =
        data.manufacturerMaintenanceInterval ?? component.manufacturerMaintenanceInterval
      const intervalUnit =
        data.manufacturerMaintenanceIntervalUnit ?? component.manufacturerMaintenanceIntervalUnit
      const templateId = data.workOrderTemplateId ?? component.workOrderTemplateId

      if (!interval || !intervalUnit || !templateId) {
        throw new Error(
          'Para activar el schedule automático se requiere intervalo, unidad y template'
        )
      }

      // Check if schedule configuration changed
      const configChanged =
        (data.manufacturerMaintenanceInterval !== undefined &&
          data.manufacturerMaintenanceInterval !== component.manufacturerMaintenanceInterval) ||
        (data.manufacturerMaintenanceIntervalUnit !== undefined &&
          data.manufacturerMaintenanceIntervalUnit !==
            component.manufacturerMaintenanceIntervalUnit) ||
        (data.workOrderTemplateId !== undefined &&
          data.workOrderTemplateId !== component.workOrderTemplateId)

      // Create new schedule if config changed or no schedule exists
      if (configChanged || !oldScheduleId) {
        // Deactivate old schedule if exists and config changed
        if (oldScheduleId && configChanged) {
          await WorkOrderScheduleRepository.delete(oldScheduleId)
        }

        // Create new schedule using helper method
        const componentName = data.name ?? component.name
        const newScheduleId = await this.createComponentSchedule(
          componentName,
          interval,
          intervalUnit,
          templateId,
          component.companyId,
          session.user.id
        )

        updateData.workOrderSchedule = { connect: { id: newScheduleId } }
      }
    }

    return await ExplodedViewComponentRepository.update(componentId, updateData)
  }

  /**
   * Delete component (soft delete)
   */
  static async deleteComponent(
    componentId: string,
    session: AuthenticatedSession
  ): Promise<ExplodedViewComponentWithRelations> {
    await PermissionGuard.require(session, 'assets.delete')

    // Verify access
    const component = await this.getComponentById(componentId, session)
    if (!component) {
      throw new Error("Componente no encontrado o sin acceso")
    }

    // Check if component is in use
    const hotspots = await prisma.explodedViewHotspot.count({
      where: { componentId, isActive: true },
    })

    if (hotspots > 0) {
      throw new Error(
        `No se puede eliminar el componente porque está en uso en ${hotspots} hotspot(s)`
      )
    }

    return await ExplodedViewComponentRepository.softDelete(componentId)
  }

  // ============================================================================
  // HOTSPOTS
  // ============================================================================

  /**
   * Get hotspots for a view
   */
  static async getHotspotsByViewId(
    viewId: string,
    session: AuthenticatedSession
  ): Promise<ExplodedViewHotspotWithComponent[]> {
    // Verify access to view
    const view = await this.getViewById(viewId, session)
    if (!view) {
      throw new Error("Vista no encontrada o sin acceso")
    }

    return await ExplodedViewHotspotRepository.findByViewId(viewId)
  }

  /**
   * Create new hotspot
   */
  static async createHotspot(
    data: CreateHotspotData,
    session: AuthenticatedSession
  ): Promise<ExplodedViewHotspotWithComponent> {
    await PermissionGuard.require(session, 'assets.edit')

    // Verify access to view
    const view = await this.getViewById(data.viewId, session)
    if (!view) {
      throw new Error("Vista no encontrada o sin acceso")
    }

    // Verify access to component
    const component = await this.getComponentById(data.componentId, session)
    if (!component) {
      throw new Error("Componente no encontrado o sin acceso")
    }

    const createData: Prisma.ExplodedViewHotspotCreateInput = {
      label: data.label,
      type: data.type,
      coordinates: data.coordinates as unknown as Prisma.InputJsonValue,
      color: data.color || '#3B82F6',
      opacity: data.opacity ?? 0.3,
      order: data.order || 0,
      view: { connect: { id: data.viewId } },
      component: { connect: { id: data.componentId } },
    }

    return await ExplodedViewHotspotRepository.create(createData)
  }

  /**
   * Update hotspot
   */
  static async updateHotspot(
    hotspotId: string,
    data: UpdateHotspotData,
    session: AuthenticatedSession
  ): Promise<ExplodedViewHotspotWithComponent> {
    await PermissionGuard.require(session, 'assets.edit')

    // Verify hotspot exists and get its view
    const hotspot = await ExplodedViewHotspotRepository.findById(hotspotId)
    if (!hotspot) {
      throw new Error("Hotspot no encontrado")
    }

    // Verify access to view
    const view = await this.getViewById(hotspot.viewId, session)
    if (!view) {
      throw new Error("Sin acceso a la vista de este hotspot")
    }

    const updateData: Prisma.ExplodedViewHotspotUpdateInput = {}
    if (data.label !== undefined) updateData.label = data.label
    if (data.type !== undefined) updateData.type = data.type
    if (data.coordinates !== undefined) {
      updateData.coordinates = data.coordinates as unknown as Prisma.InputJsonValue
    }
    if (data.color !== undefined) updateData.color = data.color
    if (data.opacity !== undefined) updateData.opacity = data.opacity
    if (data.order !== undefined) updateData.order = data.order
    if (data.componentId !== undefined) {
      updateData.component = { connect: { id: data.componentId } }
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    return await ExplodedViewHotspotRepository.update(hotspotId, updateData)
  }

  /**
   * Delete hotspot (soft delete)
   */
  static async deleteHotspot(
    hotspotId: string,
    session: AuthenticatedSession
  ): Promise<ExplodedViewHotspotWithComponent> {
    await PermissionGuard.require(session, 'assets.edit')

    // Verify hotspot exists and get its view
    const hotspot = await ExplodedViewHotspotRepository.findById(hotspotId)
    if (!hotspot) {
      throw new Error("Hotspot no encontrado")
    }

    // Verify access to view
    const view = await this.getViewById(hotspot.viewId, session)
    if (!view) {
      throw new Error("Sin acceso a la vista de este hotspot")
    }

    return await ExplodedViewHotspotRepository.softDelete(hotspotId)
  }
}
