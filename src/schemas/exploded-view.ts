/**
 * Exploded View Schemas
 *
 * Schemas de validación con Zod para vistas explosionadas
 * Siguiendo Next.js Expert standards:
 * - Usar Zod para todas las validaciones
 * - Mensajes de error claros y en español
 * - Validaciones de negocio incluidas
 */

import { z } from 'zod';

// ============================================================================
// COORDENADAS DE HOTSPOTS
// ============================================================================

/**
 * Schema para un punto 2D
 */
const pointSchema = z.object({
  x: z.number().min(0, 'La coordenada X debe ser mayor o igual a 0'),
  y: z.number().min(0, 'La coordenada Y debe ser mayor o igual a 0'),
});

/**
 * Schema para coordenadas de polígono
 */
const polygonCoordinatesSchema = z.object({
  points: z
    .array(pointSchema)
    .min(3, 'Un polígono debe tener al menos 3 puntos')
    .max(50, 'Un polígono no puede tener más de 50 puntos'),
});

/**
 * Schema para coordenadas de círculo
 */
const circleCoordinatesSchema = z.object({
  x: z.number().min(0, 'La coordenada X debe ser mayor o igual a 0'),
  y: z.number().min(0, 'La coordenada Y debe ser mayor o igual a 0'),
  radius: z
    .number()
    .min(1, 'El radio debe ser mayor a 0')
    .max(1000, 'El radio es demasiado grande'),
});

/**
 * Schema para coordenadas de rectángulo
 */
const rectangleCoordinatesSchema = z.object({
  x: z.number().min(0, 'La coordenada X debe ser mayor o igual a 0'),
  y: z.number().min(0, 'La coordenada Y debe ser mayor o igual a 0'),
  width: z
    .number()
    .min(1, 'El ancho debe ser mayor a 0')
    .max(5000, 'El ancho es demasiado grande'),
  height: z
    .number()
    .min(1, 'La altura debe ser mayor a 0')
    .max(5000, 'La altura es demasiado grande'),
});

// ============================================================================
// VISTA EXPLOSIONADA
// ============================================================================

/**
 * Schema para crear una vista explosionada
 */
export const createExplodedViewSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .nullable()
    .optional(),

  imageUrl: z
    .string()
    .url('Debe ser una URL válida')
    .min(1, 'La URL de la imagen es requerida'),

  imageWidth: z
    .number()
    .int('El ancho debe ser un número entero')
    .min(100, 'El ancho mínimo es 100 píxeles')
    .max(10000, 'El ancho máximo es 10000 píxeles'),

  imageHeight: z
    .number()
    .int('La altura debe ser un número entero')
    .min(100, 'La altura mínima es 100 píxeles')
    .max(10000, 'La altura máxima es 10000 píxeles'),

  order: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .default(0),

  assetId: z
    .string()
    .cuid('ID de activo inválido')
    .min(1, 'El ID del activo es requerido'),
});

export type CreateExplodedViewInput = z.infer<typeof createExplodedViewSchema>;

/**
 * Schema para actualizar una vista explosionada
 */
export const updateExplodedViewSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),

  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .nullable()
    .optional(),

  imageUrl: z
    .string()
    .url('Debe ser una URL válida')
    .optional(),

  imageWidth: z
    .number()
    .int('El ancho debe ser un número entero')
    .min(100, 'El ancho mínimo es 100 píxeles')
    .max(10000, 'El ancho máximo es 10000 píxeles')
    .optional(),

  imageHeight: z
    .number()
    .int('La altura debe ser un número entero')
    .min(100, 'La altura mínima es 100 píxeles')
    .max(10000, 'La altura máxima es 10000 píxeles')
    .optional(),

  order: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .optional(),

  isActive: z.boolean().optional(),
});

export type UpdateExplodedViewInput = z.infer<typeof updateExplodedViewSchema>;

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Schema para crear un componente
 */
export const createComponentSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres'),

  partNumber: z
    .string()
    .max(100, 'El número de parte no puede exceder 100 caracteres')
    .nullable()
    .optional(),

  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .nullable()
    .optional(),

  manufacturer: z
    .string()
    .max(200, 'El fabricante no puede exceder 200 caracteres')
    .nullable()
    .optional(),

  specifications: z
    .record(z.string(), z.unknown())
    .nullable()
    .optional(),

  manualUrl: z
    .string()
    .url('Debe ser una URL válida')
    .nullable()
    .optional(),

  installationUrl: z
    .string()
    .url('Debe ser una URL válida')
    .nullable()
    .optional(),

  imageUrl: z
    .string()
    .url('Debe ser una URL válida')
    .nullable()
    .optional(),

  inventoryItemId: z
    .string()
    .cuid('ID de item de inventario inválido')
    .nullable()
    .optional(),
});

export type CreateComponentInput = z.infer<typeof createComponentSchema>;

/**
 * Schema para actualizar un componente
 */
export const updateComponentSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .optional(),

  partNumber: z
    .string()
    .max(100, 'El número de parte no puede exceder 100 caracteres')
    .nullable()
    .optional(),

  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .nullable()
    .optional(),

  manufacturer: z
    .string()
    .max(200, 'El fabricante no puede exceder 200 caracteres')
    .nullable()
    .optional(),

  specifications: z
    .record(z.string(), z.unknown())
    .nullable()
    .optional(),

  manualUrl: z
    .string()
    .url('Debe ser una URL válida')
    .nullable()
    .optional(),

  installationUrl: z
    .string()
    .url('Debe ser una URL válida')
    .nullable()
    .optional(),

  imageUrl: z
    .string()
    .url('Debe ser una URL válida')
    .nullable()
    .optional(),

  inventoryItemId: z
    .string()
    .cuid('ID de item de inventario inválido')
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

export type UpdateComponentInput = z.infer<typeof updateComponentSchema>;

// ============================================================================
// HOTSPOT
// ============================================================================

/**
 * Schema para crear un hotspot
 */
export const createHotspotSchema = z.object({
  label: z
    .string()
    .min(1, 'El label es requerido')
    .max(50, 'El label no puede exceder 50 caracteres'),

  type: z.enum(['polygon', 'circle', 'rectangle'], {
    message: 'Tipo de hotspot inválido',
  }),

  coordinates: z.union([
    polygonCoordinatesSchema,
    circleCoordinatesSchema,
    rectangleCoordinatesSchema,
  ]),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Debe ser un color hex válido (ej: #FF0000)')
    .default('#3B82F6'),

  opacity: z
    .number()
    .min(0, 'La opacidad mínima es 0')
    .max(1, 'La opacidad máxima es 1')
    .default(0.3),

  order: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .default(0),

  viewId: z
    .string()
    .cuid('ID de vista inválido')
    .min(1, 'El ID de la vista es requerido'),

  componentId: z
    .string()
    .cuid('ID de componente inválido')
    .min(1, 'El ID del componente es requerido'),
});

export type CreateHotspotInput = z.infer<typeof createHotspotSchema>;

/**
 * Schema para actualizar un hotspot
 */
export const updateHotspotSchema = z.object({
  label: z
    .string()
    .min(1, 'El label es requerido')
    .max(50, 'El label no puede exceder 50 caracteres')
    .optional(),

  type: z
    .enum(['polygon', 'circle', 'rectangle'], {
      message: 'Tipo de hotspot inválido',
    })
    .optional(),

  coordinates: z
    .union([
      polygonCoordinatesSchema,
      circleCoordinatesSchema,
      rectangleCoordinatesSchema,
    ])
    .optional(),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Debe ser un color hex válido (ej: #FF0000)')
    .optional(),

  opacity: z
    .number()
    .min(0, 'La opacidad mínima es 0')
    .max(1, 'La opacidad máxima es 1')
    .optional(),

  order: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .optional(),

  componentId: z
    .string()
    .cuid('ID de componente inválido')
    .optional(),

  isActive: z.boolean().optional(),
});

export type UpdateHotspotInput = z.infer<typeof updateHotspotSchema>;

// ============================================================================
// FILTROS
// ============================================================================

/**
 * Schema para filtros de vistas explosionadas
 */
export const explodedViewFiltersSchema = z.object({
  assetId: z.string().cuid('ID de activo inválido').optional(),
  search: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type ExplodedViewFiltersInput = z.infer<typeof explodedViewFiltersSchema>;

/**
 * Schema para filtros de componentes
 */
export const componentFiltersSchema = z.object({
  search: z.string().max(100).optional(),
  manufacturer: z.string().max(200).optional(),
  hasInventoryItem: z.boolean().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type ComponentFiltersInput = z.infer<typeof componentFiltersSchema>;

// ============================================================================
// UPLOAD DE IMAGEN
// ============================================================================

/**
 * Schema para validar metadata de imagen subida
 */
export const uploadImageMetadataSchema = z.object({
  filename: z.string().min(1, 'El nombre del archivo es requerido'),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/, 'Tipo de archivo no soportado'),
  size: z
    .number()
    .int()
    .min(1, 'El tamaño del archivo debe ser mayor a 0')
    .max(10 * 1024 * 1024, 'El archivo no puede exceder 10MB'),
  width: z
    .number()
    .int()
    .min(100, 'El ancho mínimo es 100 píxeles')
    .max(10000, 'El ancho máximo es 10000 píxeles'),
  height: z
    .number()
    .int()
    .min(100, 'La altura mínima es 100 píxeles')
    .max(10000, 'La altura máxima es 10000 píxeles'),
});

export type UploadImageMetadataInput = z.infer<typeof uploadImageMetadataSchema>;

// ============================================================================
// BULK OPERATIONS (para operaciones masivas)
// ============================================================================

/**
 * Schema para importar múltiples componentes desde CSV/JSON
 */
export const bulkImportComponentsSchema = z.object({
  components: z.array(createComponentSchema).min(1).max(100),
});

export type BulkImportComponentsInput = z.infer<typeof bulkImportComponentsSchema>;

/**
 * Schema para duplicar una vista explosionada
 */
export const duplicateExplodedViewSchema = z.object({
  sourceViewId: z.string().cuid('ID de vista origen inválido'),
  newName: z.string().min(1, 'El nuevo nombre es requerido').max(100),
  includeHotspots: z.boolean().default(true),
});

export type DuplicateExplodedViewInput = z.infer<typeof duplicateExplodedViewSchema>;
