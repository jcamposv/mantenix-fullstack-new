/**
 * Utilities now use centralized role definitions
 * No need to update when adding new roles!
 */
import type { SystemRoleKey } from "@/types/auth.types"
import { getRoleBadgeVariant as getCentralizedBadgeVariant, roleNeedsCompany } from "@/lib/rbac/role-definitions"

export const getRoleBadgeVariant = (role: string) => {
  return getCentralizedBadgeVariant(role as SystemRoleKey)
}

export const needsCompanyAssignment = (role: string): boolean => {
  return roleNeedsCompany(role as SystemRoleKey)
}