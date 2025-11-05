export const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", description: "Full system access" },
  { value: "ADMIN_GRUPO", label: "Group Admin", description: "Manage corporate group companies" },
  { value: "ADMIN_EMPRESA", label: "Company Admin", description: "Manage company and users" },
  { value: "JEFE_MANTENIMIENTO", label: "Maintenance Chief", description: "Approve inventory requests" },
  { value: "SUPERVISOR", label: "Supervisor", description: "Oversee operations" },
  { value: "TECNICO", label: "Technician", description: "Field work and maintenance" },
  { value: "CLIENTE_ADMIN_GENERAL", label: "Client General Admin", description: "Manage all client sites" },
  { value: "CLIENTE_ADMIN_SEDE", label: "Client Site Admin", description: "Manage specific site" },
  { value: "CLIENTE_OPERARIO", label: "Client Operator", description: "Report issues and incidents" },
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