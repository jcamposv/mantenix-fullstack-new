/**
 * Permission Utilities
 * Maps legacy permission keys to new database permission keys
 */

import { CustomRoleRepository } from '@/server/repositories/custom-role.repository';
import type { Role } from '@prisma/client';
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
 * Base role permissions (from legacy PermissionHelper)
 * Maps Role enum to new permission keys
 */
const BASE_ROLE_PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: [
    'alerts.create', 'alerts.update', 'alerts.delete', 'alerts.view_all', 'alerts.comment',
    'work_orders.create', 'work_orders.update', 'work_orders.delete', 'work_orders.view', 'work_orders.view_all',
    'work_orders.view_assigned', 'work_orders.assign', 'work_orders.complete', 'work_orders.cancel',
    'work_orders.manage_templates', 'work_orders.manage_prefixes',
    'production_lines.create', 'production_lines.view', 'production_lines.update', 'production_lines.delete',
    'analytics.view',
    'users.create', 'users.update', 'users.delete', 'users.view_all', 'users.view',
    'custom_roles.create', 'custom_roles.view', 'custom_roles.update', 'custom_roles.delete',
    'client_companies.create', 'client_companies.update', 'client_companies.delete', 'client_companies.view',
    'sites.create', 'sites.update', 'sites.delete', 'sites.view',
    'companies.create', 'companies.update', 'companies.delete', 'companies.view',
    'company_groups.create', 'company_groups.update', 'company_groups.delete', 'company_groups.view', 'company_groups.manage_companies',
    'assets.create', 'assets.update', 'assets.delete', 'assets.view', 'assets.edit', 'assets.change_status', 'assets.view_status_history',
    'work_order_templates.create', 'work_order_templates.update', 'work_order_templates.delete', 'work_order_templates.view',
    'email_configuration.create', 'email_configuration.update', 'email_configuration.delete', 'email_configuration.view',
    'email_templates.create', 'email_templates.update', 'email_templates.delete', 'email_templates.view',
    'features.manage',
    'attendance.view_all', 'attendance.view', 'attendance.view_reports', 'attendance.create', 'attendance.update', 'attendance.delete',
    'locations.manage', 'locations.view',
    'inventory.view', 'inventory.view_items', 'inventory.view_all', 'inventory.create_item', 'inventory.update_item', 'inventory.delete_item',
    'inventory.view_stock', 'inventory.adjust_stock', 'inventory.transfer',
    'inventory.view_requests', 'inventory.create_request', 'inventory.approve_request', 'inventory.reject_request',
    'inventory.deliver_request', 'inventory.deliver_from_warehouse', 'inventory.confirm_receipt',
    'inventory.delete_request', 'inventory.view_movements'
  ],
  ADMIN_GRUPO: [
    'alerts.create', 'alerts.update', 'alerts.delete', 'alerts.view_company', 'alerts.comment',
    'work_orders.create', 'work_orders.update', 'work_orders.delete', 'work_orders.view', 'work_orders.view_all',
    'work_orders.view_assigned', 'work_orders.assign', 'work_orders.complete', 'work_orders.cancel',
    'work_orders.manage_templates', 'work_orders.manage_prefixes',
    'production_lines.create', 'production_lines.view', 'production_lines.update', 'production_lines.delete',
    'analytics.view',
    'users.create', 'users.update', 'users.delete', 'users.view_company', 'users.view',
    'custom_roles.create', 'custom_roles.view', 'custom_roles.update', 'custom_roles.delete',
    'client_companies.create', 'client_companies.update', 'client_companies.delete', 'client_companies.view',
    'sites.create', 'sites.update', 'sites.delete', 'sites.view',
    'company_groups.create', 'company_groups.update', 'company_groups.delete', 'company_groups.view', 'company_groups.manage_companies',
    'assets.create', 'assets.update', 'assets.delete', 'assets.view', 'assets.edit', 'assets.change_status', 'assets.view_status_history',
    'work_order_templates.create', 'work_order_templates.update', 'work_order_templates.delete', 'work_order_templates.view',
    'email_configuration.create', 'email_configuration.update', 'email_configuration.delete', 'email_configuration.view',
    'email_templates.create', 'email_templates.update', 'email_templates.delete', 'email_templates.view',
    'attendance.view_company', 'attendance.view', 'attendance.view_reports', 'attendance.create', 'attendance.update', 'attendance.delete',
    'locations.manage', 'locations.view',
    'inventory.view', 'inventory.view_items', 'inventory.view_all', 'inventory.create_item', 'inventory.update_item', 'inventory.delete_item',
    'inventory.view_stock', 'inventory.adjust_stock', 'inventory.transfer',
    'inventory.view_requests', 'inventory.create_request', 'inventory.approve_request', 'inventory.reject_request',
    'inventory.deliver_request', 'inventory.deliver_from_warehouse', 'inventory.confirm_receipt',
    'inventory.delete_request', 'inventory.view_movements'
  ],
  ADMIN_EMPRESA: [
    'alerts.create', 'alerts.update', 'alerts.delete', 'alerts.view_company', 'alerts.comment',
    'work_orders.create', 'work_orders.update', 'work_orders.delete', 'work_orders.view', 'work_orders.view_all',
    'work_orders.view_assigned', 'work_orders.assign', 'work_orders.complete', 'work_orders.cancel',
    'work_orders.manage_templates', 'work_orders.manage_prefixes',
    'production_lines.create', 'production_lines.view', 'production_lines.update', 'production_lines.delete',
    'analytics.view',
    'users.create', 'users.update', 'users.delete', 'users.view_company', 'users.view',
    'custom_roles.create', 'custom_roles.view', 'custom_roles.update', 'custom_roles.delete',
    'client_companies.create', 'client_companies.update', 'client_companies.delete', 'client_companies.view',
    'sites.create', 'sites.update', 'sites.delete', 'sites.view',
    'assets.create', 'assets.update', 'assets.delete', 'assets.view', 'assets.edit', 'assets.change_status', 'assets.view_status_history',
    'work_order_templates.create', 'work_order_templates.update', 'work_order_templates.delete', 'work_order_templates.view',
    'email_configuration.create', 'email_configuration.update', 'email_configuration.delete', 'email_configuration.view',
    'email_templates.create', 'email_templates.update', 'email_templates.delete', 'email_templates.view',
    'attendance.view_company', 'attendance.view', 'attendance.view_reports', 'attendance.create', 'attendance.update', 'attendance.delete',
    'locations.manage', 'locations.view',
    'inventory.view', 'inventory.view_items', 'inventory.view_all', 'inventory.create_item', 'inventory.update_item', 'inventory.delete_item',
    'inventory.view_stock', 'inventory.adjust_stock', 'inventory.transfer',
    'inventory.view_requests', 'inventory.create_request', 'inventory.approve_request', 'inventory.reject_request',
    'inventory.deliver_request', 'inventory.deliver_from_warehouse', 'inventory.confirm_receipt',
    'inventory.delete_request', 'inventory.view_movements'
  ],
  JEFE_MANTENIMIENTO: [
    'alerts.create', 'alerts.update', 'alerts.delete', 'alerts.view_company', 'alerts.comment',
    'work_orders.create', 'work_orders.update', 'work_orders.delete', 'work_orders.view', 'work_orders.view_all',
    'work_orders.assign', 'work_orders.complete', 'work_orders.cancel',
    'work_orders.manage_templates', 'work_orders.manage_prefixes',
    'analytics.view',
    'assets.view', 'assets.change_status', 'assets.view_status_history',
    'work_order_templates.create', 'work_order_templates.update', 'work_order_templates.delete', 'work_order_templates.view',
    'inventory.view_requests', 'inventory.approve_request', 'inventory.reject_request',
    'inventory.view_items', 'inventory.view_stock'
  ],
  ENCARGADO_BODEGA: [
    'inventory.view_items', 'inventory.view_all', 'inventory.create_item', 'inventory.update_item', 'inventory.delete_item',
    'inventory.view_stock', 'inventory.adjust_stock', 'inventory.transfer',
    'inventory.view_requests', 'inventory.deliver_request', 'inventory.deliver_from_warehouse',
    'inventory.confirm_receipt', 'inventory.view_movements'
  ],
  CLIENTE_ADMIN_GENERAL: [
    'alerts.create', 'alerts.update', 'alerts.view_client', 'alerts.comment',
    'users.view_client',
    'sites.view',
    'assets.create', 'assets.update', 'assets.delete', 'assets.view', 'assets.change_status', 'assets.view_status_history'
  ],
  CLIENTE_ADMIN_SEDE: [
    'alerts.create', 'alerts.update', 'alerts.view_site', 'alerts.comment',
    'sites.view',
    'assets.create', 'assets.update', 'assets.delete', 'assets.view', 'assets.change_status', 'assets.view_status_history'
  ],
  CLIENTE_OPERARIO: [
    'alerts.create', 'alerts.view_site', 'alerts.comment',
    'assets.view', 'assets.change_status', 'assets.view_status_history'
  ],
  TECNICO: [
    'alerts.create', 'alerts.update', 'alerts.view_assigned', 'alerts.comment',
    'work_orders.view_assigned', 'work_orders.update', 'work_orders.complete',
    'assets.view', 'assets.change_status', 'assets.view_status_history',
    'attendance.view', 'attendance.create',
    'inventory.view_requests', 'inventory.create_request', 'inventory.confirm_receipt',
    'inventory.view_items', 'inventory.view_stock'
  ],
  SUPERVISOR: [
    'alerts.create', 'alerts.update', 'alerts.view_company', 'alerts.comment',
    'work_orders.create', 'work_orders.update', 'work_orders.view', 'work_orders.view_all',
    'work_orders.assign', 'work_orders.complete', 'work_orders.cancel',
    'analytics.view',
    'assets.view', 'assets.change_status', 'assets.view_status_history',
    'attendance.view_company', 'attendance.create', 'attendance.update',
    'inventory.view_requests', 'inventory.create_request', 'inventory.approve_request',
    'inventory.reject_request', 'inventory.confirm_receipt',
    'inventory.view_items', 'inventory.view_stock'
  ],
  OPERARIO: [
    'assets.view', 'assets.change_status', 'assets.view_status_history',
    'alerts.create', 'alerts.view_company', 'alerts.comment'
  ]
};

/**
 * Get permissions for a user (handles both base roles and custom roles)
 */
export async function getUserPermissions(session: AuthenticatedSession): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      customRoleId: true
    }
  });

  if (!user) {
    return [];
  }

  // If user has a custom role, use those permissions
  if (user.customRoleId) {
    const repository = new CustomRoleRepository();
    return repository.getPermissionKeys(user.customRoleId);
  }

  // Otherwise, use base role permissions
  return BASE_ROLE_PERMISSIONS[user.role] || [];
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(session: AuthenticatedSession, permission: string): Promise<boolean> {
  const normalizedKey = normalizePermissionKey(permission);
  const permissions = await getUserPermissions(session);
  return permissions.includes(normalizedKey);
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(session: AuthenticatedSession, permissions: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(session);
  const normalizedPermissions = permissions.map(normalizePermissionKey);

  return normalizedPermissions.some(p => userPermissions.includes(p));
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(session: AuthenticatedSession, permissions: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(session);
  const normalizedPermissions = permissions.map(normalizePermissionKey);

  return normalizedPermissions.every(p => userPermissions.includes(p));
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
