/**
 * Helper para manejo de permisos
 * Contiene utilidades para verificar permisos y roles
 */
export class PermissionHelper {
  
  static readonly ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN_EMPRESA: 'ADMIN_EMPRESA',
    CLIENTE_ADMIN_GENERAL: 'CLIENTE_ADMIN_GENERAL',
    CLIENTE_ADMIN_SEDE: 'CLIENTE_ADMIN_SEDE',
    CLIENTE_OPERARIO: 'CLIENTE_OPERARIO',
    TECNICO: 'TECNICO'
  } as const

  static readonly PERMISSIONS = {
    CREATE_ALERT: 'create_alert',
    UPDATE_ALERT: 'update_alert',
    DELETE_ALERT: 'delete_alert',
    VIEW_ALL_ALERTS: 'view_all_alerts',
    VIEW_COMPANY_ALERTS: 'view_company_alerts',
    VIEW_CLIENT_ALERTS: 'view_client_alerts',
    VIEW_SITE_ALERTS: 'view_site_alerts',
    VIEW_ASSIGNED_ALERTS: 'view_assigned_alerts',
    CREATE_COMMENT: 'create_comment',
    CREATE_USER: 'create_user',
    UPDATE_USER: 'update_user',
    DELETE_USER: 'delete_user',
    VIEW_ALL_USERS: 'view_all_users',
    VIEW_COMPANY_USERS: 'view_company_users',
    VIEW_CLIENT_USERS: 'view_client_users',
    CREATE_CLIENT_COMPANY: 'create_client_company',
    UPDATE_CLIENT_COMPANY: 'update_client_company',
    DELETE_CLIENT_COMPANY: 'delete_client_company',
    VIEW_CLIENT_COMPANIES: 'view_client_companies',
    CREATE_SITE: 'create_site',
    UPDATE_SITE: 'update_site',
    DELETE_SITE: 'delete_site',
    VIEW_SITES: 'view_sites',
    CREATE_COMPANY: 'create_company',
    UPDATE_COMPANY: 'update_company',
    DELETE_COMPANY: 'delete_company',
    VIEW_COMPANIES: 'view_companies'
  } as const

  private static readonly ROLE_PERMISSIONS: Record<string, string[]> = {
    [this.ROLES.SUPER_ADMIN]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.UPDATE_ALERT,
      this.PERMISSIONS.DELETE_ALERT,
      this.PERMISSIONS.VIEW_ALL_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT,
      this.PERMISSIONS.CREATE_USER,
      this.PERMISSIONS.UPDATE_USER,
      this.PERMISSIONS.DELETE_USER,
      this.PERMISSIONS.VIEW_ALL_USERS,
      this.PERMISSIONS.CREATE_CLIENT_COMPANY,
      this.PERMISSIONS.UPDATE_CLIENT_COMPANY,
      this.PERMISSIONS.DELETE_CLIENT_COMPANY,
      this.PERMISSIONS.VIEW_CLIENT_COMPANIES,
      this.PERMISSIONS.CREATE_SITE,
      this.PERMISSIONS.UPDATE_SITE,
      this.PERMISSIONS.DELETE_SITE,
      this.PERMISSIONS.VIEW_SITES,
      this.PERMISSIONS.CREATE_COMPANY,
      this.PERMISSIONS.UPDATE_COMPANY,
      this.PERMISSIONS.DELETE_COMPANY,
      this.PERMISSIONS.VIEW_COMPANIES
    ],
    [this.ROLES.ADMIN_EMPRESA]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.UPDATE_ALERT,
      this.PERMISSIONS.DELETE_ALERT,
      this.PERMISSIONS.VIEW_COMPANY_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT,
      this.PERMISSIONS.CREATE_USER,
      this.PERMISSIONS.UPDATE_USER,
      this.PERMISSIONS.DELETE_USER,
      this.PERMISSIONS.VIEW_COMPANY_USERS,
      this.PERMISSIONS.CREATE_CLIENT_COMPANY,
      this.PERMISSIONS.UPDATE_CLIENT_COMPANY,
      this.PERMISSIONS.DELETE_CLIENT_COMPANY,
      this.PERMISSIONS.VIEW_CLIENT_COMPANIES,
      this.PERMISSIONS.CREATE_SITE,
      this.PERMISSIONS.UPDATE_SITE,
      this.PERMISSIONS.DELETE_SITE,
      this.PERMISSIONS.VIEW_SITES
    ],
    [this.ROLES.CLIENTE_ADMIN_GENERAL]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.UPDATE_ALERT,
      this.PERMISSIONS.VIEW_CLIENT_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT,
      this.PERMISSIONS.VIEW_CLIENT_USERS,
      this.PERMISSIONS.VIEW_SITES
    ],
    [this.ROLES.CLIENTE_ADMIN_SEDE]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.UPDATE_ALERT,
      this.PERMISSIONS.VIEW_SITE_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT,
      this.PERMISSIONS.VIEW_SITES
    ],
    [this.ROLES.CLIENTE_OPERARIO]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.VIEW_SITE_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT
    ],
    [this.ROLES.TECNICO]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.UPDATE_ALERT,
      this.PERMISSIONS.VIEW_ASSIGNED_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT
    ]
  }

  static hasPermission(userRole: string, permission: string): boolean {
    return this.ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false
  }

  static getRolePermissions(userRole: string): string[] {
    return this.ROLE_PERMISSIONS[userRole] ?? []
  }

  static isAdminRole(userRole: string): boolean {
    const adminRoles = [
      this.ROLES.SUPER_ADMIN,
      this.ROLES.ADMIN_EMPRESA,
      this.ROLES.CLIENTE_ADMIN_GENERAL,
      this.ROLES.CLIENTE_ADMIN_SEDE
    ] as const
    return adminRoles.includes(userRole as typeof adminRoles[number])
  }

  static async requirePermission(session: any, permission: string): Promise<void> {
    if (!this.hasPermission(session.user.role, permission)) {
      throw new Error("No tienes permisos para realizar esta acción")
    }
  }
}