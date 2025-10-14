export const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", description: "Full system access" },
  { value: "ADMIN_EMPRESA", label: "Company Admin", description: "Manage company and users" },
  { value: "SUPERVISOR", label: "Supervisor", description: "Oversee operations" },
  { value: "TECNICO", label: "Technician", description: "Field work and maintenance" },
  { value: "CLIENTE_ADMIN", label: "Client Admin", description: "Manage client company" },
  { value: "CLIENTE_OPERATIVO", label: "Client Operative", description: "Basic client operations" },
]

export const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "America/Mexico_City", label: "Mexico City" },
]

export const LOCALES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
]