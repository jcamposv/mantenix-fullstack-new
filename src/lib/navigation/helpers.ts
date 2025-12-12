/**
 * Navigation Helper Utilities
 *
 * Permission checking and navigation state helpers
 * Following Next.js Expert standards
 */

import type { NavigationItem } from './types'

/**
 * Check if user has any of the required permissions
 * @param userPermissions - User's permission keys
 * @param requiredPermissions - Required permission(s)
 * @returns True if user has at least one required permission
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string | string[]
): boolean {
  if (typeof requiredPermissions === 'string') {
    return userPermissions.includes(requiredPermissions)
  }

  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  )
}

/**
 * Check if user has all required permissions
 * @param userPermissions - User's permission keys
 * @param requiredPermissions - Required permission(s)
 * @returns True if user has all required permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  )
}

/**
 * Get active navigation item based on current URL
 * @param items - Navigation items
 * @param currentPath - Current URL path
 * @returns Active navigation item or null
 */
export function getActiveNavItem(
  items: NavigationItem[],
  currentPath: string
): NavigationItem | null {
  for (const item of items) {
    // Check exact match
    if (item.url === currentPath) {
      return item
    }

    // Check sub-items
    if (item.items) {
      const activeSubItem = item.items.find((subItem) => subItem.url === currentPath)
      if (activeSubItem) {
        return item
      }
    }

    // Check partial match (for nested routes)
    if (currentPath.startsWith(item.url) && item.url !== '/') {
      return item
    }
  }

  return null
}
