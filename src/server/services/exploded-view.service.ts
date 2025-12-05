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

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { ExplodedViewRepository, ExplodedViewHotspotRepository } from "../repositories/exploded-view.repository"
import { ExplodedViewComponentRepository } from "../repositories/exploded-view-component.repository"
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

export class ExplodedViewService {
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
    await PermissionGuard.require(session, 'inventory.create')

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

    if (data.inventoryItemId) {
      createData.inventoryItem = { connect: { id: data.inventoryItemId } }
    }

    return await ExplodedViewComponentRepository.create(createData)
  }

  /**
   * Update component
   */
  static async updateComponent(
    componentId: string,
    data: UpdateComponentData,
    session: AuthenticatedSession
  ): Promise<ExplodedViewComponentWithRelations> {
    await PermissionGuard.require(session, 'inventory.edit')

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

    return await ExplodedViewComponentRepository.update(componentId, updateData)
  }

  /**
   * Delete component (soft delete)
   */
  static async deleteComponent(
    componentId: string,
    session: AuthenticatedSession
  ): Promise<ExplodedViewComponentWithRelations> {
    await PermissionGuard.require(session, 'inventory.delete')

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
