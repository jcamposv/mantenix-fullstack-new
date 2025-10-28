import { z } from "zod"

export const emailTemplateTypeEnum = z.enum([
  "WELCOME",
  "USER_INVITATION",
  "WORK_ORDER_CREATED",
  "WORK_ORDER_COMPLETED",
  "WORK_ORDER_CANCELLED",
  "ALERT_CREATED",
  "ALERT_ASSIGNED",
  "ALERT_RESOLVED",
])

export const emailTemplateFormSchema = z.object({
  emailConfigurationId: z.string().min(1, "Configuration ID es requerido"),
  type: emailTemplateTypeEnum,
  name: z.string().min(1, "Nombre del template es requerido"),
  subject: z.string().min(1, "Asunto es requerido"),
  templateId: z.string().optional(),
  isActive: z.boolean(),
})

export type EmailTemplateFormData = z.infer<typeof emailTemplateFormSchema>

export type EmailTemplateSubmitData = EmailTemplateFormData

export const emailTemplateTypeLabels: Record<string, string> = {
  WELCOME: "Bienvenida",
  USER_INVITATION: "Invitación de Usuario",
  WORK_ORDER_CREATED: "Orden de Trabajo Creada",
  WORK_ORDER_COMPLETED: "Orden de Trabajo Completada",
  WORK_ORDER_CANCELLED: "Orden de Trabajo Cancelada",
  ALERT_CREATED: "Alerta Creada",
  ALERT_ASSIGNED: "Alerta Asignada",
  ALERT_RESOLVED: "Alerta Resuelta",
}
