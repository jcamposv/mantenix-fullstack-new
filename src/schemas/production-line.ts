import * as z from "zod"

/**
 * Schema for creating/updating production line
 */
export const productionLineSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  code: z.string().min(1, "El código es requerido"),
  description: z.string().optional(),
  siteId: z.string().min(1, "La sede es requerida"),
  targetThroughput: z.number().positive("El throughput debe ser positivo").optional(),
  taktTime: z.number().positive("El takt time debe ser positivo").optional(),
  flowConfiguration: z.any().optional(), // JSON for React Flow
})

export type ProductionLineFormData = z.infer<typeof productionLineSchema>

/**
 * Schema for adding asset to production line
 */
export const productionLineAssetSchema = z.object({
  productionLineId: z.string().min(1, "El ID de la línea es requerido"),
  assetId: z.string().min(1, "El ID del activo es requerido"),
  sequence: z.number().int().positive("La secuencia debe ser un número positivo"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  cycleTime: z.number().positive("El cycle time debe ser positivo").optional(),
  capacity: z.number().positive("La capacidad debe ser positiva").optional(),
  nodeType: z.enum(["machine", "buffer", "quality-check", "conveyor"]).default("machine"),
})

export type ProductionLineAssetData = z.infer<typeof productionLineAssetSchema>

/**
 * Schema for updating asset position in React Flow
 */
export const updateAssetPositionSchema = z.object({
  productionLineId: z.string().min(1),
  assetId: z.string().min(1),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
})

export type UpdateAssetPositionData = z.infer<typeof updateAssetPositionSchema>

/**
 * Node type options for React Flow visualization
 */
export const NODE_TYPE_OPTIONS = [
  {
    value: "machine" as const,
    label: "Máquina",
    description: "Equipo de producción",
    icon: "Cog",
    color: "blue",
  },
  {
    value: "buffer" as const,
    label: "Buffer",
    description: "Área de almacenamiento temporal",
    icon: "Package",
    color: "gray",
  },
  {
    value: "quality-check" as const,
    label: "Control de Calidad",
    description: "Punto de inspección",
    icon: "CheckSquare",
    color: "green",
  },
  {
    value: "conveyor" as const,
    label: "Transportador",
    description: "Sistema de transporte",
    icon: "MoveRight",
    color: "purple",
  },
] as const

/**
 * Get node type option by value
 */
export function getNodeTypeOption(nodeType: string) {
  return NODE_TYPE_OPTIONS.find(option => option.value === nodeType)
}

/**
 * Production line filters
 */
export const productionLineFiltersSchema = z.object({
  siteId: z.string().optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type ProductionLineFilters = z.infer<typeof productionLineFiltersSchema>
