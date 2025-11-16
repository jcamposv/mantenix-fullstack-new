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

export function useFilteredNavigation<T extends NavItem>(items: T[]): T[] {
  const { hasPermission, loading } = usePermissions();

  return useMemo(() => {
    if (loading) return [];

    function filterItems(navItems: T[]): T[] {
      return navItems
        .filter(item => {
          // If item has a permission requirement, check it
          if (item.permission) {
            return hasPermission(item.permission);
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
  }, [items, hasPermission, loading]);
}
