import type { Role } from "@prisma/client"

/**
 * Enum types from Prisma
 */
export type LocationType = "SITE" | "WAREHOUSE" | "VEHICLE"
export type InventoryRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
export type RequestUrgency = "LOW" | "NORMAL" | "HIGH" | "CRITICAL"
export type MovementType =
  | "IN"
  | "OUT"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "WORK_ORDER"
  | "RETURN"
  | "DAMAGE"
  | "COUNT_ADJUSTMENT"

/**
 * Base InventoryItem interface
 */
export interface InventoryItem {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  subcategory: string | null
  manufacturer: string | null
  model: string | null
  partNumber: string | null
  unit: string
  minStock: number
  maxStock: number | null
  reorderPoint: number
  unitCost: number | null
  lastPurchasePrice: number | null
  averageCost: number | null
  images: string[]
  companyId: string
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
}

/**
 * InventoryItem with relations (from Prisma)
 */
export interface InventoryItemPrismaResult {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  subcategory: string | null
  manufacturer: string | null
  model: string | null
  partNumber: string | null
  unit: string
  minStock: number
  maxStock: number | null
  reorderPoint: number
  unitCost: number | null
  lastPurchasePrice: number | null
  averageCost: number | null
  images: string[]
  companyId: string
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  company?: {
    id: string
    name: string
  }
  creator?: {
    id: string
    name: string
    email: string
  }
  stock: Array<{
    id: string
    locationId: string
    locationType: LocationType
    locationName: string
    quantity: number
    reservedQuantity: number
    availableQuantity: number
    aisle: string | null
    rack: string | null
    bin: string | null
    updatedAt: string
  }>
  _count?: {
    stock: number
    movements: number
    requests: number
  }
}

/**
 * InventoryItem with relations
 */
export interface InventoryItemWithRelations extends InventoryItem {
  company?: {
    id: string
    name: string
  }
  creator?: {
    id: string
    name: string
    email: string
  }
  stock?: InventoryStockWithLocation[]
  _count?: {
    stock: number
    movements: number
    requests: number
  }
  totalQuantity?: number
  totalAvailable?: number
  totalReserved?: number
}

/**
 * Base InventoryStock interface
 */
export interface InventoryStock {
  id: string
  inventoryItemId: string
  locationId: string
  locationType: LocationType
  locationName: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  aisle: string | null
  rack: string | null
  bin: string | null
  lastCountDate: string | null
  lastCountBy: string | null
  updatedAt: string
}

/**
 * InventoryStock with location details
 */
export interface InventoryStockWithLocation extends InventoryStock {
  inventoryItem?: {
    id: string
    code: string
    name: string
    unit: string
  }
  location?: {
    id: string
    name: string
    address: string | null
  } | null
  lastCounter?: {
    id: string
    name: string
  } | null
}

/**
 * Base WorkOrderInventoryRequest interface
 */
export interface WorkOrderInventoryRequest {
  id: string
  workOrderId: string
  inventoryItemId: string
  quantityRequested: number
  quantityApproved: number | null
  quantityDelivered: number
  sourceCompanyId: string | null
  sourceLocationId: string | null
  sourceLocationType: LocationType | null
  destinationLocationId: string | null
  destinationLocationType: LocationType | null
  status: InventoryRequestStatus
  requestedBy: string
  requestedAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNotes: string | null
  deliveredBy: string | null
  deliveredAt: string | null
  notes: string | null
  urgency: RequestUrgency
  createdAt: string
  updatedAt: string
}

/**
 * WorkOrderInventoryRequest with relations
 */
export interface WorkOrderInventoryRequestWithRelations extends WorkOrderInventoryRequest {
  workOrder?: {
    id: string
    number: string
    title: string
    status: string
  }
  inventoryItem?: {
    id: string
    code: string
    name: string
    unit: string
    images: string[]
  }
  sourceCompany?: {
    id: string
    name: string
  } | null
  sourceLocation?: {
    id: string
    name: string
  } | null
  destinationLocation?: {
    id: string
    name: string
  } | null
  requester?: {
    id: string
    name: string
    email: string
    role: Role
  }
  reviewer?: {
    id: string
    name: string
    email: string
    role: Role
  } | null
  deliverer?: {
    id: string
    name: string
    email: string
  } | null
}

/**
 * Base InventoryMovement interface
 */
export interface InventoryMovement {
  id: string
  type: MovementType
  inventoryItemId: string
  fromLocationId: string | null
  fromLocationType: LocationType | null
  fromCompanyId: string | null
  toLocationId: string | null
  toLocationType: LocationType | null
  toCompanyId: string | null
  quantity: number
  unitCost: number | null
  totalCost: number | null
  workOrderId: string | null
  requestId: string | null
  purchaseOrderId: string | null
  reason: string | null
  notes: string | null
  documentNumber: string | null
  createdBy: string
  approvedBy: string | null
  createdAt: string
}

/**
 * InventoryMovement with relations
 */
export interface InventoryMovementWithRelations extends InventoryMovement {
  inventoryItem?: {
    id: string
    code: string
    name: string
    unit: string
  }
  fromCompany?: {
    id: string
    name: string
  } | null
  toCompany?: {
    id: string
    name: string
  } | null
  fromLocation?: {
    id: string
    name: string
  } | null
  toLocation?: {
    id: string
    name: string
  } | null
  workOrder?: {
    id: string
    number: string
    title: string
  } | null
  request?: {
    id: string
    status: InventoryRequestStatus
  } | null
  creator?: {
    id: string
    name: string
    email: string
  }
  approver?: {
    id: string
    name: string
    email: string
  } | null
}

/**
 * Create inventory item data
 */
export interface CreateInventoryItemData {
  code: string
  name: string
  description?: string
  category?: string
  subcategory?: string
  manufacturer?: string
  model?: string
  partNumber?: string
  unit?: string
  minStock?: number
  maxStock?: number
  reorderPoint?: number
  unitCost?: number
  lastPurchasePrice?: number
  averageCost?: number
  images?: string[]
  // Initial stock by location
  initialStock?: {
    locationId: string
    locationType: LocationType
    quantity: number
  }[]
}

/**
 * Update inventory item data
 */
export interface UpdateInventoryItemData {
  code?: string
  name?: string
  description?: string
  category?: string
  subcategory?: string
  manufacturer?: string
  model?: string
  partNumber?: string
  unit?: string
  minStock?: number
  maxStock?: number
  reorderPoint?: number
  unitCost?: number
  lastPurchasePrice?: number
  averageCost?: number
  images?: string[]
  isActive?: boolean
}

/**
 * Create inventory stock data
 */
export interface CreateInventoryStockData {
  inventoryItemId: string
  locationId: string
  locationType: LocationType
  locationName: string
  quantity: number
  aisle?: string
  rack?: string
  bin?: string
}

/**
 * Update inventory stock data
 */
export interface UpdateInventoryStockData {
  quantity?: number
  reservedQuantity?: number
  availableQuantity?: number
  aisle?: string
  rack?: string
  bin?: string
  lastCountDate?: Date
}

/**
 * Create inventory request data
 */
export interface CreateInventoryRequestData {
  workOrderId: string
  inventoryItemId: string
  quantityRequested: number
  sourceLocationId: string // Required - technician specifies source
  sourceLocationType: LocationType // Required - technician specifies source
  sourceCompanyId?: string // For inter-company transfers
  destinationLocationId?: string
  destinationLocationType?: LocationType
  notes?: string
  urgency?: RequestUrgency
}

/**
 * Update inventory request data
 */
export interface UpdateInventoryRequestData {
  quantityRequested?: number
  sourceLocationId?: string
  sourceLocationType?: LocationType
  destinationLocationId?: string
  destinationLocationType?: LocationType
  notes?: string
  urgency?: RequestUrgency
}

/**
 * Approve/Reject inventory request data
 */
export interface ReviewInventoryRequestData {
  status: "APPROVED" | "REJECTED"
  quantityApproved?: number
  reviewNotes?: string
  sourceLocationId?: string
  sourceLocationType?: LocationType
}

/**
 * Deliver inventory request data
 */
export interface DeliverInventoryRequestData {
  quantityDelivered: number
  notes?: string
}

/**
 * Create inventory movement data
 */
export interface CreateInventoryMovementData {
  type: MovementType
  inventoryItemId: string
  fromLocationId?: string
  fromLocationType?: LocationType
  fromCompanyId?: string
  toLocationId?: string
  toLocationType?: LocationType
  toCompanyId?: string
  quantity: number
  unitCost?: number
  totalCost?: number
  workOrderId?: string
  requestId?: string
  purchaseOrderId?: string
  reason?: string
  notes?: string
  documentNumber?: string
}

/**
 * Inventory item filters
 */
export interface InventoryItemFilters {
  category?: string
  subcategory?: string
  manufacturer?: string
  companyId?: string
  locationId?: string
  locationType?: LocationType
  belowMinStock?: boolean
  belowReorderPoint?: boolean
  search?: string
  isActive?: boolean
}

/**
 * Inventory request filters
 */
export interface InventoryRequestFilters {
  workOrderId?: string
  inventoryItemId?: string
  status?: InventoryRequestStatus
  urgency?: RequestUrgency
  requestedBy?: string
  sourceCompanyId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

/**
 * Inventory movement filters
 */
export interface InventoryMovementFilters {
  movementType?: MovementType
  inventoryItemId?: string
  fromCompanyId?: string
  toCompanyId?: string
  locationId?: string
  locationType?: LocationType
  workOrderId?: string
  startDate?: string
  endDate?: string
  search?: string
}

/**
 * Paginated inventory items response
 */
export interface PaginatedInventoryItemsResponse {
  items: InventoryItemWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Paginated inventory requests response
 */
export interface PaginatedInventoryRequestsResponse {
  requests: WorkOrderInventoryRequestWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Paginated inventory movements response
 */
export interface PaginatedInventoryMovementsResponse {
  movements: InventoryMovementWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Inventory statistics
 */
export interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  belowReorderPoint: number
  outOfStock: number
  byCategory: Record<string, number>
  byLocation: Record<string, {
    quantity: number
    value: number
  }>
}

/**
 * Inventory request statistics
 */
export interface InventoryRequestStats {
  total: number
  byStatus: Record<InventoryRequestStatus, number>
  byUrgency: Record<RequestUrgency, number>
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  averageApprovalTime: number // in hours
}

/**
 * Inventory movement statistics
 */
export interface InventoryMovementStats {
  total: number
  byType: Record<MovementType, number>
  totalValueIn: number
  totalValueOut: number
  byPeriod: {
    date: string
    in: number
    out: number
    transfers: number
  }[]
}

/**
 * Stock adjustment data
 */
export interface StockAdjustmentData {
  inventoryItemId: string
  locationId: string
  locationType: LocationType
  newQuantity: number
  reason: string
  notes?: string
}

/**
 * Transfer stock data (between locations/companies)
 */
export interface TransferStockData {
  inventoryItemId: string
  fromLocationId: string
  fromLocationType: LocationType
  fromCompanyId?: string
  toLocationId: string
  toLocationType: LocationType
  toCompanyId?: string
  quantity: number
  reason?: string
  notes?: string
  documentNumber?: string
}

/**
 * Bulk import inventory items data
 */
export interface BulkImportInventoryData {
  items: CreateInventoryItemData[]
}

/**
 * Inventory valuation report
 */
export interface InventoryValuationReport {
  totalItems: number
  totalQuantity: number
  totalValue: number
  byCategory: {
    category: string
    itemCount: number
    totalQuantity: number
    totalValue: number
  }[]
  byLocation: {
    locationId: string
    locationName: string
    locationType: LocationType
    itemCount: number
    totalQuantity: number
    totalValue: number
  }[]
}

/**
 * Low stock alert
 */
export interface LowStockAlert {
  inventoryItem: {
    id: string
    code: string
    name: string
    minStock: number
    reorderPoint: number
  }
  currentStock: number
  alertType: "BELOW_MIN" | "BELOW_REORDER" | "OUT_OF_STOCK"
  locations: {
    locationId: string
    locationName: string
    locationType: LocationType
    quantity: number
  }[]
}
