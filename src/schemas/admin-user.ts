import * as z from "zod"
import {
  CREATABLE_ROLE_VALUES,
  INTERNAL_ROLE_VALUES,
  EXTERNAL_ROLE_VALUES,
  ROLE_DEFINITIONS
} from "@/lib/rbac/role-definitions"

export const createAdminUserSchema = (mode: "create" | "invite") => z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Dirección de email inválida"),
  password: mode === "invite"
    ? z.string().optional()
    : z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(CREATABLE_ROLE_VALUES as [string, ...string[]]),
  companyId: z.string().optional(),
  hourlyRate: z.number().positive("La tarifa debe ser positiva").optional().or(z.literal(null)),
  isExternalUser: z.boolean(),
  clientCompanyId: z.string().optional(),
  siteId: z.string().optional(),
  timezone: z.string(),
  locale: z.string(),
  image: z.string().nullable().optional(),
  customRoleId: z.string().nullable().optional(),
}).refine((data) => {
  // If external user is selected, client company is required
  if (data.isExternalUser && !data.clientCompanyId) {
    return false
  }
  return true
}, {
  message: "La empresa cliente es requerida para usuarios externos",
  path: ["clientCompanyId"]
}).refine((data) => {
  // If external user is selected and role requires site, site is required
  const roleRequiresSite = data.role === "CLIENTE_ADMIN_SEDE" || data.role === "CLIENTE_OPERARIO"
  if (data.isExternalUser && roleRequiresSite && !data.siteId) {
    return false
  }
  return true
}, {
  message: "La sede es requerida para este rol",
  path: ["siteId"]
})

export type AdminUserFormData = z.infer<ReturnType<typeof createAdminUserSchema>>

// Roles para usuarios internos de la empresa (generados automáticamente desde ROLE_DEFINITIONS)
export const INTERNAL_ROLES = INTERNAL_ROLE_VALUES.map(roleValue => {
  const def = ROLE_DEFINITIONS[roleValue]
  return {
    value: roleValue,
    label: def.label,
    description: def.description,
    forGroupAdminOnly: roleValue === 'ADMIN_EMPRESA' // Solo ADMIN_EMPRESA requiere ser ADMIN_GRUPO
  }
})

// Roles para usuarios externos (clientes) - generados automáticamente desde ROLE_DEFINITIONS
export const EXTERNAL_ROLES = EXTERNAL_ROLE_VALUES.map(roleValue => {
  const def = ROLE_DEFINITIONS[roleValue]
  return {
    value: roleValue,
    label: def.label,
    description: def.description,
    requiresSite: ['CLIENTE_ADMIN_SEDE', 'CLIENTE_OPERARIO'].includes(roleValue)
  }
})

// Todos los roles disponibles (para uso general)
export const ALL_ADMIN_ROLES = [...INTERNAL_ROLES, ...EXTERNAL_ROLES]

export const ADMIN_TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Hora del Este" },
  { value: "America/Chicago", label: "Hora Central" },
  { value: "America/Denver", label: "Hora de Montaña" },
  { value: "America/Los_Angeles", label: "Hora del Pacífico" },
  { value: "America/Mexico_City", label: "Ciudad de México" },
  { value: "America/Costa_Rica", label: "Costa Rica" },
  { value: "America/Guatemala", label: "Guatemala" },
  { value: "America/Panama", label: "Panamá" },
]