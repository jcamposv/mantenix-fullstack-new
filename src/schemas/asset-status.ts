import * as z from "zod"

/**
 * Schema for changing asset status
 * Used by OPERARIO, TECNICO, and admin roles
 */
export const changeAssetStatusSchema = z.object({
  assetId: z.string().min(1, "El ID del activo es requerido"),
  status: z.enum(["OPERATIVO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"], {
    message: "Estado inválido",
  }),
  reason: z.string().optional(),
  notes: z.string().optional(),
  workOrderId: z.string().optional(), // Optional link to work order
})

export type ChangeAssetStatusData = z.infer<typeof changeAssetStatusSchema>

/**
 * Schema for asset status history filters
 */
export const assetStatusHistoryFiltersSchema = z.object({
  assetId: z.string().optional(),
  status: z.enum(["OPERATIVO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  changedBy: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type AssetStatusHistoryFilters = z.infer<typeof assetStatusHistoryFiltersSchema>

/**
 * Asset status options with metadata
 */
export const ASSET_STATUS_OPTIONS = [
  {
    value: "OPERATIVO" as const,
    label: "Operativo",
    description: "Activo funcionando normalmente",
    color: "green",
    icon: "CheckCircle",
  },
  {
    value: "EN_MANTENIMIENTO" as const,
    label: "En Mantenimiento",
    description: "En proceso de mantenimiento",
    color: "yellow",
    icon: "Wrench",
  },
  {
    value: "FUERA_DE_SERVICIO" as const,
    label: "Fuera de Servicio",
    description: "No disponible para uso",
    color: "red",
    icon: "XCircle",
  },
] as const

/**
 * Get status option by value
 */
export function getAssetStatusOption(status: string) {
  return ASSET_STATUS_OPTIONS.find(option => option.value === status)
}

/**
 * Status change reasons (common options for dropdown)
 */
export const STATUS_CHANGE_REASONS = {
  TO_MAINTENANCE: [
    "Mantenimiento preventivo programado",
    "Mantenimiento correctivo requerido",
    "Falla detectada",
    "Inspección de rutina",
    "Calibración requerida",
    "Otro (especificar en notas)",
  ],
  TO_OPERATIONAL: [
    "Mantenimiento completado",
    "Reparación completada",
    "Pruebas exitosas",
    "Calibración completada",
    "Limpieza completada",
    "Otro (especificar en notas)",
  ],
  TO_OUT_OF_SERVICE: [
    "Falla crítica",
    "Esperando repuestos",
    "Esperando aprobación",
    "Fin de vida útil",
    "Condiciones inseguras",
    "Otro (especificar en notas)",
  ],
} as const
