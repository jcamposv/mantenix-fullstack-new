/**
 * Navigation Permissions Configuration
 * Maps navigation items to required permissions
 */

export const NAVIGATION_PERMISSIONS = {
  // Work Orders
  'work_orders': 'work_orders.view',
  'work_orders_list': 'work_orders.view',
  'work_orders_my': 'work_orders.view_assigned',
  'work_orders_create': 'work_orders.create',
  'work_orders_templates': 'work_orders.manage_templates',
  'work_orders_prefixes': 'work_orders.manage_prefixes',

  // Analytics
  'analytics': 'analytics.view',

  // Admin
  'assets': 'assets.view',
  'inventory': 'inventory.view',
  'users': 'users.view',
  'client_companies': 'client_companies.view',
  'sites': 'sites.view',
  'custom_roles': 'custom_roles.view',

  // Attendance
  'attendance': 'attendance.view',
  'attendance_reports': 'attendance.view_reports',
  'locations': 'locations.view',

  // Production
  'production_lines': 'production_lines.view',
  'production_lines_create': 'production_lines.create',
} as const;

export type NavigationPermissionKey = keyof typeof NAVIGATION_PERMISSIONS;
