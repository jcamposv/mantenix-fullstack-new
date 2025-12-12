import * as z from "zod"

export const companySchema = z.object({
  name: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
  subdomain: z
    .string()
    .min(2, "El subdominio debe tener al menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "El subdominio solo puede contener letras minúsculas, números y guiones"),
  tier: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
  planId: z.string().min(1, "Debe seleccionar un plan de subscripción"),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Debe ser un color hex válido"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Debe ser un color hex válido"),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Debe ser un color hex válido"),
  mfaEnforced: z.boolean(),
  logo: z.string().optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>

export interface CompanySubmitData extends CompanyFormData {
  logo?: string
}