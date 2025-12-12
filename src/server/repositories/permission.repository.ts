/**
 * Permission Repository
 * Data access layer for permissions
 */

import { prisma } from '@/lib/prisma';
import type { Permission } from '@prisma/client';

export class PermissionRepository {
  /**
   * Get all permissions
   */
  async findAll(): Promise<Permission[]> {
    return prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [{ module: 'asc' }, { name: 'asc' }]
    });
  }

  /**
   * Get permissions by module
   */
  async findByModule(module: string): Promise<Permission[]> {
    return prisma.permission.findMany({
      where: {
        module,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get all modules with permissions count
   */
  async getModules(): Promise<{ module: string; count: number }[]> {
    const result = await prisma.permission.groupBy({
      by: ['module'],
      where: { isActive: true },
      _count: true,
      orderBy: {
        module: 'asc'
      }
    });

    return result.map((r) => ({
      module: r.module,
      count: r._count
    }));
  }

  /**
   * Get permission by ID
   */
  async findById(id: string): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { id }
    });
  }

  /**
   * Get permission by key
   */
  async findByKey(key: string): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { key }
    });
  }

  /**
   * Get permissions by IDs
   */
  async findByIds(ids: string[]): Promise<Permission[]> {
    return prisma.permission.findMany({
      where: {
        id: { in: ids },
        isActive: true
      }
    });
  }

  /**
   * Get permissions by keys
   */
  async findByKeys(keys: string[]): Promise<Permission[]> {
    return prisma.permission.findMany({
      where: {
        key: { in: keys },
        isActive: true
      }
    });
  }
}
