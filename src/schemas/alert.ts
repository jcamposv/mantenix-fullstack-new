import * as z from "zod"

export const alertSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "El título es muy largo"),
  description: z.string().min(1, "La descripción es requerida").max(2000, "La descripción es muy larga"),
  type: z.enum([
    "EQUIPMENT_FAILURE",
    "MAINTENANCE_REQUIRED", 
    "PREVENTIVE_MAINTENANCE",
    "SAFETY_ISSUE",
    "SUPPLY_SHORTAGE",
    "ENVIRONMENTAL_ISSUE",
    "OPERATIONAL_ISSUE",
    "OTHER"
  ], { errorMap: () => ({ message: "Selecciona un tipo de alerta" }) }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], { 
    errorMap: () => ({ message: "Selecciona una prioridad" }) 
  }),
  location: z.string().max(200, "La ubicación es muy larga").optional(),
  equipmentId: z.string().max(100, "ID de equipo muy largo").optional(),
  estimatedResolutionTime: z.number().positive("El tiempo debe ser positivo").optional(),
  images: z.array(z.string()).optional(),
  siteId: z.string().min(1, "Debe seleccionar una sede").optional(),
})

export type AlertFormData = z.infer<typeof alertSchema>

export const alertTypes = [
  { value: "EQUIPMENT_FAILURE", label: "Falla de Equipo", icon: "🔧" },
  { value: "MAINTENANCE_REQUIRED", label: "Mantenimiento Requerido", icon: "⚙️" },
  { value: "PREVENTIVE_MAINTENANCE", label: "Mantenimiento Preventivo", icon: "🔍" },
  { value: "SAFETY_ISSUE", label: "Problema de Seguridad", icon: "⚠️" },
  { value: "SUPPLY_SHORTAGE", label: "Falta de Suministros", icon: "📦" },
  { value: "ENVIRONMENTAL_ISSUE", label: "Problema Ambiental", icon: "🌡️" },
  { value: "OPERATIONAL_ISSUE", label: "Problema Operacional", icon: "⚡" },
  { value: "OTHER", label: "Otro", icon: "❓" }
] as const

export const alertPriorities = [
  { value: "LOW", label: "Baja", color: "text-blue-600", description: "No urgente, puede esperar" },
  { value: "MEDIUM", label: "Media", color: "text-yellow-600", description: "Requiere atención pronto" },
  { value: "HIGH", label: "Alta", color: "text-orange-600", description: "Requiere atención inmediata" },
  { value: "CRITICAL", label: "Crítica", color: "text-red-600", description: "Requiere acción urgente" }
] as const