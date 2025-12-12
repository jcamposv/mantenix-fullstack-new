/**
 * Permission Guard Helper
 * Centralized permission checking for services
 * Follows Single Responsibility Principle
 */

import type { AuthenticatedSession } from '@/types/auth.types';
import { getUserPermissions } from './permission-utils';

export class PermissionGuard {
  /**
   * Checks if user has a specific permission
   * Throws error if permission is denied
   */
  static async require(
    session: AuthenticatedSession,
    permission: string
  ): Promise<void> {
    const permissions = await getUserPermissions(session);

    // Check wildcard permission
    if (permissions.includes('*')) {
      return;
    }

    // Check exact permission
    if (permissions.includes(permission)) {
      return;
    }

    // Check module wildcard (e.g., 'assets.*')
    const [module] = permission.split('.');
    if (permissions.includes(`${module}.*`)) {
      return;
    }

    throw new PermissionDeniedError(permission);
  }

  /**
   * Checks if user has any of the specified permissions
   */
  static async requireAny(
    session: AuthenticatedSession,
    permissions: string[]
  ): Promise<void> {
    const userPermissions = await getUserPermissions(session);

    // Check wildcard permission
    if (userPermissions.includes('*')) {
      return;
    }

    // Check if user has any of the required permissions
    const hasAny = permissions.some(permission => {
      if (userPermissions.includes(permission)) {
        return true;
      }

      // Check module wildcard
      const [module] = permission.split('.');
      return userPermissions.includes(`${module}.*`);
    });

    if (hasAny) {
      return;
    }

    throw new PermissionDeniedError(permissions.join(' or '));
  }

  /**
   * Checks if user has all specified permissions
   */
  static async requireAll(
    session: AuthenticatedSession,
    permissions: string[]
  ): Promise<void> {
    const userPermissions = await getUserPermissions(session);

    // Check wildcard permission
    if (userPermissions.includes('*')) {
      return;
    }

    // Check if user has all required permissions
    const hasAll = permissions.every(permission => {
      if (userPermissions.includes(permission)) {
        return true;
      }

      // Check module wildcard
      const [module] = permission.split('.');
      return userPermissions.includes(`${module}.*`);
    });

    if (hasAll) {
      return;
    }

    throw new PermissionDeniedError(permissions.join(' and '));
  }

  /**
   * Checks permission without throwing (returns boolean)
   */
  static async check(
    session: AuthenticatedSession,
    permission: string
  ): Promise<boolean> {
    try {
      await this.require(session, permission);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets all permissions for a user
   */
  static async getPermissions(
    session: AuthenticatedSession
  ): Promise<string[]> {
    return getUserPermissions(session);
  }
}

/**
 * Custom error for permission denied
 */
export class PermissionDeniedError extends Error {
  constructor(permission: string) {
    super(`No tienes permisos para realizar esta acción: ${permission}`);
    this.name = 'PermissionDeniedError';
  }
}
