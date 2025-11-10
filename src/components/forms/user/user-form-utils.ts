/**
 * Utilities now use centralized role definitions
 * No need to update when adding new roles!
 */
import { Role } from "@prisma/client"
import { getRoleBadgeVariant as getCentralizedBadgeVariant, roleNeedsCompany } from "@/lib/rbac/role-definitions"

export const getRoleBadgeVariant = (role: string) => {
  return getCentralizedBadgeVariant(role as Role)
}

export const needsCompanyAssignment = (role: string): boolean => {
  return roleNeedsCompany(role as Role)
}