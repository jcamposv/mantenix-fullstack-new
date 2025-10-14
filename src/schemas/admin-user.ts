import * as z from "zod"

export const createAdminUserSchema = (mode: "create" | "invite") => z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Dirección de email inválida"),
  password: mode === "invite" 
    ? z.string().optional()
    : z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["SUPERVISOR", "TECNICO", "CLIENTE_ADMIN_GENERAL", "CLIENTE_ADMIN_SEDE", "CLIENTE_OPERARIO"]),
  companyId: z.string().optional(),
  isExternalUser: z.boolean().default(false),
  clientCompanyId: z.string().optional(),
  siteId: z.string().optional(),
  timezone: z.string(),
  locale: z.string(),
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

// Roles para usuarios internos de la empresa
export const INTERNAL_ROLES = [
  { value: "SUPERVISOR", label: "Supervisor", description: "Supervisar operaciones internas" },
  { value: "TECNICO", label: "Técnico", description: "Trabajo de campo y mantenimiento" },
]

// Roles para usuarios externos (clientes)
export const EXTERNAL_ROLES = [
  { 
    value: "CLIENTE_ADMIN_GENERAL", 
    label: "Admin General Cliente", 
    description: "Ver todas las sedes del cliente, generar alertas en cualquier sede, reportes generales",
    requiresSite: false
  },
  { 
    value: "CLIENTE_ADMIN_SEDE", 
    label: "Admin de Sede", 
    description: "Ver progreso de órdenes de trabajo de su sede específica, reportar errores",
    requiresSite: true
  },
  { 
    value: "CLIENTE_OPERARIO", 
    label: "Operario", 
    description: "Reportar errores e incidencias en su sede específica",
    requiresSite: true
  },
]

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