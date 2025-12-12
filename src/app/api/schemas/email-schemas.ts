import { z } from "zod"

// Email Configuration Schemas
export const createEmailConfigurationSchema = z.object({
  companyId: z.string().min(1, "Company ID es requerido"),
  apiToken: z.string().min(1, "API Token es requerido"),
  domainId: z.string().optional(),
  fromEmail: z.string().email("Email inválido"),
  fromName: z.string().min(1, "Nombre del remitente es requerido"),
  replyToEmail: z.string().email("Email inválido").optional().or(z.literal("")),
})

export const updateEmailConfigurationSchema = z.object({
  apiToken: z.string().min(1, "API Token es requerido").optional(),
  domainId: z.string().optional().or(z.literal("")),
  fromEmail: z.string().email("Email inválido").optional(),
  fromName: z.string().min(1, "Nombre del remitente es requerido").optional(),
  replyToEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
})

export const emailConfigurationFiltersSchema = z.object({
  companyId: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional().transform(val => val === "true"),
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
})

// Email Template Schemas
export const emailTemplateTypeEnum = z.enum([
  "WELCOME",
  "USER_INVITATION",
  "PASSWORD_RESET",
  "WORK_ORDER_CREATED",
  "WORK_ORDER_COMPLETED",
  "WORK_ORDER_CANCELLED",
  "ALERT_CREATED",
  "ALERT_ASSIGNED",
  "ALERT_RESOLVED",
])

export const createEmailTemplateSchema = z.object({
  emailConfigurationId: z.string().min(1, "Configuration ID es requerido"),
  type: emailTemplateTypeEnum,
  name: z.string().min(1, "Nombre del template es requerido"),
  subject: z.string().min(1, "Asunto es requerido"),
  templateId: z.string().optional(),
})

export const updateEmailTemplateSchema = z.object({
  name: z.string().min(1, "Nombre del template es requerido").optional(),
  subject: z.string().min(1, "Asunto es requerido").optional(),
  templateId: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
})

export const emailTemplateFiltersSchema = z.object({
  emailConfigurationId: z.string().optional(),
  companyId: z.string().optional(),
  type: emailTemplateTypeEnum.optional(),
  isActive: z.enum(["true", "false"]).optional().transform(val => val === "true"),
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
})

export type CreateEmailConfigurationInput = z.infer<typeof createEmailConfigurationSchema>
export type UpdateEmailConfigurationInput = z.infer<typeof updateEmailConfigurationSchema>
export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>
