/**
 * Permission System Types
 * Defines types for the permission-based access control system
 */

export type Permission = string;

export interface UserPermissions {
  permissions: Permission[];
  role: string;
  customRoleId: string | null;
}

export interface PermissionCheckOptions {
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY
}
