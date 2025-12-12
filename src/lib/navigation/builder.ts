/**
 * Navigation Builder Utility
 *
 * SOLID pattern for building permission and feature-aware navigation
 * Single Responsibility: Each function handles one aspect of navigation filtering
 *
 * Following Next.js Expert standards
 */

import type { NavigationItem, EnabledFeatures } from './types'

/**
 * Filter navigation items based on user permissions
 * @param items - Navigation items to filter
 * @param userPermissions - User's permission keys
 * @returns Filtered navigation items
 */
export function filterByPermissions(
  items: NavigationItem[],
  userPermissions: string[]
): NavigationItem[] {
  return items
    .map((item) => {
      // Check if item requires permission
      if (item.permission && !userPermissions.includes(item.permission)) {
        return null
      }

      // Filter sub-items if they exist
      if (item.items) {
        const filteredSubItems = item.items.filter((subItem) => {
          if (subItem.permission && !userPermissions.includes(subItem.permission)) {
            return false
          }
          return true
        })

        // If all sub-items are filtered out, hide parent too
        if (filteredSubItems.length === 0) {
          return null
        }

        return {
          ...item,
          items: filteredSubItems,
        }
      }

      return item
    })
    .filter((item): item is NavigationItem => item !== null)
}

/**
 * Filter navigation items based on enabled features
 * @param items - Navigation items to filter
 * @param features - Enabled feature flags
 * @returns Filtered navigation items
 */
export function filterByFeatures(
  items: NavigationItem[],
  features: EnabledFeatures
): NavigationItem[] {
  return items
    .map((item) => {
      // Check if item requires feature
      if (item.requiresFeature) {
        const featureKey = item.requiresFeature as keyof EnabledFeatures
        if (!features[featureKey]) {
          return null
        }
      }

      // Sub-items inherit parent's feature requirement
      // No additional filtering needed for sub-items

      return item
    })
    .filter((item): item is NavigationItem => item !== null)
}

/**
 * Build navigation with permissions and features
 * @param items - Base navigation items
 * @param userPermissions - User's permission keys
 * @param features - Enabled feature flags
 * @returns Filtered and validated navigation
 */
export function buildNavigation(
  items: NavigationItem[],
  userPermissions: string[],
  features: EnabledFeatures
): NavigationItem[] {
  // First filter by features (removes entire sections)
  const featureFiltered = filterByFeatures(items, features)

  // Then filter by permissions (removes items within sections)
  const permissionFiltered = filterByPermissions(featureFiltered, userPermissions)

  return permissionFiltered
}

/**
 * Merge main navigation with feature-based navigation items
 * Inserts feature items at appropriate positions in the workflow
 *
 * @param mainItems - Base main navigation
 * @param featureItems - Feature-based navigation items
 * @returns Merged navigation maintaining workflow order
 */
export function mergeNavigationItems(
  mainItems: NavigationItem[],
  featureItems: NavigationItem[]
): NavigationItem[] {
  if (featureItems.length === 0) {
    return mainItems
  }

  // Create a copy to avoid mutations
  const merged = [...mainItems]

  // Insert preventive maintenance after Work Orders (position 3)
  const preventiveMaintenanceItem = featureItems.find(
    (item) => item.title === 'Mantenimiento Preventivo'
  )
  if (preventiveMaintenanceItem) {
    const workOrdersIndex = merged.findIndex(
      (item) => item.title === 'Órdenes de Trabajo'
    )
    if (workOrdersIndex !== -1) {
      merged.splice(workOrdersIndex + 1, 0, preventiveMaintenanceItem)
    }
  }

  // Add remaining feature items at the end
  const remainingFeatureItems = featureItems.filter(
    (item) => item.title !== 'Mantenimiento Preventivo'
  )
  merged.push(...remainingFeatureItems)

  return merged
}

