/**
 * User roles in the system
 * Matches Prisma Role enum
 */
export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN_GRUPO'
  | 'ADMIN_EMPRESA'
  | 'JEFE_MANTENIMIENTO'
  | 'ENCARGADO_BODEGA'
  | 'SUPERVISOR'
  | 'TECNICO'
  | 'CLIENTE_ADMIN_GENERAL'
  | 'CLIENTE_ADMIN_SEDE'
  | 'CLIENTE_OPERARIO';

export interface AuthenticatedSession {
  user: {
    id: string
    role: UserRole
    companyId?: string
    companyGroupId?: string
    clientCompanyId?: string
    siteId?: string
  }
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  companyId?: string
  companyGroupId?: string
  clientCompanyId?: string
  siteId?: string
}