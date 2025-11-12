/**
 * Roles are now centrally defined in @/lib/rbac/role-definitions.ts
 * This ensures consistency across the entire application
 */
import { ALL_ROLES } from "@/lib/rbac/role-definitions"

export const ROLES = ALL_ROLES

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