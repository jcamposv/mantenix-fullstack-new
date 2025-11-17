/**
 * useFilteredNavigation Hook
 * Filters navigation items based on user permissions
 *
 * Usage:
 * const filteredItems = useFilteredNavigation(BASE_NAV_ITEMS);
 */

'use client';

import { useMemo } from 'react';
import { usePermissions } from './usePermissions';

interface NavItem {
  title?: string;
  name?: string;
  url: string;
  icon?: unknown;
  permission?: string;
  role?: string;
  requiresFeature?: string;
  items?: NavItem[];
  badge?: boolean;
  isActive?: boolean;
}

export function useFilteredNavigation<T extends NavItem>(
  items: T[],
  serverPermissions?: string[] | null
): T[] {
  const { hasPermission, loading } = usePermissions();

  return useMemo(() => {
    // If we have server permissions, use them immediately (no loading delay)
    const useServerPerms = serverPermissions !== undefined && serverPermissions !== null;

    // Only return empty if we're loading AND we don't have server permissions
    if (!useServerPerms && loading) return [];

    // Helper function to check permission using server data or client hook
    const checkPermission = (permission: string): boolean => {
      if (useServerPerms) {
        // Check permission using server permissions (instant, no loading)
        const perms = serverPermissions!;

        // Check for wildcard permission (full access)
        if (perms.includes('*')) return true;

        // Check exact permission
        if (perms.includes(permission)) return true;

        // Check wildcard in module (e.g., 'work_orders.*' matches 'work_orders.create')
        const [module] = permission.split('.');
        if (perms.includes(`${module}.*`)) return true;

        return false;
      }

      // Fallback to client-side hook (with loading delay)
      return hasPermission(permission);
    };

    function filterItems(navItems: T[]): T[] {
      return navItems
        .filter(item => {
          // If item has a permission requirement, check it
          if (item.permission) {
            return checkPermission(item.permission);
          }
          // If no permission specified, show the item
          return true;
        })
        .map(item => {
          // If item has sub-items, filter them recursively
          if (item.items && item.items.length > 0) {
            const filteredSubItems = filterItems(item.items as T[]);

            // If all sub-items are filtered out, hide the parent item
            if (filteredSubItems.length === 0) {
              return null;
            }

            return {
              ...item,
              items: filteredSubItems,
            };
          }

          return item;
        })
        .filter((item): item is T => item !== null);
    }

    return filterItems(items);
  }, [items, hasPermission, loading, serverPermissions]);
}
