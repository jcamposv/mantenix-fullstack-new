/**
 * Permission Utilities
 * Provides permission checking functions for both system and custom roles
 */

import { CustomRoleRepository } from '@/server/repositories/custom-role.repository';
import type { AuthenticatedSession } from '@/types/auth.types';
import { prisma } from '@/lib/prisma';

/**
 * Legacy to new permission key mapping
 */
export const PERMISSION_KEY_MAP: Record<string, string> = {
  // Alerts
  create_alert: 'alerts.create',
  update_alert: 'alerts.update',
  delete_alert: 'alerts.delete',
  view_all_alerts: 'alerts.view_all',
  view_company_alerts: 'alerts.view_company',
  view_client_alerts: 'alerts.view_client',
  view_site_alerts: 'alerts.view_site',
  view_assigned_alerts: 'alerts.view_assigned',
  create_comment: 'alerts.comment',

  // Work Orders
  create_work_order: 'work_orders.create',
  update_work_order: 'work_orders.update',
  delete_work_order: 'work_orders.delete',
  view_all_work_orders: 'work_orders.view_all',
  view_assigned_work_orders: 'work_orders.view_assigned',
  view_client_work_orders: 'work_orders.view_client',
  assign_work_order: 'work_orders.assign',
  complete_work_order: 'work_orders.complete',
  cancel_work_order: 'work_orders.cancel',

  // Users
  create_user: 'users.create',
  update_user: 'users.update',
  delete_user: 'users.delete',
  view_all_users: 'users.view_all',
  view_company_users: 'users.view_company',
  view_client_users: 'users.view_client',

  // Assets
  create_asset: 'assets.create',
  update_asset: 'assets.update',
  delete_asset: 'assets.delete',
  view_assets: 'assets.view',
  change_asset_status: 'assets.change_status',
  view_asset_status_history: 'assets.view_status_history',

  // Client Companies
  create_client_company: 'client_companies.create',
  update_client_company: 'client_companies.update',
  delete_client_company: 'client_companies.delete',
  view_client_companies: 'client_companies.view',

  // Sites
  create_site: 'sites.create',
  update_site: 'sites.update',
  delete_site: 'sites.delete',
  view_sites: 'sites.view',

  // Companies
  create_company: 'companies.create',
  update_company: 'companies.update',
  delete_company: 'companies.delete',
  view_companies: 'companies.view',

  // Company Groups
  create_company_group: 'company_groups.create',
  update_company_group: 'company_groups.update',
  delete_company_group: 'company_groups.delete',
  view_company_groups: 'company_groups.view',
  manage_group_companies: 'company_groups.manage_companies',

  // Work Order Templates
  create_work_order_template: 'work_order_templates.create',
  update_work_order_template: 'work_order_templates.update',
  delete_work_order_template: 'work_order_templates.delete',
  view_work_order_templates: 'work_order_templates.view',

  // Email Configuration
  create_email_configuration: 'email_configuration.create',
  update_email_configuration: 'email_configuration.update',
  delete_email_configuration: 'email_configuration.delete',
  view_email_configurations: 'email_configuration.view',

  // Email Templates
  create_email_template: 'email_templates.create',
  update_email_template: 'email_templates.update',
  delete_email_template: 'email_templates.delete',
  view_email_templates: 'email_templates.view',

  // Features
  manage_features: 'features.manage',

  // Attendance
  view_attendance: 'attendance.view',
  create_attendance: 'attendance.create',
  update_attendance: 'attendance.update',
  delete_attendance: 'attendance.delete',
  view_all_attendance: 'attendance.view_all',
  view_company_attendance: 'attendance.view_company',

  // Locations
  manage_locations: 'locations.manage',

  // Inventory
  view_inventory_items: 'inventory.view_items',
  view_all_inventory: 'inventory.view_all',
  create_inventory_item: 'inventory.create_item',
  update_inventory_item: 'inventory.update_item',
  delete_inventory_item: 'inventory.delete_item',
  view_inventory_stock: 'inventory.view_stock',
  adjust_inventory_stock: 'inventory.adjust_stock',
  transfer_inventory: 'inventory.transfer',
  view_inventory_requests: 'inventory.view_requests',
  create_inventory_request: 'inventory.create_request',
  approve_inventory_request: 'inventory.approve_request',
  reject_inventory_request: 'inventory.reject_request',
  deliver_inventory_request: 'inventory.deliver_request',
  deliver_from_warehouse: 'inventory.deliver_from_warehouse',
  confirm_receipt: 'inventory.confirm_receipt',
  delete_inventory_request: 'inventory.delete_request',
  view_inventory_movements: 'inventory.view_movements'
};

/**
 * Convert legacy permission key to new key
 */
export function normalizePermissionKey(legacyKey: string): string {
  return PERMISSION_KEY_MAP[legacyKey] || legacyKey;
}

/**
 * Get permissions for a user
 * All users now use CustomRole (includes both system and custom roles)
 */
export async function getUserPermissions(session: AuthenticatedSession): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      roleId: true,
      role: {
        select: {
          key: true,
          isSystemRole: true,
          permissions: {
            select: {
              permission: {
                select: {
                  key: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    return [];
  }

  // Get permission keys from role's permissions
  const permissions = user.role.permissions.map(p => p.permission.key);

  // SUPER_ADMIN has wildcard permission - check by key for performance
  if (user.role.key === 'SUPER_ADMIN' || permissions.includes('*')) {
    return ['*'];
  }

  return permissions;
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(session: AuthenticatedSession, permission: string): Promise<boolean> {
  const normalizedKey = normalizePermissionKey(permission);
  const permissions = await getUserPermissions(session);

  // Check for wildcard permission (SUPER_ADMIN has all permissions)
  if (permissions.includes('*')) {
    return true;
  }

  // Check for exact permission match
  if (permissions.includes(normalizedKey)) {
    return true;
  }

  // Check for module wildcard (e.g., 'work_orders.*' matches 'work_orders.create')
  const [module] = normalizedKey.split('.');
  if (module && permissions.includes(`${module}.*`)) {
    return true;
  }

  return false;
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(session: AuthenticatedSession, permissions: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(session);

  // Check for wildcard permission
  if (userPermissions.includes('*')) {
    return true;
  }

  const normalizedPermissions = permissions.map(normalizePermissionKey);

  return normalizedPermissions.some(p => {
    // Check exact match
    if (userPermissions.includes(p)) return true;

    // Check module wildcard
    const [module] = p.split('.');
    if (module && userPermissions.includes(`${module}.*`)) return true;

    return false;
  });
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(session: AuthenticatedSession, permissions: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(session);

  // Check for wildcard permission
  if (userPermissions.includes('*')) {
    return true;
  }

  const normalizedPermissions = permissions.map(normalizePermissionKey);

  return normalizedPermissions.every(p => {
    // Check exact match
    if (userPermissions.includes(p)) return true;

    // Check module wildcard
    const [module] = p.split('.');
    if (module && userPermissions.includes(`${module}.*`)) return true;

    return false;
  });
}

/**
 * Require permission (throws if user doesn't have it)
 */
export async function requirePermission(session: AuthenticatedSession, permission: string): Promise<void> {
  const has = await hasPermission(session, permission);
  if (!has) {
    throw new Error('No tienes permisos para realizar esta acción');
  }
}
