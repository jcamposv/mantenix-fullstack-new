import { z } from "zod"
import { AlertPriority, AlertType, AlertStatus } from "@prisma/client"

// Schema para crear alertas
export const createAlertSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título es muy largo"),
  description: z.string().min(1, "La descripción es requerida").max(2000, "La descripción es muy larga"),
  type: z.nativeEnum(AlertType, { errorMap: () => ({ message: "Tipo de alerta inválido" }) }),
  priority: z.nativeEnum(AlertPriority, { errorMap: () => ({ message: "Prioridad inválida" }) }),
  location: z.string().max(200, "La ubicación es muy larga").optional(),
  equipmentId: z.string().max(100, "ID de equipo muy largo").optional(),
  images: z.array(z.string().url("URL de imagen inválida")).optional().default([]),
  documents: z.array(z.string().url("URL de documento inválida")).optional().default([]),
  estimatedResolutionTime: z.number().positive("El tiempo estimado debe ser positivo").optional(),
  siteId: z.string().optional()
})

// Schema para actualizar alertas
export const updateAlertSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  type: z.nativeEnum(AlertType).optional(),
  priority: z.nativeEnum(AlertPriority).optional(),
  status: z.nativeEnum(AlertStatus).optional(),
  location: z.string().max(200).optional(),
  equipmentId: z.string().max(100).optional(),
  images: z.array(z.string().url()).optional(),
  documents: z.array(z.string().url()).optional(),
  estimatedResolutionTime: z.number().positive().optional(),
  actualResolutionTime: z.number().positive().optional(),
  resolutionNotes: z.string().max(2000).optional(),
  assignedToId: z.string().optional()
})

// Schema para filtros de alertas
export const alertFiltersSchema = z.object({
  siteId: z.string().optional(),
  status: z.nativeEnum(AlertStatus).optional(),
  priority: z.nativeEnum(AlertPriority).optional(),
  type: z.nativeEnum(AlertType).optional(),
  my: z.enum(['reported', 'assigned']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

// Types derivados de los schemas
export type CreateAlertInput = z.infer<typeof createAlertSchema>
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>
export type AlertFilters = z.infer<typeof alertFiltersSchema>