/**
 * User role keys in the system
 * Represents CustomRole.key values (both system and custom roles)
 * For system roles, these are the predefined keys created by seed
 */
export type SystemRoleKey =
  | 'SUPER_ADMIN'
  | 'ADMIN_GRUPO'
  | 'ADMIN_EMPRESA'
  | 'JEFE_MANTENIMIENTO'
  | 'ENCARGADO_BODEGA'
  | 'SUPERVISOR'
  | 'TECNICO'
  | 'OPERARIO'
  | 'CLIENTE_ADMIN_GENERAL'
  | 'CLIENTE_ADMIN_SEDE'
  | 'CLIENTE_OPERARIO';

// For backwards compatibility
export type UserRole = SystemRoleKey | string;

export interface AuthenticatedSession {
  user: {
    id: string
    name: string
    email: string
    role: UserRole  // CustomRole.key value (string)
    roleId: string  // CustomRole.id
    roleName?: string  // Full role name
    roleInterfaceType?: string  // MOBILE, DASHBOARD, BOTH
    companyId?: string
    companyGroupId?: string
    clientCompanyId?: string
    siteId?: string
    mfaEnabled?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    preferences?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    company?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    site?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clientCompany?: any
  }
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole  // CustomRole.key value (string)
  roleId: string  // CustomRole.id
  companyId?: string
  companyGroupId?: string
  clientCompanyId?: string
  siteId?: string
}