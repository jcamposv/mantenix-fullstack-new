import { Prisma, LocationType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { InventoryItemRepository } from "@/server/repositories/inventory-item.repository"
import { InventoryStockRepository } from "@/server/repositories/inventory-stock.repository"
import { InventoryRequestRepository } from "@/server/repositories/inventory-request.repository"
import { InventoryMovementRepository } from "@/server/repositories/inventory-movement.repository"
import { PermissionHelper } from "@/server/helpers/permission.helper"
import type {
  InventoryItemWithRelations,
  CreateInventoryItemData,
  UpdateInventoryItemData,
  InventoryItemFilters,
  PaginatedInventoryItemsResponse,
  CreateInventoryRequestData,
  ReviewInventoryRequestData,
  DeliverInventoryRequestData,
  DeliverFromWarehouseData,
  ConfirmReceiptData,
  WorkOrderInventoryRequestWithRelations,
  InventoryRequestFilters,
  InventoryRequestStatus,
  PaginatedInventoryRequestsResponse,
  InventoryMovementFilters,
  InventoryMovementWithRelations,
  PaginatedInventoryMovementsResponse,
  StockAdjustmentData,
  TransferStockData,
  InventoryDashboardMetrics,
  LowStockAlert
} from "@/types/inventory.types"
import type { AuthenticatedSession } from "@/types/auth.types"

export class InventoryService {

  // ============================================
  // INVENTORY ITEMS
  // ============================================

  static buildItemWhereClause(
    filters?: InventoryItemFilters,
    companyId?: string
  ): Prisma.InventoryItemWhereInput {
    const whereClause: Prisma.InventoryItemWhereInput = {}

    if (companyId) {
      whereClause.companyId = companyId
    }

    if (filters?.category) {
      whereClause.category = filters.category
    }

    if (filters?.subcategory) {
      whereClause.subcategory = filters.subcategory
    }

    if (filters?.manufacturer) {
      whereClause.manufacturer = { contains: filters.manufacturer, mode: 'insensitive' }
    }

    if (filters?.search) {
      whereClause.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (typeof filters?.isActive === 'boolean') {
      whereClause.isActive = filters.isActive
    } else {
      // Default to active only
      whereClause.isActive = true
    }

    return whereClause
  }

  static async getItemList(
    session: AuthenticatedSession,
    filters?: InventoryItemFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedInventoryItemsResponse> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_ITEMS)

    // Determine company scope based on company group membership
    let whereClause: Prisma.InventoryItemWhereInput

    if (await PermissionHelper.hasPermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_ALL_INVENTORY)) {
      // Super admin can see all inventory from all companies
      whereClause = this.buildItemWhereClause(filters, undefined)
    } else if (session.user.companyGroupId) {
      // If user belongs to a company group, they can see all items from companies in the group
      // This allows technicians, supervisors, and managers to request items from other companies
      // Authorization is controlled at the approval level, not visibility level
      whereClause = this.buildItemWhereClause(filters, undefined)

      whereClause.company = {
        companyGroupId: session.user.companyGroupId
      }
    } else {
      // Users not in a group can only see their own company's inventory
      whereClause = this.buildItemWhereClause(filters, session.user.companyId)
    }

    const { items, total } = await InventoryItemRepository.findMany(whereClause, page, limit)

    const totalPages = Math.ceil(total / limit)

    return {
      items,
      total,
      page,
      limit,
      totalPages
    }
  }

  static async getItemById(
    session: AuthenticatedSession,
    id: string
  ): Promise<InventoryItemWithRelations | null> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_ITEMS)
    return await InventoryItemRepository.findById(id)
  }

  /**
   * Get all locations where an item has available stock
   * Used for smart location selection when creating inventory requests
   */
  static async getAvailableStockLocations(
    session: AuthenticatedSession,
    inventoryItemId: string
  ): Promise<Array<{
    locationId: string
    locationType: LocationType
    locationName: string
    quantity: number
    availableQuantity: number
    reservedQuantity: number
  }>> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_ITEMS)

    // Get all stock locations for this item
    const stockLocations = await InventoryStockRepository.findByItem(inventoryItemId)

    // Filter only locations with available stock > 0 and sort by most stock first
    return stockLocations
      .filter(stock => stock.availableQuantity > 0)
      .map(stock => ({
        locationId: stock.locationId,
        locationType: stock.locationType,
        locationName: stock.locationName,
        quantity: stock.quantity,
        availableQuantity: stock.availableQuantity,
        reservedQuantity: stock.reservedQuantity
      }))
      .sort((a, b) => b.availableQuantity - a.availableQuantity)
  }

  static async createItem(
    session: AuthenticatedSession,
    data: CreateInventoryItemData
  ): Promise<InventoryItemWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.CREATE_INVENTORY_ITEM)

    const companyId = session.user.companyId
    if (!companyId) {
      throw new Error("Usuario no tiene empresa asignada")
    }

    // Check if code is unique
    const isUnique = await InventoryItemRepository.isCodeUnique(companyId, data.code)
    if (!isUnique) {
      throw new Error(`El código ${data.code} ya existe en el inventario`)
    }

    const createData: Prisma.InventoryItemCreateInput = {
      code: data.code,
      name: data.name,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      manufacturer: data.manufacturer,
      model: data.model,
      partNumber: data.partNumber,
      unit: data.unit || 'unidad',
      minStock: data.minStock || 0,
      maxStock: data.maxStock,
      reorderPoint: data.reorderPoint || 0,
      unitCost: data.unitCost,
      lastPurchasePrice: data.lastPurchasePrice,
      averageCost: data.averageCost,
      images: data.images || [],
      company: {
        connect: { id: companyId }
      },
      createdBy: session.user.id
    }

    const item = await InventoryItemRepository.create(createData)

    // Create initial stock entries if provided
    if (data.initialStock && data.initialStock.length > 0) {
      for (const stock of data.initialStock) {
        const stockData: Prisma.InventoryStockCreateInput = {
          inventoryItem: {
            connect: { id: item.id }
          },
          locationId: stock.locationId,
          locationType: stock.locationType,
          locationName: "", // TODO: Get from location
          quantity: stock.quantity,
          availableQuantity: stock.quantity,
          reservedQuantity: 0
        }
        await InventoryStockRepository.create(stockData)
      }
    }

    return item
  }

  static async updateItem(
    session: AuthenticatedSession,
    id: string,
    data: UpdateInventoryItemData
  ): Promise<InventoryItemWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.UPDATE_INVENTORY_ITEM)

    const companyId = session.user.companyId
    if (!companyId) {
      throw new Error("Usuario no tiene empresa asignada")
    }

    // Check if code is unique (if being updated)
    if (data.code) {
      const isUnique = await InventoryItemRepository.isCodeUnique(companyId, data.code, id)
      if (!isUnique) {
        throw new Error(`El código ${data.code} ya existe en el inventario`)
      }
    }

    const updateData: Prisma.InventoryItemUpdateInput = {
      ...(data.code && { code: data.code }),
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.subcategory !== undefined && { subcategory: data.subcategory }),
      ...(data.manufacturer !== undefined && { manufacturer: data.manufacturer }),
      ...(data.model !== undefined && { model: data.model }),
      ...(data.partNumber !== undefined && { partNumber: data.partNumber }),
      ...(data.unit && { unit: data.unit }),
      ...(typeof data.minStock === 'number' && { minStock: data.minStock }),
      ...(data.maxStock !== undefined && { maxStock: data.maxStock }),
      ...(typeof data.reorderPoint === 'number' && { reorderPoint: data.reorderPoint }),
      ...(data.unitCost !== undefined && { unitCost: data.unitCost }),
      ...(data.lastPurchasePrice !== undefined && { lastPurchasePrice: data.lastPurchasePrice }),
      ...(data.averageCost !== undefined && { averageCost: data.averageCost }),
      ...(data.images !== undefined && { images: data.images }),
      ...(typeof data.isActive === 'boolean' && { isActive: data.isActive })
    }

    return await InventoryItemRepository.update(id, updateData)
  }

  static async deleteItem(
    session: AuthenticatedSession,
    id: string
  ): Promise<InventoryItemWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.DELETE_INVENTORY_ITEM)
    return await InventoryItemRepository.delete(id)
  }

  static async getLowStockItems(session: AuthenticatedSession) {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_ITEMS)
    const companyId = session.user.companyId
    if (!companyId) return []
    return await InventoryItemRepository.findLowStock(companyId)
  }

  static async getBelowReorderPoint(session: AuthenticatedSession) {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_ITEMS)
    const companyId = session.user.companyId
    if (!companyId) return []
    return await InventoryItemRepository.findBelowReorderPoint(companyId)
  }

  // ============================================
  // INVENTORY STOCK
  // ============================================

  static async getStockByItem(
    session: AuthenticatedSession,
    inventoryItemId: string
  ) {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_STOCK)
    return await InventoryStockRepository.findByItem(inventoryItemId)
  }

  static async getStockByLocation(
    session: AuthenticatedSession,
    locationId: string,
    locationType: LocationType
  ) {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_STOCK)
    return await InventoryStockRepository.findByLocation(locationId, locationType)
  }

  static async adjustStock(
    session: AuthenticatedSession,
    data: StockAdjustmentData
  ) {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.ADJUST_INVENTORY_STOCK)

    // Get location name based on type
    let locationName = data.locationId
    try {
      switch (data.locationType) {
        case 'WAREHOUSE':
          const company = await prisma.company.findUnique({
            where: { id: data.locationId },
            select: { name: true }
          })
          locationName = company?.name || data.locationId
          break
        case 'SITE':
          const site = await prisma.site.findUnique({
            where: { id: data.locationId },
            select: { name: true }
          })
          locationName = site?.name || data.locationId
          break
        case 'VEHICLE':
          // TODO: Implement vehicle lookup when vehicle model exists
          locationName = data.locationId
          break
      }
    } catch (error) {
      console.error('Error fetching location name:', error)
      // Continue with locationId as fallback
    }

    const stock = await InventoryStockRepository.setQuantity(
      data.inventoryItemId,
      data.locationId,
      data.locationType,
      data.newQuantity,
      session.user.id,
      locationName
    )

    // Create adjustment movement
    const movementData: Prisma.InventoryMovementCreateInput = {
      type: 'ADJUSTMENT',
      inventoryItem: {
        connect: { id: data.inventoryItemId }
      },
      toLocationId: data.locationId,
      toLocationType: data.locationType,
      quantity: data.newQuantity,
      reason: data.reason,
      notes: data.notes,
      creator: { connect: { id: session.user.id } }
    }

    await InventoryMovementRepository.create(movementData)

    return stock
  }

  static async transferStock(
    session: AuthenticatedSession,
    data: TransferStockData
  ) {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.TRANSFER_INVENTORY)

    // Decrement from source
    await InventoryStockRepository.decrementQuantity(
      data.inventoryItemId,
      data.fromLocationId,
      data.fromLocationType,
      data.quantity
    )

    // Increment at destination
    const existingStock = await InventoryStockRepository.findByItemAndLocation(
      data.inventoryItemId,
      data.toLocationId,
      data.toLocationType
    )

    if (existingStock) {
      await InventoryStockRepository.incrementQuantity(
        data.inventoryItemId,
        data.toLocationId,
        data.toLocationType,
        data.quantity
      )
    } else {
      // Create new stock entry
      const stockData: Prisma.InventoryStockCreateInput = {
        inventoryItem: {
          connect: { id: data.inventoryItemId }
        },
        locationId: data.toLocationId,
        locationType: data.toLocationType,
        locationName: "", // TODO: Get from location
        quantity: data.quantity,
        availableQuantity: data.quantity,
        reservedQuantity: 0
      }
      await InventoryStockRepository.create(stockData)
    }

    // Create transfer movement
    const movementData: Prisma.InventoryMovementCreateInput = {
      type: 'TRANSFER',
      inventoryItem: {
        connect: { id: data.inventoryItemId }
      },
      fromLocationId: data.fromLocationId,
      fromLocationType: data.fromLocationType,
      ...(data.fromCompanyId && { fromCompany: { connect: { id: data.fromCompanyId } } }),
      toLocationId: data.toLocationId,
      toLocationType: data.toLocationType,
      ...(data.toCompanyId && { toCompany: { connect: { id: data.toCompanyId } } }),
      quantity: data.quantity,
      reason: data.reason,
      notes: data.notes,
      documentNumber: data.documentNumber,
      creator: { connect: { id: session.user.id } }
    }

    await InventoryMovementRepository.create(movementData)
  }

  // ============================================
  // INVENTORY REQUESTS
  // ============================================

  static buildRequestWhereClause(filters?: InventoryRequestFilters): Prisma.WorkOrderInventoryRequestWhereInput {
    const whereClause: Prisma.WorkOrderInventoryRequestWhereInput = {}

    if (filters?.workOrderId) {
      whereClause.workOrderId = filters.workOrderId
    }

    if (filters?.inventoryItemId) {
      whereClause.inventoryItemId = filters.inventoryItemId
    }

    if (filters?.status) {
      whereClause.status = filters.status
    }

    if (filters?.excludeStatuses && filters.excludeStatuses.length > 0) {
      whereClause.status = {
        notIn: filters.excludeStatuses
      }
    }

    if (filters?.urgency) {
      whereClause.urgency = filters.urgency
    }

    if (filters?.requestedBy) {
      whereClause.requestedBy = filters.requestedBy
    }

    if (filters?.sourceCompanyId) {
      whereClause.sourceCompanyId = filters.sourceCompanyId
    }

    if (filters?.dateFrom || filters?.dateTo) {
      whereClause.createdAt = {}
      if (filters.dateFrom) whereClause.createdAt.gte = filters.dateFrom
      if (filters.dateTo) whereClause.createdAt.lte = filters.dateTo
    }

    if (filters?.search) {
      whereClause.OR = [
        { inventoryItem: { name: { contains: filters.search, mode: 'insensitive' } } },
        { inventoryItem: { code: { contains: filters.search, mode: 'insensitive' } } },
        { notes: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return whereClause
  }

  static async getRequestList(
    session: AuthenticatedSession,
    filters?: InventoryRequestFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedInventoryRequestsResponse> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_REQUESTS)

    // Apply role-based filters
    const roleBasedFilters = { ...filters }

    // ENCARGADO_BODEGA can only see requests from their company's warehouse
    // They should NOT see PENDING requests (those are internal to the requesting company)
    // They CAN see APPROVED, IN_TRANSIT, READY_FOR_PICKUP, DELIVERED (their work)
    // They should NOT see REJECTED or CANCELLED
    if (session.user.role === 'ENCARGADO_BODEGA' && session.user.companyId) {
      roleBasedFilters.sourceCompanyId = session.user.companyId
      // If no status filter is applied, exclude PENDING, REJECTED, CANCELLED
      if (!roleBasedFilters.status) {
        roleBasedFilters.excludeStatuses = ['PENDING', 'REJECTED', 'CANCELLED']
      }
    }

    let whereClause = this.buildRequestWhereClause(roleBasedFilters)

    // Filter by company for non-SUPER_ADMIN roles
    // SUPER_ADMIN can see all requests
    // Other roles can only see requests from work orders in their company
    if (session.user.role !== 'SUPER_ADMIN' && session.user.companyId) {
      whereClause = {
        ...whereClause,
        workOrder: {
          companyId: session.user.companyId
        }
      }
    }

    const { requests, total } = await InventoryRequestRepository.findMany(whereClause, page, limit)

    const totalPages = Math.ceil(total / limit)

    return {
      requests,
      total,
      page,
      limit,
      totalPages
    }
  }

  static async getRequestById(
    session: AuthenticatedSession,
    id: string
  ): Promise<WorkOrderInventoryRequestWithRelations | null> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_REQUESTS)
    const request = await InventoryRequestRepository.findById(id)

    if (!request) return null

    let sourceLocationName: string | undefined
    let destinationLocationName: string | undefined
    let destinationLocationId: string | undefined
    let destinationLocationType: 'WAREHOUSE' | 'VEHICLE' | 'SITE' | undefined

    try {
      // Add source location name if location is specified
      if (request.sourceLocationId && request.sourceLocationType) {
        if (request.sourceLocationType === 'WAREHOUSE') {
          const company = await prisma.company.findUnique({
            where: { id: request.sourceLocationId },
            select: { name: true }
          })
          sourceLocationName = company?.name || request.sourceLocationId
        } else if (request.sourceLocationType === 'SITE') {
          const site = await prisma.site.findUnique({
            where: { id: request.sourceLocationId },
            select: { name: true }
          })
          sourceLocationName = site?.name || request.sourceLocationId
        } else if (request.sourceLocationType === 'VEHICLE') {
          // TODO: Fetch vehicle name when vehicle endpoint is implemented
          sourceLocationName = request.sourceLocationId
        }
      }

      // Calculate destination location based on work order
      // If work order has siteId → destination is SITE
      // Otherwise → destination is requester's company (WAREHOUSE)
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: request.workOrderId },
        select: { siteId: true }
      })

      if (workOrder?.siteId) {
        destinationLocationType = 'SITE'
        destinationLocationId = workOrder.siteId
        const site = await prisma.site.findUnique({
          where: { id: workOrder.siteId },
          select: { name: true }
        })
        destinationLocationName = site?.name || workOrder.siteId
      } else if (request.requestedBy) {
        // Fetch requester's company
        const requester = await prisma.user.findUnique({
          where: { id: request.requestedBy },
          select: { companyId: true }
        })

        if (requester?.companyId) {
          destinationLocationType = 'WAREHOUSE'
          destinationLocationId = requester.companyId
          const company = await prisma.company.findUnique({
            where: { id: requester.companyId },
            select: { name: true }
          })
          destinationLocationName = company?.name || requester.companyId
        }
      }

      return {
        ...request,
        sourceLocationName,
        destinationLocationName,
        destinationLocationId,
        destinationLocationType
      } as WorkOrderInventoryRequestWithRelations & {
        sourceLocationName?: string
        destinationLocationName?: string
        destinationLocationId?: string
        destinationLocationType?: 'WAREHOUSE' | 'VEHICLE' | 'SITE'
      }
    } catch (error) {
      console.error('Error fetching location names:', error)
      return request
    }
  }

  static async createRequest(
    session: AuthenticatedSession,
    data: CreateInventoryRequestData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.CREATE_INVENTORY_REQUEST)

    const createData: Prisma.WorkOrderInventoryRequestCreateInput = {
      workOrder: {
        connect: { id: data.workOrderId }
      },
      inventoryItem: {
        connect: { id: data.inventoryItemId }
      },
      quantityRequested: data.quantityRequested,
      ...(data.sourceCompanyId && { sourceCompany: { connect: { id: data.sourceCompanyId } } }),
      // If source is a WAREHOUSE and no sourceCompanyId is provided, use sourceLocationId as sourceCompanyId
      ...(!data.sourceCompanyId && data.sourceLocationId && data.sourceLocationType === 'WAREHOUSE' && {
        sourceCompany: { connect: { id: data.sourceLocationId } }
      }),
      sourceLocationId: data.sourceLocationId,
      sourceLocationType: data.sourceLocationType,
      destinationLocationId: data.destinationLocationId,
      destinationLocationType: data.destinationLocationType,
      notes: data.notes,
      urgency: data.urgency || 'NORMAL',
      requester: { connect: { id: session.user.id } }
    }

    return await InventoryRequestRepository.create(createData)
  }

  static async approveRequest(
    session: AuthenticatedSession,
    id: string,
    data: ReviewInventoryRequestData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.APPROVE_INVENTORY_REQUEST)

    // Get the request
    const request = await InventoryRequestRepository.findById(id)
    if (!request) {
      throw new Error("Solicitud de inventario no encontrada")
    }

    if (request.status !== "PENDING") {
      throw new Error(`La solicitud con estado ${request.status} no puede ser aprobada`)
    }

    const quantityApproved = data.quantityApproved || request.quantityRequested

    // Validate stock availability (but don't move it yet)
    if (request.sourceLocationId && request.sourceLocationType) {
      const sourceStock = await InventoryStockRepository.findByItemAndLocation(
        request.inventoryItemId,
        request.sourceLocationId,
        request.sourceLocationType
      )

      if (!sourceStock) {
        const allStock = await InventoryStockRepository.findByItem(request.inventoryItemId)
        const locations = allStock.map(s => `${s.locationName} (${s.locationType}): ${s.availableQuantity} disponible`)
        throw new Error(
          `No hay stock en la ubicación solicitada. Stock disponible en: ${locations.join(', ') || 'ninguna ubicación'}`
        )
      }

      if (sourceStock.availableQuantity < quantityApproved) {
        throw new Error(
          `Stock insuficiente en ${sourceStock.locationName}. Disponible: ${sourceStock.availableQuantity}, Solicitado: ${quantityApproved}`
        )
      }
    }

    // Only approve - stock will be moved when warehouse delivers
    return await InventoryRequestRepository.approve(
      id,
      session.user.id,
      quantityApproved,
      data.reviewNotes,
      request.sourceLocationId || undefined,
      request.sourceLocationType || undefined
    )
  }

  static async rejectRequest(
    session: AuthenticatedSession,
    id: string,
    data: ReviewInventoryRequestData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.REJECT_INVENTORY_REQUEST)

    return await InventoryRequestRepository.reject(
      id,
      session.user.id,
      data.reviewNotes || "Rechazado"
    )
  }

  static async deliverRequest(
    session: AuthenticatedSession,
    id: string,
    data: DeliverInventoryRequestData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.DELIVER_INVENTORY_REQUEST)

    return await InventoryRequestRepository.markDelivered(
      id,
      session.user.id,
      data.quantityDelivered
    )
  }

  static async deliverFromWarehouse(
    session: AuthenticatedSession,
    id: string,
    data: DeliverFromWarehouseData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.DELIVER_FROM_WAREHOUSE)

    // Get the request
    const request = await InventoryRequestRepository.findById(id)
    if (!request) {
      throw new Error("Solicitud de inventario no encontrada")
    }

    if (request.status !== "APPROVED") {
      throw new Error(`La solicitud debe estar aprobada para ser entregada. Estado actual: ${request.status}`)
    }

    if (!request.sourceLocationId || !request.sourceLocationType) {
      throw new Error("La solicitud no tiene ubicación origen definida")
    }

    const quantityToDeliver = request.quantityApproved || request.quantityRequested

    // Validate stock availability
    const sourceStock = await InventoryStockRepository.findByItemAndLocation(
      request.inventoryItemId,
      request.sourceLocationId,
      request.sourceLocationType
    )

    if (!sourceStock) {
      throw new Error("No se encontró stock en la ubicación origen")
    }

    if (sourceStock.availableQuantity < quantityToDeliver) {
      throw new Error(
        `Stock insuficiente. Disponible: ${sourceStock.availableQuantity}, Solicitado: ${quantityToDeliver}`
      )
    }

    // Decrement stock from warehouse
    await InventoryStockRepository.decrementQuantity(
      request.inventoryItemId,
      request.sourceLocationId,
      request.sourceLocationType,
      quantityToDeliver
    )

    // Get source company ID
    let sourceCompanyId: string | undefined
    if (sourceStock.locationType === "WAREHOUSE") {
      sourceCompanyId = sourceStock.locationId
    }

    // Create OUT movement
    const movementData: Prisma.InventoryMovementCreateInput = {
      type: 'OUT',
      inventoryItem: { connect: { id: request.inventoryItemId } },
      fromLocationId: sourceStock.locationId,
      fromLocationType: sourceStock.locationType,
      ...(sourceCompanyId && { fromCompany: { connect: { id: sourceCompanyId } } }),
      quantity: quantityToDeliver,
      reason: `Entrega desde bodega - Solicitud ${request.id}`,
      notes: data.notes,
      workOrder: { connect: { id: request.workOrderId } },
      request: { connect: { id: request.id } },
      creator: { connect: { id: session.user.id } }
    }

    await InventoryMovementRepository.create(movementData)

    // Mark as delivered from warehouse
    return await InventoryRequestRepository.deliverFromWarehouse(
      id,
      session.user.id,
      data.notes
    )
  }

  static async receiveAtDestinationWarehouse(
    session: AuthenticatedSession,
    id: string,
    data: DeliverFromWarehouseData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.DELIVER_FROM_WAREHOUSE)

    // Get the request
    const request = await InventoryRequestRepository.findById(id)
    if (!request) {
      throw new Error("Solicitud de inventario no encontrada")
    }

    // Can only receive at destination if it's IN_TRANSIT
    if (request.status !== "IN_TRANSIT") {
      throw new Error(`Solo se puede recibir en bodega destino cuando está en tránsito. Estado actual: ${request.status}`)
    }

    const quantityDelivered = request.quantityApproved || request.quantityRequested

    // Determine destination location
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: request.workOrderId },
      select: { siteId: true, companyId: true }
    })

    let destinationLocationId: string
    let destinationLocationType: LocationType
    let destinationCompanyId: string | undefined

    if (workOrder?.siteId) {
      destinationLocationId = workOrder.siteId
      destinationLocationType = "SITE"
    } else {
      const requester = await prisma.user.findUnique({
        where: { id: request.requestedBy },
        select: { companyId: true }
      })
      destinationLocationId = requester?.companyId || session.user.companyId!
      destinationLocationType = "WAREHOUSE"
      destinationCompanyId = destinationLocationId
    }

    // Increment stock at destination (or create if doesn't exist)
    const existingDestStock = await InventoryStockRepository.findByItemAndLocation(
      request.inventoryItemId,
      destinationLocationId,
      destinationLocationType
    )

    if (existingDestStock) {
      await InventoryStockRepository.incrementQuantity(
        request.inventoryItemId,
        destinationLocationId,
        destinationLocationType,
        quantityDelivered
      )
    } else {
      // Get location name
      let locationName = destinationLocationId
      if (destinationLocationType === "WAREHOUSE") {
        const company = await prisma.company.findUnique({
          where: { id: destinationLocationId },
          select: { name: true }
        })
        locationName = company?.name || destinationLocationId
      } else if (destinationLocationType === "SITE") {
        const site = await prisma.site.findUnique({
          where: { id: destinationLocationId },
          select: { name: true }
          })
        locationName = site?.name || destinationLocationId
      }

      const stockData: Prisma.InventoryStockCreateInput = {
        inventoryItem: { connect: { id: request.inventoryItemId } },
        locationId: destinationLocationId,
        locationType: destinationLocationType,
        locationName,
        quantity: quantityDelivered,
        availableQuantity: quantityDelivered,
        reservedQuantity: 0
      }
      await InventoryStockRepository.create(stockData)
    }

    // Create IN movement
    const movementData: Prisma.InventoryMovementCreateInput = {
      type: 'IN',
      inventoryItem: { connect: { id: request.inventoryItemId } },
      toLocationId: destinationLocationId,
      toLocationType: destinationLocationType,
      ...(destinationCompanyId && { toCompany: { connect: { id: destinationCompanyId } } }),
      quantity: quantityDelivered,
      reason: `Recibido en bodega destino - Solicitud ${request.id}`,
      notes: data.notes,
      workOrder: { connect: { id: request.workOrderId } },
      request: { connect: { id: request.id } },
      creator: { connect: { id: session.user.id } }
    }

    await InventoryMovementRepository.create(movementData)

    // Mark as received at destination and ready for pickup
    const updated = await InventoryRequestRepository.receiveAtDestinationWarehouse(
      id,
      session.user.id,
      data.notes
    )

    // Mark as ready for pickup (technician can now pick it up from destination warehouse)
    return await InventoryRequestRepository.prepareForPickup(id)
  }

  static async confirmReceipt(
    session: AuthenticatedSession,
    id: string,
    data: ConfirmReceiptData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.CONFIRM_RECEIPT)

    // Get the request
    const request = await InventoryRequestRepository.findById(id)
    if (!request) {
      throw new Error("Solicitud de inventario no encontrada")
    }

    // Can only confirm if it's READY_FOR_PICKUP
    if (request.status !== "READY_FOR_PICKUP") {
      throw new Error(`No se puede confirmar recepción. Estado actual: ${request.status}`)
    }

    const quantityDelivered = request.quantityApproved || request.quantityRequested

    // Check if this is an INTER-company transfer
    // If destination warehouse received the item, we need to create OUT movement from destination
    if (request.destinationWarehouseReceivedAt) {
      // This is INTER-company - the item is now in destination warehouse
      // Need to create OUT movement from destination warehouse to technician

      // Determine destination location
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: request.workOrderId },
        select: { siteId: true, companyId: true }
      })

      let destinationLocationId: string
      let destinationLocationType: LocationType
      let destinationCompanyId: string | undefined

      if (workOrder?.siteId) {
        destinationLocationId = workOrder.siteId
        destinationLocationType = "SITE"
      } else {
        const requester = await prisma.user.findUnique({
          where: { id: request.requestedBy },
          select: { companyId: true }
        })
        destinationLocationId = requester?.companyId || workOrder?.companyId || ""
        
        if (!destinationLocationId) {
          throw new Error("No se pudo determinar la ubicación de destino")
        }
        
        destinationLocationType = "WAREHOUSE"
        destinationCompanyId = destinationLocationId
      }

      // Decrement stock from destination warehouse
      await InventoryStockRepository.decrementQuantity(
        request.inventoryItemId,
        destinationLocationId,
        destinationLocationType,
        quantityDelivered
      )

      // Create OUT movement from destination
      const outMovementData: Prisma.InventoryMovementCreateInput = {
        type: 'OUT',
        inventoryItem: { connect: { id: request.inventoryItemId } },
        fromLocationId: destinationLocationId,
        fromLocationType: destinationLocationType,
        ...(destinationCompanyId && { fromCompany: { connect: { id: destinationCompanyId } } }),
        quantity: quantityDelivered,
        reason: `Entrega a técnico - Solicitud ${request.id}`,
        notes: data.notes,
        workOrder: { connect: { id: request.workOrderId } },
        request: { connect: { id: request.id } },
        creator: { connect: { id: session.user.id } }
      }

      await InventoryMovementRepository.create(outMovementData)
    }
    // For INTRA-company, the OUT was already created in deliverFromWarehouse
    // No additional stock movement needed

    // Mark as received by technician
    return await InventoryRequestRepository.confirmReceipt(
      id,
      session.user.id,
      data.notes
    )
  }

  static async cancelRequest(
    session: AuthenticatedSession,
    id: string
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.DELETE_INVENTORY_REQUEST)
    return await InventoryRequestRepository.cancel(id)
  }

  // ============================================
  // INVENTORY MOVEMENTS
  // ============================================

  static buildMovementWhereClause(filters?: InventoryMovementFilters): Prisma.InventoryMovementWhereInput {
    const whereClause: Prisma.InventoryMovementWhereInput = {}

    if (filters?.movementType) {
      whereClause.type = filters.movementType
    }

    if (filters?.inventoryItemId) {
      whereClause.inventoryItemId = filters.inventoryItemId
    }

    if (filters?.fromCompanyId) {
      whereClause.fromCompanyId = filters.fromCompanyId
    }

    if (filters?.toCompanyId) {
      whereClause.toCompanyId = filters.toCompanyId
    }

    if (filters?.workOrderId) {
      whereClause.workOrderId = filters.workOrderId
    }

    if (filters?.startDate || filters?.endDate) {
      whereClause.createdAt = {}
      if (filters.startDate) whereClause.createdAt.gte = filters.startDate
      if (filters.endDate) whereClause.createdAt.lte = filters.endDate
    }

    return whereClause
  }

  static async getMovementList(
    session: AuthenticatedSession,
    filters?: InventoryMovementFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedInventoryMovementsResponse> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS)

    const whereClause = this.buildMovementWhereClause(filters)
    const { movements, total } = await InventoryMovementRepository.findMany(whereClause, page, limit)

    const totalPages = Math.ceil(total / limit)

    return {
      movements,
      total,
      page,
      limit,
      totalPages
    }
  }

  static async getMovementsByItem(
    session: AuthenticatedSession,
    inventoryItemId: string
  ) {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS)
    return await InventoryMovementRepository.findByItem(inventoryItemId)
  }

  static async getMovementsByWorkOrder(
    session: AuthenticatedSession,
    workOrderId: string
  ) {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS)
    return await InventoryMovementRepository.findByWorkOrder(workOrderId)
  }

  static async getMovementById(
    session: AuthenticatedSession,
    id: string
  ): Promise<InventoryMovementWithRelations | null> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS)
    return await InventoryMovementRepository.findById(id)
  }

  // ============================================
  // DASHBOARD METRICS
  // ============================================

  static async getDashboardMetrics(
    session: AuthenticatedSession
  ): Promise<InventoryDashboardMetrics> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_ITEMS)

    const companyId = session.user.companyId!

    // KPIs - Get counts based on user's company
    const [
      totalUniqueItems,
      allStockItems,
      allRequests,
      todayMovements
    ] = await Promise.all([
      // Total unique items with stock in user's company
      prisma.inventoryItem.count({
        where: {
          stockLocations: {
            some: {
              locationId: companyId,
              locationType: 'WAREHOUSE'
            }
          }
        }
      }),
      // All stock items for user's company
      prisma.inventoryStock.findMany({
        where: {
          locationId: companyId,
          locationType: 'WAREHOUSE'
        },
        include: {
          inventoryItem: {
            select: {
              id: true,
              code: true,
              name: true,
              minStock: true,
              reorderPoint: true
            }
          }
        }
      }),
      // All requests based on role
      prisma.workOrderInventoryRequest.findMany({
        where: session.user.role === 'ENCARGADO_BODEGA'
          ? {
              sourceCompanyId: companyId,
              status: { notIn: ['PENDING', 'REJECTED', 'CANCELLED'] }
            }
          : {
              workOrder: {
                companyId: companyId
              }
            },
        select: {
          id: true,
          status: true,
          requestedAt: true,
          requester: {
            select: {
              name: true
            }
          },
          inventoryItem: {
            select: {
              code: true,
              name: true
            }
          }
        }
      }),
      // Today's movements
      prisma.inventoryMovement.findMany({
        where: {
          OR: [
            { fromCompany: { id: companyId } },
            { toCompany: { id: companyId } }
          ],
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        select: {
          type: true
        }
      })
    ])

    // Calculate low stock and critical stock
    const lowStockAlerts: LowStockAlert[] = []
    let lowStockCount = 0
    let criticalStockCount = 0

    allStockItems.forEach(stock => {
      const minStock = stock.inventoryItem.minStock || 0
      const reorderPoint = stock.inventoryItem.reorderPoint || minStock

      if (stock.availableQuantity <= 0) {
        criticalStockCount++
        lowStockAlerts.push({
          inventoryItem: {
            id: stock.inventoryItem.id,
            code: stock.inventoryItem.code,
            name: stock.inventoryItem.name,
            minStock: minStock,
            reorderPoint: reorderPoint
          },
          currentStock: stock.availableQuantity,
          alertType: "OUT_OF_STOCK",
          locations: [{
            locationId: stock.locationId,
            locationName: stock.locationName,
            locationType: stock.locationType,
            quantity: stock.availableQuantity
          }]
        })
      } else if (minStock > 0 && stock.availableQuantity < minStock * 0.25) {
        criticalStockCount++
        lowStockAlerts.push({
          inventoryItem: {
            id: stock.inventoryItem.id,
            code: stock.inventoryItem.code,
            name: stock.inventoryItem.name,
            minStock: minStock,
            reorderPoint: reorderPoint
          },
          currentStock: stock.availableQuantity,
          alertType: "BELOW_MIN",
          locations: [{
            locationId: stock.locationId,
            locationName: stock.locationName,
            locationType: stock.locationType,
            quantity: stock.availableQuantity
          }]
        })
      } else if (minStock > 0 && stock.availableQuantity < minStock) {
        lowStockCount++
        lowStockAlerts.push({
          inventoryItem: {
            id: stock.inventoryItem.id,
            code: stock.inventoryItem.code,
            name: stock.inventoryItem.name,
            minStock: minStock,
            reorderPoint: reorderPoint
          },
          currentStock: stock.availableQuantity,
          alertType: "BELOW_MIN",
          locations: [{
            locationId: stock.locationId,
            locationName: stock.locationName,
            locationType: stock.locationType,
            quantity: stock.availableQuantity
          }]
        })
      }
    })

    // Sort alerts by severity
    lowStockAlerts.sort((a, b) => {
      const severityOrder = { "OUT_OF_STOCK": 0, "BELOW_MIN": 1, "BELOW_REORDER": 2 }
      return severityOrder[a.alertType] - severityOrder[b.alertType]
    })

    // Count requests by status
    const pendingRequests = allRequests.filter(r => r.status === 'PENDING').length
    const approvedRequests = allRequests.filter(r => r.status === 'APPROVED').length
    const inTransitRequests = allRequests.filter(r => r.status === 'IN_TRANSIT').length

    // Count today's movements
    const movementsToday = {
      in: todayMovements.filter(m => m.type === 'IN').length,
      out: todayMovements.filter(m => m.type === 'OUT').length
    }

    // Top requested items (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const topRequested = await prisma.workOrderInventoryRequest.groupBy({
      by: ['inventoryItemId'],
      where: {
        workOrder: {
          companyId: companyId
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    const topRequestedItems = await Promise.all(
      topRequested.map(async (item) => {
        const inventoryItem = await prisma.inventoryItem.findUnique({
          where: { id: item.inventoryItemId },
          select: {
            id: true,
            code: true,
            name: true
          }
        })
        return {
          itemId: item.inventoryItemId,
          itemCode: inventoryItem?.code || '',
          itemName: inventoryItem?.name || '',
          requestCount: item._count.id
        }
      })
    )

    // Recent activity (last 20 events)
    const recentRequests = await prisma.workOrderInventoryRequest.findMany({
      where: session.user.role === 'ENCARGADO_BODEGA'
        ? {
            sourceCompanyId: companyId,
            status: { notIn: ['PENDING', 'REJECTED', 'CANCELLED'] }
          }
        : {
            workOrder: {
              companyId: companyId
            }
          },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 20,
      select: {
        id: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        warehouseDeliveredAt: true,
        receivedAt: true,
        requester: {
          select: {
            name: true
          }
        },
        reviewer: {
          select: {
            name: true
          }
        },
        warehouseDeliverer: {
          select: {
            name: true
          }
        },
        receiver: {
          select: {
            name: true
          }
        },
        inventoryItem: {
          select: {
            name: true
          }
        },
        quantityRequested: true,
        quantityApproved: true
      }
    })

    const recentActivity = recentRequests.flatMap(req => {
      const activities: InventoryDashboardMetrics['recentActivity'] = []

      // Created
      activities.push({
        id: `${req.id}-created`,
        type: 'REQUEST_CREATED',
        timestamp: req.createdAt.toISOString(),
        description: `${req.requester.name} solicitó ${req.quantityRequested}x ${req.inventoryItem.name}`,
        user: { name: req.requester.name },
        request: { id: req.id, status: req.status }
      })

      // Reviewed
      if (req.reviewedAt && req.reviewer) {
        const isApproved = req.status !== 'REJECTED'
        activities.push({
          id: `${req.id}-reviewed`,
          type: isApproved ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
          timestamp: req.reviewedAt.toISOString(),
          description: `${req.reviewer.name} ${isApproved ? 'aprobó' : 'rechazó'} ${req.quantityApproved || req.quantityRequested}x ${req.inventoryItem.name}`,
          user: { name: req.reviewer.name },
          request: { id: req.id, status: req.status }
        })
      }

      // Delivered from warehouse
      if (req.warehouseDeliveredAt && req.warehouseDeliverer) {
        activities.push({
          id: `${req.id}-delivered`,
          type: 'WAREHOUSE_DELIVERED',
          timestamp: req.warehouseDeliveredAt.toISOString(),
          description: `Bodega entregó ${req.quantityApproved || req.quantityRequested}x ${req.inventoryItem.name}`,
          user: { name: req.warehouseDeliverer.name },
          request: { id: req.id, status: req.status }
        })
      }

      // Received by technician
      if (req.receivedAt && req.receiver) {
        activities.push({
          id: `${req.id}-received`,
          type: 'TECHNICIAN_RECEIVED',
          timestamp: req.receivedAt.toISOString(),
          description: `${req.receiver.name} confirmó recepción de ${req.quantityApproved || req.quantityRequested}x ${req.inventoryItem.name}`,
          user: { name: req.receiver.name },
          request: { id: req.id, status: req.status }
        })
      }

      return activities
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

    // Requests by status
    const requestsByStatus = Object.entries(
      allRequests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({
      status: status as InventoryRequestStatus,
      count
    }))

    return {
      kpis: {
        totalUniqueItems,
        lowStockCount,
        criticalStockCount,
        pendingRequests,
        approvedRequests,
        inTransitRequests,
        movementsToday
      },
      lowStockAlerts: lowStockAlerts.slice(0, 10), // Top 10
      topRequestedItems,
      recentActivity,
      requestsByStatus
    }
  }
}
