/**
 * Navigation System - Central Export
 *
 * Modular navigation configuration following operational workflow
 * Each module < 200 lines, following Next.js Expert standards
 */

// Type definitions
export type {
  NavigationItem,
  NavigationSubItem,
  NavigationGroup,
  NavigationConfig,
  UserPermissions,
  EnabledFeatures,
} from './types'

// Main navigation (operational workflow)
export { MAIN_NAV_ITEMS, getMainFeatureNavItems } from './main-nav'

// Admin navigation (configuration & management)
export {
  ADMIN_NAV_GROUPS,
  getClientManagementNav,
  getAttendanceManagementNav,
  getTimeOffManagementNav,
  buildAdminNavigation,
} from './admin-nav'

// Super admin navigation (SaaS platform)
export {
  SUPER_ADMIN_NAV_ITEMS,
  SUPER_ADMIN_PANEL_GROUPS,
} from './super-admin-nav'

// Client navigation (external users)
export { CLIENT_NAV_ITEMS } from './client-nav'

// Navigation builder (permission & feature filtering)
export {
  filterByPermissions,
  filterByFeatures,
  buildNavigation,
  mergeNavigationItems,
} from './builder'

// Navigation helpers (permission checks & state)
export {
  hasAnyPermission,
  hasAllPermissions,
  getActiveNavItem,
} from './helpers'
