import { Prisma, LocationType } from "@prisma/client"
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
  WorkOrderInventoryRequestWithRelations,
  InventoryRequestFilters,
  PaginatedInventoryRequestsResponse,
  InventoryMovementFilters,
  InventoryMovementWithRelations,
  PaginatedInventoryMovementsResponse,
  StockAdjustmentData,
  TransferStockData
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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_ITEMS)

    // Determine company scope based on company group membership
    let whereClause: Prisma.InventoryItemWhereInput

    if (PermissionHelper.hasPermission(session.user.role, PermissionHelper.PERMISSIONS.VIEW_ALL_INVENTORY)) {
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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_ITEMS)
    return await InventoryItemRepository.findById(id)
  }

  static async createItem(
    session: AuthenticatedSession,
    data: CreateInventoryItemData
  ): Promise<InventoryItemWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.CREATE_INVENTORY_ITEM)

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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.UPDATE_INVENTORY_ITEM)

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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.DELETE_INVENTORY_ITEM)
    return await InventoryItemRepository.delete(id)
  }

  static async getLowStockItems(session: AuthenticatedSession) {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_ITEMS)
    const companyId = session.user.companyId
    if (!companyId) return []
    return await InventoryItemRepository.findLowStock(companyId)
  }

  static async getBelowReorderPoint(session: AuthenticatedSession) {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_ITEMS)
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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_STOCK)
    return await InventoryStockRepository.findByItem(inventoryItemId)
  }

  static async getStockByLocation(
    session: AuthenticatedSession,
    locationId: string,
    locationType: LocationType
  ) {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_STOCK)
    return await InventoryStockRepository.findByLocation(locationId, locationType)
  }

  static async adjustStock(
    session: AuthenticatedSession,
    data: StockAdjustmentData
  ) {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.ADJUST_INVENTORY_STOCK)

    const stock = await InventoryStockRepository.setQuantity(
      data.inventoryItemId,
      data.locationId,
      data.locationType,
      data.newQuantity,
      session.user.id
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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.TRANSFER_INVENTORY)

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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_REQUESTS)

    const whereClause = this.buildRequestWhereClause(filters)
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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_REQUESTS)
    return await InventoryRequestRepository.findById(id)
  }

  static async createRequest(
    session: AuthenticatedSession,
    data: CreateInventoryRequestData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.CREATE_INVENTORY_REQUEST)

    const createData: Prisma.WorkOrderInventoryRequestCreateInput = {
      workOrder: {
        connect: { id: data.workOrderId }
      },
      inventoryItem: {
        connect: { id: data.inventoryItemId }
      },
      quantityRequested: data.quantityRequested,
      ...(data.sourceCompanyId && { sourceCompany: { connect: { id: data.sourceCompanyId } } }),
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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.APPROVE_INVENTORY_REQUEST)

    return await InventoryRequestRepository.approve(
      id,
      session.user.id,
      data.quantityApproved || 0,
      data.reviewNotes
    )
  }

  static async rejectRequest(
    session: AuthenticatedSession,
    id: string,
    data: ReviewInventoryRequestData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.REJECT_INVENTORY_REQUEST)

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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.DELIVER_INVENTORY_REQUEST)

    return await InventoryRequestRepository.markDelivered(
      id,
      session.user.id,
      data.quantityDelivered
    )
  }

  static async cancelRequest(
    session: AuthenticatedSession,
    id: string
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.DELETE_INVENTORY_REQUEST)
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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS)

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
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS)
    return await InventoryMovementRepository.findByItem(inventoryItemId)
  }

  static async getMovementsByWorkOrder(
    session: AuthenticatedSession,
    workOrderId: string
  ) {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS)
    return await InventoryMovementRepository.findByWorkOrder(workOrderId)
  }

  static async getMovementById(
    session: AuthenticatedSession,
    id: string
  ): Promise<InventoryMovementWithRelations | null> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS)
    return await InventoryMovementRepository.findById(id)
  }
}
