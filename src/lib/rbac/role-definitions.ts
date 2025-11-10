/**
 * Centralized Role-Based Access Control (RBAC) System
 * Single source of truth for all role configurations
 *
 * To add a new role:
 * 1. Add it to Prisma schema enum
 * 2. Add definition here in ROLE_DEFINITIONS
 * 3. Done! Everything else is generated automatically
 */

import { Role } from '@prisma/client';
import type { PermissionHelper } from '@/server/helpers/permission.helper';

export type BadgeVariant = 'default' | 'destructive' | 'secondary' | 'outline';

export interface RoleDefinition {
  value: Role;
  label: string;
  description: string;
  badgeVariant: BadgeVariant;
  permissions: string[];
  needsCompany: boolean;
  canBeCreatedBy: Role[];
  mobileOnly?: boolean;
  webAccessRestricted?: boolean;
}

/**
 * Single Source of Truth for Role Definitions
 * All role configurations in one place
 */
export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  SUPER_ADMIN: {
    value: 'SUPER_ADMIN',
    label: 'Super Admin',
    description: 'Full system access',
    badgeVariant: 'destructive',
    permissions: [], // Will be populated from PermissionHelper
    needsCompany: false,
    canBeCreatedBy: [], // Nobody can create super admin
    mobileOnly: false,
    webAccessRestricted: false
  },

  ADMIN_GRUPO: {
    value: 'ADMIN_GRUPO',
    label: 'Group Admin',
    description: 'Manage corporate group companies',
    badgeVariant: 'default',
    permissions: [],
    needsCompany: true,
    canBeCreatedBy: ['SUPER_ADMIN'],
    mobileOnly: false,
    webAccessRestricted: false
  },

  ADMIN_EMPRESA: {
    value: 'ADMIN_EMPRESA',
    label: 'Company Admin',
    description: 'Manage company and users',
    badgeVariant: 'default',
    permissions: [],
    needsCompany: true,
    canBeCreatedBy: ['SUPER_ADMIN', 'ADMIN_GRUPO'],
    mobileOnly: false,
    webAccessRestricted: false
  },

  JEFE_MANTENIMIENTO: {
    value: 'JEFE_MANTENIMIENTO',
    label: 'Maintenance Chief',
    description: 'Manage work orders and approve requests',
    badgeVariant: 'secondary',
    permissions: [],
    needsCompany: true,
    canBeCreatedBy: ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA'],
    mobileOnly: false,
    webAccessRestricted: false
  },

  ENCARGADO_BODEGA: {
    value: 'ENCARGADO_BODEGA',
    label: 'Warehouse Manager',
    description: 'Manage inventory and deliver parts',
    badgeVariant: 'secondary',
    permissions: [],
    needsCompany: true,
    canBeCreatedBy: ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA'],
    mobileOnly: false,
    webAccessRestricted: false
  },

  SUPERVISOR: {
    value: 'SUPERVISOR',
    label: 'Supervisor',
    description: 'Oversee operations',
    badgeVariant: 'secondary',
    permissions: [],
    needsCompany: true,
    canBeCreatedBy: ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA'],
    mobileOnly: true,
    webAccessRestricted: true
  },

  TECNICO: {
    value: 'TECNICO',
    label: 'Technician',
    description: 'Field work and maintenance',
    badgeVariant: 'outline',
    permissions: [],
    needsCompany: true,
    canBeCreatedBy: ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA'],
    mobileOnly: true,
    webAccessRestricted: true
  },

  CLIENTE_ADMIN_GENERAL: {
    value: 'CLIENTE_ADMIN_GENERAL',
    label: 'Client General Admin',
    description: 'Manage all client sites',
    badgeVariant: 'outline',
    permissions: [],
    needsCompany: true,
    canBeCreatedBy: ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA'],
    mobileOnly: false,
    webAccessRestricted: false
  },

  CLIENTE_ADMIN_SEDE: {
    value: 'CLIENTE_ADMIN_SEDE',
    label: 'Client Site Admin',
    description: 'Manage specific site',
    badgeVariant: 'outline',
    permissions: [],
    needsCompany: true,
    canBeCreatedBy: ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA'],
    mobileOnly: false,
    webAccessRestricted: false
  },

  CLIENTE_OPERARIO: {
    value: 'CLIENTE_OPERARIO',
    label: 'Client Operator',
    description: 'Report issues and incidents',
    badgeVariant: 'outline',
    permissions: [],
    needsCompany: true,
    canBeCreatedBy: ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA'],
    mobileOnly: true,
    webAccessRestricted: true
  }
};

/**
 * Utility: Get all roles as array
 */
export const ALL_ROLES = Object.values(ROLE_DEFINITIONS);

/**
 * Utility: Get all role values as array
 */
export const ROLE_VALUES = ALL_ROLES.map(r => r.value) as Role[];

/**
 * Utility: Get roles that can be created by a specific role
 */
export function getRolesCreatableBy(creatorRole: Role): RoleDefinition[] {
  return ALL_ROLES.filter(role =>
    role.canBeCreatedBy.includes(creatorRole)
  );
}

/**
 * Utility: Get mobile-only roles
 */
export function getMobileOnlyRoles(): Role[] {
  return ALL_ROLES
    .filter(role => role.mobileOnly)
    .map(role => role.value);
}

/**
 * Utility: Get roles with web access restricted
 */
export function getWebRestrictedRoles(): Role[] {
  return ALL_ROLES
    .filter(role => role.webAccessRestricted)
    .map(role => role.value);
}

/**
 * Utility: Check if role needs company assignment
 */
export function roleNeedsCompany(role: Role): boolean {
  return ROLE_DEFINITIONS[role]?.needsCompany ?? true;
}

/**
 * Utility: Get badge variant for a role
 */
export function getRoleBadgeVariant(role: Role): BadgeVariant {
  return ROLE_DEFINITIONS[role]?.badgeVariant ?? 'outline';
}

/**
 * Utility: Get role definition by value
 */
export function getRoleDefinition(role: Role): RoleDefinition | undefined {
  return ROLE_DEFINITIONS[role];
}
