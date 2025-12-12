import { z } from "zod"

/**
 * Schema simplificado para crear OT desde mobile
 * Solo campos esenciales para reportar problemas rápidamente
 */
export const workOrderMobileSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(255),
  description: z.string().min(1, "La descripción es requerida"),
  type: z.enum(["PREVENTIVO", "CORRECTIVO", "REPARACION"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assetId: z.string().optional(),
  siteId: z.string().optional(),
})

export type WorkOrderMobileFormData = z.infer<typeof workOrderMobileSchema>
