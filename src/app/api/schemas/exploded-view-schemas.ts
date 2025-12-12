/**
 * API Schemas for Exploded Views
 *
 * Re-exports and adapts validation schemas for API endpoints.
 * These schemas handle query parameters, request bodies, and filters.
 */

import { z } from "zod"
import {
  createExplodedViewSchema,
  updateExplodedViewSchema,
  createComponentSchema,
  updateComponentSchema,
  createHotspotSchema,
  updateHotspotSchema,
  explodedViewFiltersSchema,
  componentFiltersSchema,
} from "@/schemas/exploded-view"

// ============================================================================
// EXPLODED VIEWS
// ============================================================================

export const createExplodedViewAPISchema = createExplodedViewSchema

export const updateExplodedViewAPISchema = updateExplodedViewSchema

export const explodedViewFiltersAPISchema = explodedViewFiltersSchema.extend({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  isActive: z.string().transform((val) => val === 'true').optional(),
})

// ============================================================================
// COMPONENTS
// ============================================================================

export const createComponentAPISchema = createComponentSchema

export const updateComponentAPISchema = updateComponentSchema

export const componentFiltersAPISchema = componentFiltersSchema.extend({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
  hasInventoryItem: z.string().transform((val) => val === 'true').optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
})

// ============================================================================
// HOTSPOTS
// ============================================================================

export const createHotspotAPISchema = createHotspotSchema

export const updateHotspotAPISchema = updateHotspotSchema

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateExplodedViewAPIInput = z.infer<typeof createExplodedViewAPISchema>
export type UpdateExplodedViewAPIInput = z.infer<typeof updateExplodedViewAPISchema>
export type ExplodedViewFiltersAPIInput = z.infer<typeof explodedViewFiltersAPISchema>

export type CreateComponentAPIInput = z.infer<typeof createComponentAPISchema>
export type UpdateComponentAPIInput = z.infer<typeof updateComponentAPISchema>
export type ComponentFiltersAPIInput = z.infer<typeof componentFiltersAPISchema>

export type CreateHotspotAPIInput = z.infer<typeof createHotspotAPISchema>
export type UpdateHotspotAPIInput = z.infer<typeof updateHotspotAPISchema>
