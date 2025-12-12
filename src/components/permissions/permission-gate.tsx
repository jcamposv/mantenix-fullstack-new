/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions
 *
 * Usage:
 * <PermissionGate permission="work_orders.create">
 *   <Button>Create Work Order</Button>
 * </PermissionGate>
 *
 * <PermissionGate permissions={['work_orders.create', 'work_orders.assign']} requireAll>
 *   <Button>Advanced Actions</Button>
 * </PermissionGate>
 */

'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/types/permissions.types';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  loading?: ReactNode;
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  loading: loadingComponent = null,
}: PermissionGateProps) {
  const { hasPermission, checkPermissions, loading } = usePermissions();

  // Show loading state if provided
  if (loading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  // Don't render anything while loading (unless loadingComponent is provided)
  if (loading) {
    return null;
  }

  // Check single permission
  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    return checkPermissions(permissions, { requireAll }) ? <>{children}</> : <>{fallback}</>;
  }

  // No permission specified, render children
  return <>{children}</>;
}
