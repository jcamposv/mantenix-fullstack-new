/**
 * usePermissions Hook
 * Provides permission checking functionality for components
 *
 * Optimized with SWR for caching and deduplication to prevent duplicate API calls
 *
 * Usage:
 * const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();
 *
 * if (hasPermission('work_orders.create')) {
 *   // Show create button
 * }
 */

'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import type { Permission, UserPermissions, PermissionCheckOptions } from '@/types/permissions.types';

const fetcher = async (url: string): Promise<UserPermissions> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch permissions');
  return res.json();
};

export function usePermissions() {
  // Use SWR for permissions with caching and deduplication
  const { data, error, isLoading } = useSWR<UserPermissions>(
    '/api/user/permissions',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Dedupe requests within 60 seconds
      shouldRetryOnError: false,
    }
  );

  // Memoize permissions to prevent creating new array reference on every render
  const permissions = useMemo(
    () => data?.permissions ?? [],
    [data?.permissions]
  );
  const role = data?.role ?? null;

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (isLoading || !permissions.length) return false;

    // Check for wildcard permission (full access)
    if (permissions.includes('*')) return true;

    // Check exact permission
    if (permissions.includes(permission)) return true;

    // Check wildcard in module (e.g., 'work_orders.*' matches 'work_orders.create')
    const [module] = permission.split('.');
    if (permissions.includes(`${module}.*`)) return true;

    return false;
  }, [permissions, isLoading]);

  /**
   * Check if user has ANY of the provided permissions
   */
  const hasAnyPermission = useCallback((perms: Permission[]): boolean => {
    return perms.some(perm => hasPermission(perm));
  }, [hasPermission]);

  /**
   * Check if user has ALL of the provided permissions
   */
  const hasAllPermissions = useCallback((perms: Permission[]): boolean => {
    return perms.every(perm => hasPermission(perm));
  }, [hasPermission]);

  /**
   * Check multiple permissions with options
   */
  const checkPermissions = useCallback((
    perms: Permission[],
    options: PermissionCheckOptions = {}
  ): boolean => {
    const { requireAll = false } = options;
    return requireAll ? hasAllPermissions(perms) : hasAnyPermission(perms);
  }, [hasAllPermissions, hasAnyPermission]);

  return {
    permissions,
    role,
    loading: isLoading,
    error: error?.message ?? null,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermissions,
  };
}
