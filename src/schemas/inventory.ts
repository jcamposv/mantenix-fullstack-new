import * as z from "zod"

/**
 * Schema para formulario de inventory item
 */
export const inventoryItemSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  partNumber: z.string().optional(),
  unit: z.string().min(1, "La unidad es requerida"),
  minStock: z.coerce.number().int().min(0, "El stock mínimo debe ser mayor o igual a 0").default(0),
  maxStock: z.coerce.number().int().min(0, "El stock máximo debe ser mayor o igual a 0").optional(),
  reorderPoint: z.coerce.number().int().min(0, "El punto de reorden debe ser mayor o igual a 0").default(0),
  unitCost: z.coerce.number().min(0, "El costo unitario debe ser mayor o igual a 0").optional(),
  lastPurchasePrice: z.coerce.number().min(0, "El último precio de compra debe ser mayor o igual a 0").optional(),
  images: z.array(z.string()).optional(),
  companyId: z.string().min(1, "La empresa es requerida"),
})

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>

/**
 * Schema para ajuste de stock
 */
export const adjustStockSchema = z.object({
  inventoryItemId: z.string().min(1, "El ítem es requerido"),
  locationId: z.string().min(1, "La ubicación es requerida"),
  locationType: z.enum(["WAREHOUSE", "VEHICLE", "SITE"], {
    message: "Tipo de ubicación inválido"
  }),
  newQuantity: z.coerce.number().int().min(0, "La cantidad debe ser mayor o igual a 0"),
  reason: z.string().min(1, "El motivo es requerido"),
  notes: z.string().optional(),
})

export type AdjustStockFormData = z.infer<typeof adjustStockSchema>

/**
 * Schema para transferencia de stock
 */
export const transferStockSchema = z.object({
  inventoryItemId: z.string().min(1, "El ítem es requerido"),
  fromLocationId: z.string().min(1, "La ubicación origen es requerida"),
  fromLocationType: z.enum(["WAREHOUSE", "VEHICLE", "SITE"], {
    message: "Tipo de ubicación origen inválido"
  }),
  toLocationId: z.string().min(1, "La ubicación destino es requerida"),
  toLocationType: z.enum(["WAREHOUSE", "VEHICLE", "SITE"], {
    message: "Tipo de ubicación destino inválido"
  }),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser mayor a 0"),
  reason: z.string().min(1, "El motivo es requerido"),
  notes: z.string().optional(),
})

export type TransferStockFormData = z.infer<typeof transferStockSchema>

/**
 * Schema para solicitud de inventario
 */
export const inventoryRequestSchema = z.object({
  workOrderId: z.string().min(1, "La orden de trabajo es requerida"),
  inventoryItemId: z.string().min(1, "El ítem es requerido"),
  requestedQuantity: z.coerce.number().int().min(1, "La cantidad debe ser mayor a 0"),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  notes: z.string().optional(),
})

export type InventoryRequestFormData = z.infer<typeof inventoryRequestSchema>

/**
 * Schema para aprobar solicitud de inventario
 */
export const approveRequestSchema = z.object({
  approvedQuantity: z.coerce.number().int().min(1, "La cantidad aprobada debe ser mayor a 0"),
  fromLocationId: z.string().min(1, "La ubicación es requerida"),
  fromLocationType: z.enum(["WAREHOUSE", "VEHICLE", "SITE"], {
    message: "Tipo de ubicación inválido"
  }),
  notes: z.string().optional(),
})

export type ApproveRequestFormData = z.infer<typeof approveRequestSchema>

/**
 * Schema para rechazar solicitud de inventario
 */
export const rejectRequestSchema = z.object({
  notes: z.string().min(1, "Debe proporcionar un motivo para el rechazo"),
})

export type RejectRequestFormData = z.infer<typeof rejectRequestSchema>

/**
 * Schema para company group
 */
export const companyGroupSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  shareInventory: z.boolean().default(true),
  autoApproveTransfers: z.boolean().default(false),
  companyIds: z.array(z.string()).optional(),
})

export type CompanyGroupFormData = z.infer<typeof companyGroupSchema>

/**
 * Opciones para tipo de ubicación
 */
export const LOCATION_TYPE_OPTIONS = [
  { value: "WAREHOUSE", label: "Bodega" },
  { value: "VEHICLE", label: "Vehículo" },
  { value: "SITE", label: "Sede" },
] as const

/**
 * Opciones para urgencia de solicitud
 */
export const REQUEST_URGENCY_OPTIONS = [
  { value: "LOW", label: "Baja", color: "bg-blue-500" },
  { value: "MEDIUM", label: "Media", color: "bg-yellow-500" },
  { value: "HIGH", label: "Alta", color: "bg-orange-500" },
  { value: "CRITICAL", label: "Crítica", color: "bg-red-500" },
] as const

/**
 * Opciones para estado de solicitud
 */
export const REQUEST_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente", color: "bg-gray-500" },
  { value: "APPROVED", label: "Aprobada", color: "bg-green-500" },
  { value: "REJECTED", label: "Rechazada", color: "bg-red-500" },
  { value: "DELIVERED", label: "Entregada", color: "bg-blue-500" },
] as const

/**
 * Opciones para tipo de movimiento
 */
export const MOVEMENT_TYPE_OPTIONS = [
  { value: "IN", label: "Entrada", icon: "ArrowDownCircle" },
  { value: "OUT", label: "Salida", icon: "ArrowUpCircle" },
  { value: "TRANSFER", label: "Transferencia", icon: "ArrowRightLeft" },
  { value: "ADJUSTMENT", label: "Ajuste", icon: "Settings" },
] as const

/**
 * Opciones comunes de unidades de medida
 */
export const UNIT_OPTIONS = [
  { value: "UN", label: "Unidad" },
  { value: "KG", label: "Kilogramo" },
  { value: "LB", label: "Libra" },
  { value: "L", label: "Litro" },
  { value: "GAL", label: "Galón" },
  { value: "M", label: "Metro" },
  { value: "M2", label: "Metro cuadrado" },
  { value: "M3", label: "Metro cúbico" },
  { value: "FT", label: "Pie" },
  { value: "IN", label: "Pulgada" },
  { value: "BOX", label: "Caja" },
  { value: "PAQ", label: "Paquete" },
  { value: "ROL", label: "Rollo" },
  { value: "SET", label: "Juego" },
] as const

/**
 * Categorías comunes de ítems de inventario
 */
export const INVENTORY_CATEGORY_OPTIONS = [
  { value: "herramientas", label: "Herramientas" },
  { value: "repuestos", label: "Repuestos" },
  { value: "consumibles", label: "Consumibles" },
  { value: "equipos", label: "Equipos" },
  { value: "materiales", label: "Materiales" },
  { value: "quimicos", label: "Químicos" },
  { value: "seguridad", label: "Seguridad" },
  { value: "electricos", label: "Eléctricos" },
  { value: "mecanicos", label: "Mecánicos" },
  { value: "otros", label: "Otros" },
] as const
