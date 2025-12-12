import { z } from "zod"

export const workOrderDetailSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["DRAFT", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  scheduledDate: z.string().optional(),
  estimatedDuration: z.number().positive().optional(),
  technicianIds: z.array(z.string()).default([]),
  customFieldValues: z.record(z.string(), z.unknown()).default({}),
})

export type WorkOrderDetailFormData = z.infer<typeof workOrderDetailSchema>

export const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
}

export const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  ASSIGNED: "Asignada",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
}

export const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}
