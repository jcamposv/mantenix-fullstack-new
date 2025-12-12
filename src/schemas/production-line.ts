import { z } from 'zod'

/**
 * Production Line Validation Schemas
 * Following Next.js Expert: Always validate with Zod schemas
 */

// Node types for production line assets
export const nodeTypeSchema = z.enum([
  'machine',
  'buffer',
  'quality-check',
  'conveyor',
])

// Position schema for React Flow
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

// Flow node data schema
export const nodeDataSchema = z.object({
  label: z.string().min(1),
  assetId: z.string().min(1),
  assetCode: z.string().min(1),
  status: z.enum(['OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO']),
  cycleTime: z.number().optional(),
  capacity: z.number().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
})

// Flow node schema
export const flowNodeSchema = z.object({
  id: z.string().min(1),
  type: nodeTypeSchema,
  position: positionSchema,
  data: nodeDataSchema,
})

// Flow edge schema
export const flowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.enum(['default', 'smoothstep', 'step', 'straight']).optional(),
  animated: z.boolean().optional(),
})

// Flow configuration schema
export const flowConfigurationSchema = z.object({
  nodes: z.array(flowNodeSchema),
  edges: z.array(flowEdgeSchema),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }).optional(),
})

// Create production line schema
export const createProductionLineSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  code: z.string().min(1, 'El código es requerido').max(50, 'El código no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9-_]+$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'),
  description: z.string().max(500).optional(),
  siteId: z.string().min(1, 'La sede es requerida'),
  targetThroughput: z.number().int().positive('El throughput debe ser positivo').optional(),
  taktTime: z.number().positive('El takt time debe ser positivo').optional(),
  unitPrice: z.number().positive('El precio por unidad debe ser positivo').optional(),
})

// Update production line schema
export const updateProductionLineSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(50).regex(/^[A-Z0-9-_]+$/).optional(),
  description: z.string().max(500).optional(),
  siteId: z.string().min(1).optional(),
  targetThroughput: z.number().int().positive().optional(),
  taktTime: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  flowConfiguration: flowConfigurationSchema.optional(),
  isActive: z.boolean().optional(),
})

// Add asset to line schema
export const addAssetToLineSchema = z.object({
  assetId: z.string().min(1, 'El activo es requerido'),
  sequence: z.number().int().min(1, 'La secuencia debe ser mayor a 0'),
  position: positionSchema.optional(),
  cycleTime: z.number().positive().optional(),
  capacity: z.number().int().positive().optional(),
  nodeType: nodeTypeSchema.optional(),
})

// Update asset in line schema
export const updateAssetInLineSchema = z.object({
  sequence: z.number().int().min(1).optional(),
  position: positionSchema.optional(),
  cycleTime: z.number().positive().optional(),
  capacity: z.number().int().positive().optional(),
  nodeType: nodeTypeSchema.optional(),
})

// Type exports
export type CreateProductionLineFormData = z.infer<typeof createProductionLineSchema>
export type UpdateProductionLineFormData = z.infer<typeof updateProductionLineSchema>
export type AddAssetToLineFormData = z.infer<typeof addAssetToLineSchema>
export type UpdateAssetInLineFormData = z.infer<typeof updateAssetInLineSchema>
export type FlowConfigurationFormData = z.infer<typeof flowConfigurationSchema>
export type NodeType = z.infer<typeof nodeTypeSchema>
