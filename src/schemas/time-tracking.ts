/**
 * Time Tracking Schemas
 *
 * Zod validation schemas for time tracking system
 */

import { z } from "zod"
import { TimeLogAction, PauseReason } from "@prisma/client"

/**
 * Geolocation Coordinates Schema
 */
export const geolocationCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  timestamp: z.number(),
})

export type GeolocationCoordinatesInput = z.infer<typeof geolocationCoordinatesSchema>

/**
 * Time Log Action Schema
 * Schema para crear un registro de tiempo
 */
export const timeLogActionSchema = z.object({
  workOrderId: z.string().cuid(),
  action: z.nativeEnum(TimeLogAction),
  pauseReason: z.nativeEnum(PauseReason).optional(),
  notes: z.string().max(500).optional(),
  location: geolocationCoordinatesSchema.optional(),
  timestamp: z.string().datetime().optional(), // Client timestamp for accuracy
})

export type TimeLogActionInput = z.infer<typeof timeLogActionSchema>

/**
 * Resume Work Schema
 * Schema específico para reanudar trabajo (requiere que esté pausado)
 */
export const resumeWorkSchema = z.object({
  workOrderId: z.string().cuid(),
  action: z.literal(TimeLogAction.RESUME),
  notes: z.string().max(500).optional(),
  location: geolocationCoordinatesSchema.optional(),
})

export type ResumeWorkInput = z.infer<typeof resumeWorkSchema>

/**
 * Pause Work Schema
 * Schema específico para pausar trabajo (requiere razón)
 */
export const pauseWorkSchema = z.object({
  workOrderId: z.string().cuid(),
  action: z.literal(TimeLogAction.PAUSE),
  pauseReason: z.nativeEnum(PauseReason),
  notes: z.string().max(500).optional(),
  location: geolocationCoordinatesSchema.optional(),
})

export type PauseWorkInput = z.infer<typeof pauseWorkSchema>

/**
 * Start Work Schema
 * Schema para iniciar trabajo
 */
export const startWorkSchema = z.object({
  workOrderId: z.string().cuid(),
  action: z.literal(TimeLogAction.START),
  notes: z.string().max(500).optional(),
  location: geolocationCoordinatesSchema.optional(),
})

export type StartWorkInput = z.infer<typeof startWorkSchema>

/**
 * Complete Work Schema
 * Schema para completar trabajo
 */
export const completeWorkSchema = z.object({
  workOrderId: z.string().cuid(),
  action: z.literal(TimeLogAction.COMPLETE),
  notes: z.string().max(500).optional(),
  location: geolocationCoordinatesSchema.optional(),
})

export type CompleteWorkInput = z.infer<typeof completeWorkSchema>

/**
 * Time Log Query Schema
 * Schema para consultar logs de tiempo
 */
export const timeLogQuerySchema = z.object({
  workOrderId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  action: z.nativeEnum(TimeLogAction).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

export type TimeLogQueryInput = z.infer<typeof timeLogQuerySchema>

/**
 * Time Summary Query Schema
 * Schema para obtener resumen de tiempo
 */
export const timeSummaryQuerySchema = z.object({
  workOrderId: z.string().cuid(),
})

export type TimeSummaryQueryInput = z.infer<typeof timeSummaryQuerySchema>

/**
 * Batch Time Log Query Schema
 * Schema para consultar logs de múltiples órdenes
 */
export const batchTimeLogQuerySchema = z.object({
  workOrderIds: z.array(z.string().cuid()).min(1).max(50),
})

export type BatchTimeLogQueryInput = z.infer<typeof batchTimeLogQuerySchema>

/**
 * Update Time Log Schema
 * Schema para actualizar un registro de tiempo existente
 */
export const updateTimeLogSchema = z.object({
  id: z.string().cuid(),
  notes: z.string().max(500).optional(),
  pauseReason: z.nativeEnum(PauseReason).optional(),
})

export type UpdateTimeLogInput = z.infer<typeof updateTimeLogSchema>

/**
 * Delete Time Log Schema
 * Schema para eliminar un registro de tiempo
 */
export const deleteTimeLogSchema = z.object({
  id: z.string().cuid(),
  reason: z.string().min(10).max(500), // Requiere justificación
})

export type DeleteTimeLogInput = z.infer<typeof deleteTimeLogSchema>

/**
 * Time Metrics Query Schema
 * Schema para obtener métricas de tiempo
 */
export const timeMetricsQuerySchema = z.object({
  workOrderId: z.string().cuid(),
  includeBreakdown: z.boolean().default(false),
})

export type TimeMetricsQueryInput = z.infer<typeof timeMetricsQuerySchema>

/**
 * Helper: Validate Time Log Action
 * Valida que la acción sea válida para el estado actual
 */
export function validateTimeLogAction(
  currentAction: TimeLogAction | null,
  newAction: TimeLogAction
): { valid: boolean; error?: string } {
  // Si no hay acción previa, solo puede iniciar
  if (currentAction === null) {
    if (newAction !== TimeLogAction.START) {
      return {
        valid: false,
        error: "Debe iniciar el trabajo antes de realizar otras acciones",
      }
    }
    return { valid: true }
  }

  // Si ya completó, no puede hacer nada más
  if (currentAction === TimeLogAction.COMPLETE) {
    return {
      valid: false,
      error: "El trabajo ya está completado",
    }
  }

  // Si está en START, puede PAUSE o COMPLETE
  if (currentAction === TimeLogAction.START) {
    if (newAction !== TimeLogAction.PAUSE && newAction !== TimeLogAction.COMPLETE) {
      return {
        valid: false,
        error: "Solo puede pausar o completar el trabajo",
      }
    }
    return { valid: true }
  }

  // Si está en PAUSE, solo puede RESUME
  if (currentAction === TimeLogAction.PAUSE) {
    if (newAction !== TimeLogAction.RESUME) {
      return {
        valid: false,
        error: "Debe reanudar el trabajo antes de realizar otras acciones",
      }
    }
    return { valid: true }
  }

  // Si está en RESUME, puede PAUSE o COMPLETE
  if (currentAction === TimeLogAction.RESUME) {
    if (newAction !== TimeLogAction.PAUSE && newAction !== TimeLogAction.COMPLETE) {
      return {
        valid: false,
        error: "Solo puede pausar o completar el trabajo",
      }
    }
    return { valid: true }
  }

  return { valid: true }
}
