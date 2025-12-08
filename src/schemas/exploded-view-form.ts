/**
 * Exploded View Form Schemas
 *
 * Zod schemas for React Hook Form integration.
 * These schemas are used for form validation in the UI.
 */

import { z } from "zod"

// Re-export the base schemas from the main validation file
export {
  createExplodedViewSchema,
  updateExplodedViewSchema,
  createComponentSchema,
  updateComponentSchema,
  createHotspotSchema,
  updateHotspotSchema,
} from "./exploded-view"

// Form-specific schema for creating exploded views (with asset selector)
export const explodedViewFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url("Debe ser una URL válida").min(1, "La imagen es requerida"),
  imageWidth: z.number().int().min(100).max(10000),
  imageHeight: z.number().int().min(100).max(10000),
  order: z.number().int().min(0),
  assetId: z.string().min(1, "Debe seleccionar un activo"),
  isActive: z.boolean().optional(),
})

export type ExplodedViewFormData = z.infer<typeof explodedViewFormSchema>

// Form schema for components
export const componentFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  partNumber: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  manufacturer: z.string().max(200).optional().nullable(),

  // Jerarquía ISO 14224
  parentComponentId: z.string().cuid().optional().nullable(),
  hierarchyLevel: z.number().int().min(4).max(6),

  // Criticidad
  criticality: z.enum(["A", "B", "C"]).optional().nullable(),

  // Datos técnicos
  lifeExpectancy: z.number().int().min(1).max(1000000).optional().nullable(),
  mtbf: z.number().int().min(1).max(1000000).optional().nullable(),
  mttr: z.number().int().min(1).max(10000).optional().nullable(),

  // Mantenimiento programado híbrido (fabricante + predictivo)
  manufacturerMaintenanceInterval: z
    .number()
    .int("El intervalo debe ser un número entero")
    .min(1, "El intervalo debe ser mayor a 0")
    .max(100000, "El intervalo es demasiado grande")
    .optional()
    .nullable(),

  manufacturerMaintenanceIntervalUnit: z
    .enum(["HOURS", "DAYS", "WEEKS", "MONTHS", "YEARS"])
    .optional()
    .nullable(),

  mtbfAlertThreshold: z
    .number()
    .min(0.1, "El umbral mínimo es 0.1 (10%)")
    .max(1, "El umbral máximo es 1 (100%)")
    .optional()
    .nullable(),

  maintenanceStrategy: z
    .enum(["PREVENTIVE", "PREDICTIVE", "CORRECTIVE", "ROUTINE"])
    .optional()
    .nullable(),

  autoCreateSchedule: z.boolean().optional(),

  workOrderTemplateId: z.string().cuid().optional().nullable(),

  specifications: z.record(z.string(), z.unknown()).optional().nullable(),
  manualUrl: z.string().url("Debe ser una URL válida").optional().nullable(),
  installationUrl: z.string().url("Debe ser una URL válida").optional().nullable(),
  imageUrl: z.string().url("Debe ser una URL válida").optional().nullable(),
  inventoryItemId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().optional(),
})

export type ComponentFormData = z.infer<typeof componentFormSchema>

// Form schema for hotspots (with coordinate types)
export const hotspotFormSchema = z.object({
  label: z.string().min(1, "El label es requerido").max(50),
  type: z.enum(["polygon", "circle", "rectangle"]),
  coordinates: z.object({}).passthrough(), // Will be validated based on type
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#3B82F6"),
  opacity: z.number().min(0).max(1).default(0.3),
  order: z.number().int().min(0).default(0),
  componentId: z.string().min(1, "Debe seleccionar un componente"),
})

export type HotspotFormData = z.infer<typeof hotspotFormSchema>
