/**
 * Maintenance Management Validation Schemas
 *
 * Zod schemas for validating maintenance plan and task data
 * Following Next.js Expert standards with clear Spanish error messages
 */

import { z } from 'zod'

// ============================================================================
// ENUMS (matching Prisma schema)
// ============================================================================

export const maintenanceTypeEnum = z.enum(['PREVENTIVE', 'PREDICTIVE', 'CORRECTIVE', 'ROUTINE'], {
  message: 'Tipo de mantenimiento inválido',
})

export const frequencyUnitEnum = z.enum(['HOURS', 'DAYS', 'WEEKS', 'MONTHS', 'YEARS'], {
  message: 'Unidad de frecuencia inválida',
})

export const componentCriticalityEnum = z.enum(['A', 'B', 'C'], {
  message: 'Criticidad inválida',
})

// ============================================================================
// MAINTENANCE PLAN SCHEMAS
// ============================================================================

/**
 * Schema for creating a maintenance plan
 */
export const createMaintenancePlanSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres'),

  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .nullable()
    .optional(),

  type: maintenanceTypeEnum,

  frequencyValue: z
    .number()
    .int('La frecuencia debe ser un número entero')
    .min(1, 'La frecuencia debe ser mayor a 0')
    .max(10000, 'La frecuencia es demasiado grande'),

  frequencyUnit: frequencyUnitEnum,

  componentId: z
    .string()
    .cuid('ID de componente inválido')
    .min(1, 'El ID del componente es requerido'),

  estimatedDuration: z
    .number()
    .int('La duración estimada debe ser un número entero')
    .min(1, 'La duración debe ser mayor a 0')
    .max(10000, 'La duración es demasiado grande')
    .nullable()
    .optional(),

  estimatedCost: z
    .number()
    .min(0, 'El costo no puede ser negativo')
    .max(1000000, 'El costo es demasiado grande')
    .nullable()
    .optional(),

  requiredTools: z.array(z.string().max(200)).default([]),

  requiredMaterials: z.array(z.string().max(200)).default([]),

  safetyNotes: z
    .string()
    .max(2000, 'Las notas de seguridad no pueden exceder 2000 caracteres')
    .nullable()
    .optional(),
})

export type CreateMaintenancePlanInput = z.infer<typeof createMaintenancePlanSchema>

/**
 * Schema for updating a maintenance plan
 */
export const updateMaintenancePlanSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .optional(),

  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .nullable()
    .optional(),

  type: maintenanceTypeEnum.optional(),

  frequencyValue: z
    .number()
    .int('La frecuencia debe ser un número entero')
    .min(1, 'La frecuencia debe ser mayor a 0')
    .max(10000, 'La frecuencia es demasiado grande')
    .optional(),

  frequencyUnit: frequencyUnitEnum.optional(),

  estimatedDuration: z
    .number()
    .int('La duración estimada debe ser un número entero')
    .min(1, 'La duración debe ser mayor a 0')
    .max(10000, 'La duración es demasiado grande')
    .nullable()
    .optional(),

  estimatedCost: z
    .number()
    .min(0, 'El costo no puede ser negativo')
    .max(1000000, 'El costo es demasiado grande')
    .nullable()
    .optional(),

  requiredTools: z.array(z.string().max(200)).optional(),

  requiredMaterials: z.array(z.string().max(200)).optional(),

  safetyNotes: z
    .string()
    .max(2000, 'Las notas de seguridad no pueden exceder 2000 caracteres')
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),

  lastPerformedAt: z.coerce.date().nullable().optional(),

  nextScheduledAt: z.coerce.date().nullable().optional(),

  currentMeterReading: z
    .number()
    .min(0, 'La lectura del medidor no puede ser negativa')
    .optional(),
})

export type UpdateMaintenancePlanInput = z.infer<typeof updateMaintenancePlanSchema>

// ============================================================================
// MAINTENANCE TASK SCHEMAS
// ============================================================================

/**
 * Schema for creating a maintenance task
 */
export const createMaintenanceTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),

  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .nullable()
    .optional(),

  instructions: z
    .string()
    .max(5000, 'Las instrucciones no pueden exceder 5000 caracteres')
    .nullable()
    .optional(),

  order: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .default(0),

  estimatedDuration: z
    .number()
    .int('La duración estimada debe ser un número entero')
    .min(1, 'La duración debe ser mayor a 0')
    .max(10000, 'La duración es demasiado grande')
    .nullable()
    .optional(),

  requiresPhotoBefore: z.boolean().default(false),

  requiresPhotoAfter: z.boolean().default(false),

  requiresMeasurement: z.boolean().default(false),

  measurementUnit: z
    .string()
    .max(50, 'La unidad de medición no puede exceder 50 caracteres')
    .nullable()
    .optional(),

  acceptanceCriteria: z
    .string()
    .max(1000, 'Los criterios de aceptación no pueden exceder 1000 caracteres')
    .nullable()
    .optional(),

  planId: z
    .string()
    .cuid('ID de plan inválido')
    .min(1, 'El ID del plan es requerido'),
})

export type CreateMaintenanceTaskInput = z.infer<typeof createMaintenanceTaskSchema>

/**
 * Schema for updating a maintenance task
 */
export const updateMaintenanceTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres')
    .optional(),

  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .nullable()
    .optional(),

  instructions: z
    .string()
    .max(5000, 'Las instrucciones no pueden exceder 5000 caracteres')
    .nullable()
    .optional(),

  order: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .optional(),

  estimatedDuration: z
    .number()
    .int('La duración estimada debe ser un número entero')
    .min(1, 'La duración debe ser mayor a 0')
    .max(10000, 'La duración es demasiado grande')
    .nullable()
    .optional(),

  requiresPhotoBefore: z.boolean().optional(),

  requiresPhotoAfter: z.boolean().optional(),

  requiresMeasurement: z.boolean().optional(),

  measurementUnit: z
    .string()
    .max(50, 'La unidad de medición no puede exceder 50 caracteres')
    .nullable()
    .optional(),

  acceptanceCriteria: z
    .string()
    .max(1000, 'Los criterios de aceptación no pueden exceder 1000 caracteres')
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
})

export type UpdateMaintenanceTaskInput = z.infer<typeof updateMaintenanceTaskSchema>

// ============================================================================
// COMPONENT TECHNICAL SPECS SCHEMAS
// ============================================================================

/**
 * Schema for updating component hierarchy and technical data
 */
export const updateComponentTechnicalSchema = z.object({
  parentComponentId: z
    .string()
    .cuid('ID de componente padre inválido')
    .nullable()
    .optional(),

  hierarchyLevel: z
    .number()
    .int('El nivel jerárquico debe ser un número entero')
    .min(4, 'El nivel mínimo es 4 (Sistema)')
    .max(6, 'El nivel máximo es 6 (Componente)')
    .optional(),

  criticality: componentCriticalityEnum.nullable().optional(),

  lifeExpectancy: z
    .number()
    .int('La vida útil debe ser un número entero')
    .min(1, 'La vida útil debe ser mayor a 0')
    .max(1000000, 'La vida útil es demasiado grande')
    .nullable()
    .optional(),

  mtbf: z
    .number()
    .int('El MTBF debe ser un número entero')
    .min(1, 'El MTBF debe ser mayor a 0')
    .max(1000000, 'El MTBF es demasiado grande')
    .nullable()
    .optional(),

  mttr: z
    .number()
    .int('El MTTR debe ser un número entero')
    .min(1, 'El MTTR debe ser mayor a 0')
    .max(10000, 'El MTTR es demasiado grande')
    .nullable()
    .optional(),
})

export type UpdateComponentTechnicalInput = z.infer<typeof updateComponentTechnicalSchema>

// ============================================================================
// FILTERS SCHEMAS
// ============================================================================

/**
 * Schema for maintenance plan filters
 */
export const maintenancePlanFiltersSchema = z.object({
  componentId: z.string().cuid('ID de componente inválido').optional(),
  type: maintenanceTypeEnum.optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

export type MaintenancePlanFiltersInput = z.infer<typeof maintenancePlanFiltersSchema>

/**
 * Schema for maintenance task filters
 */
export const maintenanceTaskFiltersSchema = z.object({
  planId: z.string().cuid('ID de plan inválido').optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

export type MaintenanceTaskFiltersInput = z.infer<typeof maintenanceTaskFiltersSchema>

/**
 * Schema for component hierarchy filters
 */
export const componentHierarchyFiltersSchema = z.object({
  parentComponentId: z.string().cuid('ID de componente padre inválido').nullable().optional(),
  hierarchyLevel: z.number().int().min(4).max(6).optional(),
  criticality: componentCriticalityEnum.optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional(),
})

export type ComponentHierarchyFiltersInput = z.infer<typeof componentHierarchyFiltersSchema>
