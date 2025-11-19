/**
 * usePermissions Hook
 * Provides permission checking functionality for components
 *
 * Usage:
 * const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();
 *
 * if (hasPermission('work_orders.create')) {
 *   // Show create button
 * }
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Permission, UserPermissions, PermissionCheckOptions } from '@/types/permissions.types';

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        setLoading(true);
        const response = await fetch('/api/user/permissions');

        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }

        const data: UserPermissions = await response.json();
        setPermissions(data.permissions);
        setRole(data.role);
        setError(null);
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (loading || !permissions.length) return false;

    // Check for wildcard permission (full access)
    if (permissions.includes('*')) return true;

    // Check exact permission
    if (permissions.includes(permission)) return true;

    // Check wildcard in module (e.g., 'work_orders.*' matches 'work_orders.create')
    const [module] = permission.split('.');
    if (permissions.includes(`${module}.*`)) return true;

    return false;
  }, [permissions, loading]);

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
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermissions,
  };
}
