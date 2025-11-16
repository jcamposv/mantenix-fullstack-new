/**
 * Custom Role Repository
 * Data access layer for custom roles
 */

import { prisma } from '@/lib/prisma';
import type { CustomRole, Prisma } from '@prisma/client';

export interface CustomRoleWithPermissions extends CustomRole {
  permissions: {
    id: string;
    permission: {
      id: string;
      key: string;
      name: string;
      module: string;
    };
  }[];
  _count: {
    users: number;
  };
}

export class CustomRoleRepository {
  /**
   * Get all custom roles for a company
   */
  async findByCompany(companyId: string): Promise<CustomRoleWithPermissions[]> {
    return prisma.customRole.findMany({
      where: {
        companyId,
        isActive: true,
        deletedAt: null
      },
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                id: true,
                key: true,
                name: true,
                module: true
              }
            }
          },
          orderBy: {
            permission: {
              module: 'asc'
            }
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get custom role by ID (with permissions)
   */
  async findById(id: string): Promise<CustomRoleWithPermissions | null> {
    return prisma.customRole.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                id: true,
                key: true,
                name: true,
                module: true
              }
            }
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });
  }

  /**
   * Check if role name exists in company
   */
  async existsByName(companyId: string, name: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.customRole.count({
      where: {
        companyId,
        name,
        isActive: true,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    return count > 0;
  }

  /**
   * Create custom role
   */
  async create(data: Prisma.CustomRoleCreateInput): Promise<CustomRole> {
    return prisma.customRole.create({
      data
    });
  }

  /**
   * Update custom role
   */
  async update(id: string, data: Prisma.CustomRoleUpdateInput): Promise<CustomRole> {
    return prisma.customRole.update({
      where: { id },
      data
    });
  }

  /**
   * Soft delete custom role
   */
  async softDelete(id: string): Promise<CustomRole> {
    return prisma.customRole.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });
  }

  /**
   * Assign permissions to role (replaces existing permissions)
   */
  async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Delete existing permissions
      await tx.customRolePermission.deleteMany({
        where: { customRoleId: roleId }
      });

      // Create new permissions
      if (permissionIds.length > 0) {
        await tx.customRolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            customRoleId: roleId,
            permissionId
          }))
        });
      }
    });
  }

  /**
   * Get permission keys for a role
   */
  async getPermissionKeys(roleId: string): Promise<string[]> {
    const permissions = await prisma.customRolePermission.findMany({
      where: { customRoleId: roleId },
      select: {
        permission: {
          select: {
            key: true
          }
        }
      }
    });

    return permissions.map((p) => p.permission.key);
  }

  /**
   * Count users assigned to a role
   */
  async countUsers(roleId: string): Promise<number> {
    return prisma.user.count({
      where: { customRoleId: roleId }
    });
  }

  /**
   * Check if role can be deleted (has no users)
   */
  async canDelete(roleId: string): Promise<boolean> {
    const userCount = await this.countUsers(roleId);
    return userCount === 0;
  }
}
