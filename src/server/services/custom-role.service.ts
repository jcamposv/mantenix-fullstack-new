/**
 * Custom Role Service
 * Business logic layer for custom roles
 */

import { CustomRoleRepository, type CustomRoleWithPermissions } from '@/server/repositories/custom-role.repository';
import { PermissionService } from './permission.service';

export interface CreateCustomRoleDto {
  name: string;
  description?: string;
  color?: string;
  interfaceType?: 'MOBILE' | 'DASHBOARD' | 'BOTH';
  permissionIds: string[];
  companyId: string;
  createdBy: string;
}

export interface UpdateCustomRoleDto {
  name?: string;
  description?: string;
  color?: string;
  interfaceType?: 'MOBILE' | 'DASHBOARD' | 'BOTH';
  permissionIds?: string[];
}

export class CustomRoleService {
  private repository: CustomRoleRepository;
  private permissionService: PermissionService;

  constructor() {
    this.repository = new CustomRoleRepository();
    this.permissionService = new PermissionService();
  }

  /**
   * Get all custom roles for a company
   */
  async getRolesByCompany(companyId: string): Promise<CustomRoleWithPermissions[]> {
    return this.repository.findByCompany(companyId);
  }

  /**
   * Get custom role by ID
   */
  async getRoleById(id: string): Promise<CustomRoleWithPermissions | null> {
    return this.repository.findById(id);
  }

  /**
   * Create a new custom role
   */
  async createRole(data: CreateCustomRoleDto): Promise<CustomRoleWithPermissions> {
    // Validate role name is unique in company
    const nameExists = await this.repository.existsByName(data.companyId, data.name);
    if (nameExists) {
      throw new Error(`Ya existe un rol con el nombre "${data.name}" en esta empresa`);
    }

    // Validate permission IDs
    const validation = await this.permissionService.validatePermissionIds(data.permissionIds);
    if (!validation.valid) {
      throw new Error(`Los siguientes permisos no existen: ${validation.invalidIds.join(', ')}`);
    }

    // Create role
    const role = await this.repository.create({
      name: data.name,
      description: data.description,
      color: data.color || '#3b82f6',
      interfaceType: data.interfaceType || 'MOBILE',
      company: {
        connect: { id: data.companyId }
      },
      createdBy: data.createdBy
    });

    // Assign permissions
    if (data.permissionIds.length > 0) {
      await this.repository.assignPermissions(role.id, data.permissionIds);
    }

    // Return role with permissions
    const createdRole = await this.repository.findById(role.id);
    if (!createdRole) {
      throw new Error('Error al crear el rol');
    }

    return createdRole;
  }

  /**
   * Update custom role
   */
  async updateRole(id: string, data: UpdateCustomRoleDto): Promise<CustomRoleWithPermissions> {
    const existingRole = await this.repository.findById(id);
    if (!existingRole) {
      throw new Error('Rol no encontrado');
    }

    // Validate name uniqueness if name is being updated
    if (data.name && data.name !== existingRole.name) {
      const nameExists = await this.repository.existsByName(
        existingRole.companyId!,
        data.name,
        id
      );
      if (nameExists) {
        throw new Error(`Ya existe un rol con el nombre "${data.name}" en esta empresa`);
      }
    }

    // Validate permission IDs if being updated
    if (data.permissionIds) {
      const validation = await this.permissionService.validatePermissionIds(data.permissionIds);
      if (!validation.valid) {
        throw new Error(`Los siguientes permisos no existen: ${validation.invalidIds.join(', ')}`);
      }
    }

    // Update role basic info
    await this.repository.update(id, {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.color && { color: data.color }),
      ...(data.interfaceType && { interfaceType: data.interfaceType })
    });

    // Update permissions if provided
    if (data.permissionIds) {
      await this.repository.assignPermissions(id, data.permissionIds);
    }

    // Return updated role
    const updatedRole = await this.repository.findById(id);
    if (!updatedRole) {
      throw new Error('Error al actualizar el rol');
    }

    return updatedRole;
  }

  /**
   * Delete custom role (soft delete)
   */
  async deleteRole(id: string): Promise<void> {
    const role = await this.repository.findById(id);
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    // Check if role has users
    const canDelete = await this.repository.canDelete(id);
    if (!canDelete) {
      const userCount = await this.repository.countUsers(id);
      throw new Error(
        `No se puede eliminar el rol porque tiene ${userCount} usuario(s) asignado(s). Por favor, reasigna los usuarios a otro rol primero.`
      );
    }

    await this.repository.softDelete(id);
  }

  /**
   * Get permission keys for a role
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    return this.repository.getPermissionKeys(roleId);
  }

  /**
   * Check if user's company can access role
   */
  async validateRoleAccess(roleId: string, userCompanyId: string): Promise<boolean> {
    const role = await this.repository.findById(roleId);
    if (!role) {
      return false;
    }

    return role.companyId === userCompanyId;
  }

  /**
   * Get role statistics
   */
  async getRoleStats(roleId: string): Promise<{
    userCount: number;
    permissionCount: number;
  }> {
    const role = await this.repository.findById(roleId);
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    return {
      userCount: role._count.users,
      permissionCount: role.permissions.length
    };
  }

  /**
   * Duplicate role (create a copy with a new name)
   */
  async duplicateRole(
    roleId: string,
    newName: string,
    createdBy: string
  ): Promise<CustomRoleWithPermissions> {
    const sourceRole = await this.repository.findById(roleId);
    if (!sourceRole) {
      throw new Error('Rol fuente no encontrado');
    }

    // Cannot duplicate system roles (they have companyId = null)
    if (!sourceRole.companyId) {
      throw new Error('No se pueden duplicar roles del sistema');
    }

    const permissionIds = sourceRole.permissions.map((p) => p.permission.id);

    return this.createRole({
      name: newName,
      description: sourceRole.description
        ? `${sourceRole.description} (copia)`
        : undefined,
      color: sourceRole.color,
      permissionIds,
      companyId: sourceRole.companyId,
      createdBy
    });
  }
}
