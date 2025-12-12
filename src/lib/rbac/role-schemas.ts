/**
 * Dynamic Zod Schemas for Roles
 * Automatically generated from role-definitions.ts
 *
 * No need to update when adding new roles!
 */

import { z } from 'zod';
import type { SystemRoleKey } from '@/types/auth.types';
import { ROLE_VALUES, getRolesCreatableBy } from './role-definitions';

/**
 * Zod enum for all roles
 * Generated dynamically from ROLE_DEFINITIONS
 */
export const roleSchema = z.enum(ROLE_VALUES as [SystemRoleKey, ...SystemRoleKey[]]);

/**
 * Type-safe role type
 */
export type RoleType = z.infer<typeof roleSchema>;

/**
 * Create role schema for specific creator
 * Filters roles based on who can create them
 */
export function createRoleSchemaFor(creatorRole: SystemRoleKey) {
  const creatableRoles = getRolesCreatableBy(creatorRole).map(r => r.value);

  if (creatorRole === 'SUPER_ADMIN') {
    // Super admin can create any role
    return roleSchema;
  }

  // Filter to only roles this creator can create
  return z.enum(creatableRoles as [SystemRoleKey, ...SystemRoleKey[]]);
}
