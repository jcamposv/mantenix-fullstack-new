import { z } from "zod"

export const emailConfigurationSchema = z.object({
  companyId: z.string().min(1, "Empresa es requerida"),
  apiToken: z.string().min(1, "API Token es requerido"),
  domainId: z.string().optional(),
  fromEmail: z.string().email("Email inválido"),
  fromName: z.string().min(1, "Nombre del remitente es requerido"),
  replyToEmail: z.string().email("Email inválido").optional().or(z.literal("")),
})

export type EmailConfigurationFormData = z.infer<typeof emailConfigurationSchema>
export type EmailConfigurationSubmitData = EmailConfigurationFormData
