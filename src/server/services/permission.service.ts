/**
 * Permission Service
 * Business logic layer for permissions
 */

import { PermissionRepository } from '@/server/repositories/permission.repository';
import type { Permission } from '@prisma/client';

export interface PermissionsByModule {
  module: string;
  permissions: Permission[];
}

export class PermissionService {
  private repository: PermissionRepository;

  constructor() {
    this.repository = new PermissionRepository();
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    return this.repository.findAll();
  }

  /**
   * Get permissions grouped by module
   */
  async getPermissionsByModule(): Promise<PermissionsByModule[]> {
    const permissions = await this.repository.findAll();

    // Group by module
    const grouped = permissions.reduce(
      (acc, permission) => {
        const existing = acc.find((g) => g.module === permission.module);
        if (existing) {
          existing.permissions.push(permission);
        } else {
          acc.push({
            module: permission.module,
            permissions: [permission]
          });
        }
        return acc;
      },
      [] as PermissionsByModule[]
    );

    return grouped.sort((a, b) => a.module.localeCompare(b.module));
  }

  /**
   * Get permissions for a specific module
   */
  async getPermissionsByModuleName(module: string): Promise<Permission[]> {
    return this.repository.findByModule(module);
  }

  /**
   * Get available modules
   */
  async getModules(): Promise<{ module: string; count: number }[]> {
    return this.repository.getModules();
  }

  /**
   * Get permission by ID
   */
  async getPermissionById(id: string): Promise<Permission | null> {
    return this.repository.findById(id);
  }

  /**
   * Get permission by key
   */
  async getPermissionByKey(key: string): Promise<Permission | null> {
    return this.repository.findByKey(key);
  }

  /**
   * Validate permission IDs exist
   */
  async validatePermissionIds(ids: string[]): Promise<{ valid: boolean; invalidIds: string[] }> {
    if (ids.length === 0) {
      return { valid: true, invalidIds: [] };
    }

    const permissions = await this.repository.findByIds(ids);
    const foundIds = new Set(permissions.map((p) => p.id));
    const invalidIds = ids.filter((id) => !foundIds.has(id));

    return {
      valid: invalidIds.length === 0,
      invalidIds
    };
  }

  /**
   * Get formatted module names
   */
  getModuleLabel(module: string): string {
    const labels: Record<string, string> = {
      alerts: 'Alertas',
      work_orders: 'Órdenes de Trabajo',
      work_order_templates: 'Plantillas de OT',
      users: 'Usuarios',
      assets: 'Activos',
      client_companies: 'Empresas Cliente',
      sites: 'Sedes',
      companies: 'Empresas',
      company_groups: 'Grupos Corporativos',
      email_configuration: 'Configuración de Email',
      email_templates: 'Plantillas de Email',
      features: 'Funcionalidades',
      attendance: 'Asistencia',
      locations: 'Ubicaciones',
      inventory: 'Inventario'
    };

    return labels[module] || module;
  }
}
