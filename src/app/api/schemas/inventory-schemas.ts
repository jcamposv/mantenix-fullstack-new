import { z } from "zod"

/**
 * Schema para crear un ítem de inventario
 */
export const createInventoryItemSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, "La unidad es requerida"),
  unitCost: z.number().min(0, "El costo unitario debe ser mayor o igual a 0"),
  minStock: z.number().int().min(0, "El stock mínimo debe ser mayor o igual a 0"),
  maxStock: z.number().int().min(0, "El stock máximo debe ser mayor o igual a 0").optional(),
  companyId: z.string().min(1, "El ID de la empresa es requerido")
})

/**
 * Schema para actualizar un ítem de inventario
 */
export const updateInventoryItemSchema = z.object({
  code: z.string().min(1, "El código es requerido").optional(),
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, "La unidad es requerida").optional(),
  unitCost: z.number().min(0, "El costo unitario debe ser mayor o igual a 0").optional(),
  minStock: z.number().int().min(0, "El stock mínimo debe ser mayor o igual a 0").optional(),
  maxStock: z.number().int().min(0, "El stock máximo debe ser mayor o igual a 0").optional(),
  isActive: z.boolean().optional()
})

/**
 * Schema para filtros de ítems de inventario
 */
export const inventoryItemFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  companyId: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional()
})

/**
 * Schema para ajustar stock de un ítem
 */
export const adjustInventoryStockSchema = z.object({
  inventoryItemId: z.string().min(1, "El ID del ítem es requerido"),
  locationId: z.string().min(1, "El ID de la ubicación es requerido"),
  locationType: z.enum(["WAREHOUSE", "VEHICLE", "SITE"], {
    message: "Tipo de ubicación inválido"
  }),
  newQuantity: z.number().int().min(0, "La cantidad debe ser mayor o igual a 0"),
  reason: z.string().min(1, "El motivo es requerido"),
  notes: z.string().optional()
})

/**
 * Schema para transferir stock entre ubicaciones
 */
export const transferInventoryStockSchema = z.object({
  inventoryItemId: z.string().min(1, "El ID del ítem es requerido"),
  fromLocationId: z.string().min(1, "El ID de la ubicación origen es requerido"),
  fromLocationType: z.enum(["WAREHOUSE", "VEHICLE", "SITE"], {
    message: "Tipo de ubicación origen inválido"
  }),
  toLocationId: z.string().min(1, "El ID de la ubicación destino es requerido"),
  toLocationType: z.enum(["WAREHOUSE", "VEHICLE", "SITE"], {
    message: "Tipo de ubicación destino inválido"
  }),
  quantity: z.number().int().min(1, "La cantidad debe ser mayor a 0"),
  reason: z.string().min(1, "El motivo es requerido"),
  notes: z.string().optional()
})

/**
 * Schema para crear una solicitud de inventario
 */
export const createInventoryRequestSchema = z.object({
  workOrderId: z.string().min(1, "El ID de la orden de trabajo es requerido"),
  inventoryItemId: z.string().min(1, "El ID del ítem es requerido"),
  requestedQuantity: z.number().int().min(1, "La cantidad debe ser mayor a 0"),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    message: "Nivel de urgencia inválido"
  }).optional().default("MEDIUM"),
  notes: z.string().optional()
})

/**
 * Schema para actualizar una solicitud de inventario
 */
export const updateInventoryRequestSchema = z.object({
  requestedQuantity: z.number().int().min(1, "La cantidad debe ser mayor a 0").optional(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    message: "Nivel de urgencia inválido"
  }).optional(),
  notes: z.string().optional()
})

/**
 * Schema para aprobar una solicitud de inventario
 */
export const approveInventoryRequestSchema = z.object({
  approvedQuantity: z.number().int().min(1, "La cantidad aprobada debe ser mayor a 0"),
  fromLocationId: z.string().min(1, "El ID de la ubicación es requerido"),
  fromLocationType: z.enum(["WAREHOUSE", "VEHICLE", "SITE"], {
    message: "Tipo de ubicación inválido"
  }),
  notes: z.string().optional()
})

/**
 * Schema para rechazar una solicitud de inventario
 */
export const rejectInventoryRequestSchema = z.object({
  notes: z.string().min(1, "Debe proporcionar un motivo para el rechazo")
})

/**
 * Schema para marcar como entregada una solicitud
 */
export const deliverInventoryRequestSchema = z.object({
  notes: z.string().optional()
})

/**
 * Schema para filtros de solicitudes de inventario
 */
export const inventoryRequestFiltersSchema = z.object({
  workOrderId: z.string().optional(),
  inventoryItemId: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "DELIVERED"]).optional(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional()
})

/**
 * Schema para filtros de movimientos de inventario
 */
export const inventoryMovementFiltersSchema = z.object({
  inventoryItemId: z.string().optional(),
  movementType: z.enum(["IN", "OUT", "TRANSFER", "ADJUSTMENT"]).optional(),
  locationId: z.string().optional(),
  locationType: z.enum(["WAREHOUSE", "VEHICLE", "SITE"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional()
})
