import type { AuthenticatedSession } from "@/types/auth.types"

/**
 * Helper para manejo de permisos
 * Contiene utilidades para verificar permisos y roles
 */
export class PermissionHelper {
  
  static readonly ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN_GRUPO: 'ADMIN_GRUPO',
    ADMIN_EMPRESA: 'ADMIN_EMPRESA',
    JEFE_MANTENIMIENTO: 'JEFE_MANTENIMIENTO',
    ENCARGADO_BODEGA: 'ENCARGADO_BODEGA',
    TECNICO: 'TECNICO',
    OPERARIO: 'OPERARIO',
    SUPERVISOR: 'SUPERVISOR',
    CLIENTE_ADMIN_GENERAL: 'CLIENTE_ADMIN_GENERAL',
    CLIENTE_ADMIN_SEDE: 'CLIENTE_ADMIN_SEDE',
    CLIENTE_OPERARIO: 'CLIENTE_OPERARIO'
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
    VIEW_COMPANIES: 'view_companies',
    CREATE_COMPANY_GROUP: 'create_company_group',
    UPDATE_COMPANY_GROUP: 'update_company_group',
    DELETE_COMPANY_GROUP: 'delete_company_group',
    VIEW_COMPANY_GROUPS: 'view_company_groups',
    MANAGE_GROUP_COMPANIES: 'manage_group_companies',
    CREATE_ASSET: 'create_asset',
    UPDATE_ASSET: 'update_asset',
    DELETE_ASSET: 'delete_asset',
    VIEW_ASSETS: 'view_assets',
    CREATE_WORK_ORDER_TEMPLATE: 'create_work_order_template',
    UPDATE_WORK_ORDER_TEMPLATE: 'update_work_order_template',
    DELETE_WORK_ORDER_TEMPLATE: 'delete_work_order_template',
    VIEW_WORK_ORDER_TEMPLATES: 'view_work_order_templates',
    CREATE_EMAIL_CONFIGURATION: 'create_email_configuration',
    UPDATE_EMAIL_CONFIGURATION: 'update_email_configuration',
    DELETE_EMAIL_CONFIGURATION: 'delete_email_configuration',
    VIEW_EMAIL_CONFIGURATIONS: 'view_email_configurations',
    CREATE_EMAIL_TEMPLATE: 'create_email_template',
    UPDATE_EMAIL_TEMPLATE: 'update_email_template',
    DELETE_EMAIL_TEMPLATE: 'delete_email_template',
    VIEW_EMAIL_TEMPLATES: 'view_email_templates',
    MANAGE_FEATURES: 'manage_features',
    VIEW_ATTENDANCE: 'view_attendance',
    CREATE_ATTENDANCE: 'create_attendance',
    UPDATE_ATTENDANCE: 'update_attendance',
    DELETE_ATTENDANCE: 'delete_attendance',
    VIEW_ALL_ATTENDANCE: 'view_all_attendance',
    VIEW_COMPANY_ATTENDANCE: 'view_company_attendance',
    MANAGE_LOCATIONS: 'manage_locations',
    // Inventory permissions
    VIEW_INVENTORY_ITEMS: 'view_inventory_items',
    VIEW_ALL_INVENTORY: 'view_all_inventory',
    CREATE_INVENTORY_ITEM: 'create_inventory_item',
    UPDATE_INVENTORY_ITEM: 'update_inventory_item',
    DELETE_INVENTORY_ITEM: 'delete_inventory_item',
    VIEW_INVENTORY_STOCK: 'view_inventory_stock',
    ADJUST_INVENTORY_STOCK: 'adjust_inventory_stock',
    TRANSFER_INVENTORY: 'transfer_inventory',
    VIEW_INVENTORY_REQUESTS: 'view_inventory_requests',
    CREATE_INVENTORY_REQUEST: 'create_inventory_request',
    APPROVE_INVENTORY_REQUEST: 'approve_inventory_request',
    REJECT_INVENTORY_REQUEST: 'reject_inventory_request',
    DELIVER_INVENTORY_REQUEST: 'deliver_inventory_request',
    DELIVER_FROM_WAREHOUSE: 'deliver_from_warehouse',
    CONFIRM_RECEIPT: 'confirm_receipt',
    DELETE_INVENTORY_REQUEST: 'delete_inventory_request',
    VIEW_INVENTORY_MOVEMENTS: 'view_inventory_movements',
    // Asset Status permissions
    CHANGE_ASSET_STATUS: 'change_asset_status',
    VIEW_ASSET_STATUS_HISTORY: 'view_asset_status_history'
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
      this.PERMISSIONS.VIEW_COMPANIES,
      this.PERMISSIONS.CREATE_COMPANY_GROUP,
      this.PERMISSIONS.UPDATE_COMPANY_GROUP,
      this.PERMISSIONS.DELETE_COMPANY_GROUP,
      this.PERMISSIONS.VIEW_COMPANY_GROUPS,
      this.PERMISSIONS.MANAGE_GROUP_COMPANIES,
      this.PERMISSIONS.CREATE_ASSET,
      this.PERMISSIONS.UPDATE_ASSET,
      this.PERMISSIONS.DELETE_ASSET,
      this.PERMISSIONS.VIEW_ASSETS,
      this.PERMISSIONS.CREATE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.UPDATE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.DELETE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.VIEW_WORK_ORDER_TEMPLATES,
      this.PERMISSIONS.CREATE_EMAIL_CONFIGURATION,
      this.PERMISSIONS.UPDATE_EMAIL_CONFIGURATION,
      this.PERMISSIONS.DELETE_EMAIL_CONFIGURATION,
      this.PERMISSIONS.VIEW_EMAIL_CONFIGURATIONS,
      this.PERMISSIONS.CREATE_EMAIL_TEMPLATE,
      this.PERMISSIONS.UPDATE_EMAIL_TEMPLATE,
      this.PERMISSIONS.DELETE_EMAIL_TEMPLATE,
      this.PERMISSIONS.VIEW_EMAIL_TEMPLATES,
      this.PERMISSIONS.MANAGE_FEATURES,
      this.PERMISSIONS.VIEW_ALL_ATTENDANCE,
      this.PERMISSIONS.CREATE_ATTENDANCE,
      this.PERMISSIONS.UPDATE_ATTENDANCE,
      this.PERMISSIONS.DELETE_ATTENDANCE,
      this.PERMISSIONS.MANAGE_LOCATIONS,
      // Inventory permissions
      this.PERMISSIONS.VIEW_INVENTORY_ITEMS,
      this.PERMISSIONS.VIEW_ALL_INVENTORY,
      this.PERMISSIONS.CREATE_INVENTORY_ITEM,
      this.PERMISSIONS.UPDATE_INVENTORY_ITEM,
      this.PERMISSIONS.DELETE_INVENTORY_ITEM,
      this.PERMISSIONS.VIEW_INVENTORY_STOCK,
      this.PERMISSIONS.ADJUST_INVENTORY_STOCK,
      this.PERMISSIONS.TRANSFER_INVENTORY,
      this.PERMISSIONS.VIEW_INVENTORY_REQUESTS,
      this.PERMISSIONS.CREATE_INVENTORY_REQUEST,
      this.PERMISSIONS.APPROVE_INVENTORY_REQUEST,
      this.PERMISSIONS.REJECT_INVENTORY_REQUEST,
      this.PERMISSIONS.DELIVER_INVENTORY_REQUEST,
      this.PERMISSIONS.DELIVER_FROM_WAREHOUSE,
      this.PERMISSIONS.CONFIRM_RECEIPT,
      this.PERMISSIONS.DELETE_INVENTORY_REQUEST,
      this.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS,
      // Asset Status permissions
      this.PERMISSIONS.CHANGE_ASSET_STATUS,
      this.PERMISSIONS.VIEW_ASSET_STATUS_HISTORY
    ],
    [this.ROLES.ADMIN_GRUPO]: [
      // ADMIN_GRUPO tiene los mismos permisos que ADMIN_EMPRESA
      // pero aplican a TODAS las compañías dentro de su corporación
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
      this.PERMISSIONS.VIEW_SITES,
      this.PERMISSIONS.CREATE_COMPANY_GROUP,
      this.PERMISSIONS.UPDATE_COMPANY_GROUP,
      this.PERMISSIONS.DELETE_COMPANY_GROUP,
      this.PERMISSIONS.VIEW_COMPANY_GROUPS,
      this.PERMISSIONS.MANAGE_GROUP_COMPANIES,
      this.PERMISSIONS.CREATE_ASSET,
      this.PERMISSIONS.UPDATE_ASSET,
      this.PERMISSIONS.DELETE_ASSET,
      this.PERMISSIONS.VIEW_ASSETS,
      this.PERMISSIONS.CREATE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.UPDATE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.DELETE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.VIEW_WORK_ORDER_TEMPLATES,
      this.PERMISSIONS.CREATE_EMAIL_CONFIGURATION,
      this.PERMISSIONS.UPDATE_EMAIL_CONFIGURATION,
      this.PERMISSIONS.DELETE_EMAIL_CONFIGURATION,
      this.PERMISSIONS.VIEW_EMAIL_CONFIGURATIONS,
      this.PERMISSIONS.CREATE_EMAIL_TEMPLATE,
      this.PERMISSIONS.UPDATE_EMAIL_TEMPLATE,
      this.PERMISSIONS.DELETE_EMAIL_TEMPLATE,
      this.PERMISSIONS.VIEW_EMAIL_TEMPLATES,
      this.PERMISSIONS.VIEW_COMPANY_ATTENDANCE,
      this.PERMISSIONS.CREATE_ATTENDANCE,
      this.PERMISSIONS.UPDATE_ATTENDANCE,
      this.PERMISSIONS.DELETE_ATTENDANCE,
      this.PERMISSIONS.MANAGE_LOCATIONS,
      // Inventory permissions
      this.PERMISSIONS.VIEW_INVENTORY_ITEMS,
      this.PERMISSIONS.VIEW_ALL_INVENTORY,
      this.PERMISSIONS.CREATE_INVENTORY_ITEM,
      this.PERMISSIONS.UPDATE_INVENTORY_ITEM,
      this.PERMISSIONS.DELETE_INVENTORY_ITEM,
      this.PERMISSIONS.VIEW_INVENTORY_STOCK,
      this.PERMISSIONS.ADJUST_INVENTORY_STOCK,
      this.PERMISSIONS.TRANSFER_INVENTORY,
      this.PERMISSIONS.VIEW_INVENTORY_REQUESTS,
      this.PERMISSIONS.CREATE_INVENTORY_REQUEST,
      this.PERMISSIONS.APPROVE_INVENTORY_REQUEST,
      this.PERMISSIONS.REJECT_INVENTORY_REQUEST,
      this.PERMISSIONS.DELIVER_INVENTORY_REQUEST,
      this.PERMISSIONS.DELIVER_FROM_WAREHOUSE,
      this.PERMISSIONS.CONFIRM_RECEIPT,
      this.PERMISSIONS.DELETE_INVENTORY_REQUEST,
      this.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS,
      // Asset Status permissions
      this.PERMISSIONS.CHANGE_ASSET_STATUS,
      this.PERMISSIONS.VIEW_ASSET_STATUS_HISTORY
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
      this.PERMISSIONS.VIEW_SITES,
      this.PERMISSIONS.CREATE_ASSET,
      this.PERMISSIONS.UPDATE_ASSET,
      this.PERMISSIONS.DELETE_ASSET,
      this.PERMISSIONS.VIEW_ASSETS,
      this.PERMISSIONS.CREATE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.UPDATE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.DELETE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.VIEW_WORK_ORDER_TEMPLATES,
      this.PERMISSIONS.CREATE_EMAIL_CONFIGURATION,
      this.PERMISSIONS.UPDATE_EMAIL_CONFIGURATION,
      this.PERMISSIONS.DELETE_EMAIL_CONFIGURATION,
      this.PERMISSIONS.VIEW_EMAIL_CONFIGURATIONS,
      this.PERMISSIONS.CREATE_EMAIL_TEMPLATE,
      this.PERMISSIONS.UPDATE_EMAIL_TEMPLATE,
      this.PERMISSIONS.DELETE_EMAIL_TEMPLATE,
      this.PERMISSIONS.VIEW_EMAIL_TEMPLATES,
      this.PERMISSIONS.VIEW_COMPANY_ATTENDANCE,
      this.PERMISSIONS.CREATE_ATTENDANCE,
      this.PERMISSIONS.UPDATE_ATTENDANCE,
      this.PERMISSIONS.DELETE_ATTENDANCE,
      this.PERMISSIONS.MANAGE_LOCATIONS,
      // Inventory permissions
      this.PERMISSIONS.VIEW_INVENTORY_ITEMS,
      this.PERMISSIONS.VIEW_ALL_INVENTORY,
      this.PERMISSIONS.CREATE_INVENTORY_ITEM,
      this.PERMISSIONS.UPDATE_INVENTORY_ITEM,
      this.PERMISSIONS.DELETE_INVENTORY_ITEM,
      this.PERMISSIONS.VIEW_INVENTORY_STOCK,
      this.PERMISSIONS.ADJUST_INVENTORY_STOCK,
      this.PERMISSIONS.TRANSFER_INVENTORY,
      this.PERMISSIONS.VIEW_INVENTORY_REQUESTS,
      this.PERMISSIONS.CREATE_INVENTORY_REQUEST,
      this.PERMISSIONS.APPROVE_INVENTORY_REQUEST,
      this.PERMISSIONS.REJECT_INVENTORY_REQUEST,
      this.PERMISSIONS.DELIVER_INVENTORY_REQUEST,
      this.PERMISSIONS.DELIVER_FROM_WAREHOUSE,
      this.PERMISSIONS.CONFIRM_RECEIPT,
      this.PERMISSIONS.DELETE_INVENTORY_REQUEST,
      this.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS,
      // Asset Status permissions
      this.PERMISSIONS.CHANGE_ASSET_STATUS,
      this.PERMISSIONS.VIEW_ASSET_STATUS_HISTORY
    ],
    [this.ROLES.JEFE_MANTENIMIENTO]: [
      // Work Order Management
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.UPDATE_ALERT,
      this.PERMISSIONS.DELETE_ALERT,
      this.PERMISSIONS.VIEW_COMPANY_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT,
      // Assets (view only for maintenance reference)
      this.PERMISSIONS.VIEW_ASSETS,
      // Work Order Templates (view and manage)
      this.PERMISSIONS.CREATE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.UPDATE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.DELETE_WORK_ORDER_TEMPLATE,
      this.PERMISSIONS.VIEW_WORK_ORDER_TEMPLATES,
      // Inventory Request Approval (technicians request, chief approves)
      this.PERMISSIONS.VIEW_INVENTORY_REQUESTS,
      this.PERMISSIONS.APPROVE_INVENTORY_REQUEST,
      this.PERMISSIONS.REJECT_INVENTORY_REQUEST,
      // View inventory to know what's available
      this.PERMISSIONS.VIEW_INVENTORY_ITEMS,
      this.PERMISSIONS.VIEW_INVENTORY_STOCK,
      // Asset Status permissions
      this.PERMISSIONS.CHANGE_ASSET_STATUS,
      this.PERMISSIONS.VIEW_ASSET_STATUS_HISTORY
    ],
    [this.ROLES.ENCARGADO_BODEGA]: [
      // Inventory/Warehouse Management ONLY
      // Manages physical warehouse, delivers parts to technicians, controls stock
      this.PERMISSIONS.VIEW_INVENTORY_ITEMS,
      this.PERMISSIONS.VIEW_ALL_INVENTORY,
      this.PERMISSIONS.CREATE_INVENTORY_ITEM,
      this.PERMISSIONS.UPDATE_INVENTORY_ITEM,
      this.PERMISSIONS.DELETE_INVENTORY_ITEM,
      this.PERMISSIONS.VIEW_INVENTORY_STOCK,
      this.PERMISSIONS.ADJUST_INVENTORY_STOCK,
      this.PERMISSIONS.TRANSFER_INVENTORY,
      this.PERMISSIONS.VIEW_INVENTORY_REQUESTS,
      this.PERMISSIONS.DELIVER_INVENTORY_REQUEST,
      this.PERMISSIONS.DELIVER_FROM_WAREHOUSE,
      this.PERMISSIONS.CONFIRM_RECEIPT,
      this.PERMISSIONS.VIEW_INVENTORY_MOVEMENTS
    ],
    [this.ROLES.CLIENTE_ADMIN_GENERAL]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.UPDATE_ALERT,
      this.PERMISSIONS.VIEW_CLIENT_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT,
      this.PERMISSIONS.VIEW_CLIENT_USERS,
      this.PERMISSIONS.VIEW_SITES,
      this.PERMISSIONS.CREATE_ASSET,
      this.PERMISSIONS.UPDATE_ASSET,
      this.PERMISSIONS.DELETE_ASSET,
      this.PERMISSIONS.VIEW_ASSETS,
      // Asset Status permissions
      this.PERMISSIONS.CHANGE_ASSET_STATUS,
      this.PERMISSIONS.VIEW_ASSET_STATUS_HISTORY
    ],
    [this.ROLES.CLIENTE_ADMIN_SEDE]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.UPDATE_ALERT,
      this.PERMISSIONS.VIEW_SITE_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT,
      this.PERMISSIONS.VIEW_SITES,
      this.PERMISSIONS.CREATE_ASSET,
      this.PERMISSIONS.UPDATE_ASSET,
      this.PERMISSIONS.DELETE_ASSET,
      this.PERMISSIONS.VIEW_ASSETS,
      // Asset Status permissions
      this.PERMISSIONS.CHANGE_ASSET_STATUS,
      this.PERMISSIONS.VIEW_ASSET_STATUS_HISTORY
    ],
    [this.ROLES.CLIENTE_OPERARIO]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.VIEW_SITE_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT,
      this.PERMISSIONS.VIEW_ASSETS,
      // Asset Status permissions
      this.PERMISSIONS.CHANGE_ASSET_STATUS,
      this.PERMISSIONS.VIEW_ASSET_STATUS_HISTORY
    ],
    [this.ROLES.TECNICO]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.UPDATE_ALERT,
      this.PERMISSIONS.VIEW_ASSIGNED_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT,
      this.PERMISSIONS.VIEW_ASSETS,
      this.PERMISSIONS.VIEW_ATTENDANCE,
      this.PERMISSIONS.CREATE_ATTENDANCE,
      // Inventory requests (technicians can request parts and confirm receipt)
      this.PERMISSIONS.VIEW_INVENTORY_REQUESTS,
      this.PERMISSIONS.CREATE_INVENTORY_REQUEST,
      this.PERMISSIONS.CONFIRM_RECEIPT,
      // View inventory to know what's available
      this.PERMISSIONS.VIEW_INVENTORY_ITEMS,
      this.PERMISSIONS.VIEW_INVENTORY_STOCK,
      // Asset Status permissions
      this.PERMISSIONS.CHANGE_ASSET_STATUS,
      this.PERMISSIONS.VIEW_ASSET_STATUS_HISTORY
    ],
    [this.ROLES.SUPERVISOR]: [
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.UPDATE_ALERT,
      this.PERMISSIONS.VIEW_COMPANY_ALERTS,
      this.PERMISSIONS.CREATE_COMMENT,
      this.PERMISSIONS.VIEW_ASSETS,
      this.PERMISSIONS.VIEW_COMPANY_ATTENDANCE,
      this.PERMISSIONS.CREATE_ATTENDANCE,
      this.PERMISSIONS.UPDATE_ATTENDANCE,
      // Inventory requests (supervisors can view and manage requests from their team)
      this.PERMISSIONS.VIEW_INVENTORY_REQUESTS,
      this.PERMISSIONS.CREATE_INVENTORY_REQUEST,
      this.PERMISSIONS.APPROVE_INVENTORY_REQUEST,
      this.PERMISSIONS.REJECT_INVENTORY_REQUEST,
      this.PERMISSIONS.CONFIRM_RECEIPT,
      // View inventory
      this.PERMISSIONS.VIEW_INVENTORY_ITEMS,
      this.PERMISSIONS.VIEW_INVENTORY_STOCK,
      // Asset Status permissions
      this.PERMISSIONS.CHANGE_ASSET_STATUS,
      this.PERMISSIONS.VIEW_ASSET_STATUS_HISTORY
    ],
    [this.ROLES.OPERARIO]: [
      // Plant operators who can update asset/machine status
      this.PERMISSIONS.VIEW_ASSETS,
      this.PERMISSIONS.CHANGE_ASSET_STATUS,
      this.PERMISSIONS.VIEW_ASSET_STATUS_HISTORY,
      this.PERMISSIONS.CREATE_ALERT,
      this.PERMISSIONS.VIEW_COMPANY_ALERTS,
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
      this.ROLES.ADMIN_GRUPO,
      this.ROLES.ADMIN_EMPRESA,
      this.ROLES.CLIENTE_ADMIN_GENERAL,
      this.ROLES.CLIENTE_ADMIN_SEDE
    ] as const
    return adminRoles.includes(userRole as typeof adminRoles[number])
  }

  static async requirePermission(session: AuthenticatedSession, permission: string): Promise<void> {
    if (!this.hasPermission(session.user.role, permission)) {
      throw new Error("No tienes permisos para realizar esta acción")
    }
  }

  /**
   * NEW RBAC METHODS - Support for custom roles
   */

  /**
   * Check if user has permission (supports custom roles)
   * @deprecated Use hasPermissionAsync for full custom role support
   */
  static async hasPermissionAsync(session: AuthenticatedSession, permission: string): Promise<boolean> {
    const { hasPermission: checkPermission } = await import('./permission-utils');
    return checkPermission(session, permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static async hasAnyPermission(session: AuthenticatedSession, permissions: string[]): Promise<boolean> {
    const { hasAnyPermission: check } = await import('./permission-utils');
    return check(session, permissions);
  }

  /**
   * Check if user has all of the specified permissions
   */
  static async hasAllPermissions(session: AuthenticatedSession, permissions: string[]): Promise<boolean> {
    const { hasAllPermissions: check } = await import('./permission-utils');
    return check(session, permissions);
  }

  /**
   * Require permission (throws if user doesn't have it) - supports custom roles
   */
  static async requirePermissionAsync(session: AuthenticatedSession, permission: string): Promise<void> {
    const { requirePermission: require } = await import('./permission-utils');
    return require(session, permission);
  }

  /**
   * Get all permissions for a user (supports custom roles)
   */
  static async getUserPermissions(session: AuthenticatedSession): Promise<string[]> {
    const { getUserPermissions } = await import('./permission-utils');
    return getUserPermissions(session);
  }
}