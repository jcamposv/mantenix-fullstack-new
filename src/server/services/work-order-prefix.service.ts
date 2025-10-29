import { WorkOrderPrefixRepository } from "@/server/repositories/work-order-prefix.repository"
import type {
  CreateWorkOrderPrefixData,
  UpdateWorkOrderPrefixData,
  WorkOrderPrefixFilters,
} from "@/types/work-order-prefix.types"
import type { Role } from "@prisma/client"

export class WorkOrderPrefixService {
  /**
   * Validate if user has permission to manage prefixes
   * Only SUPER_ADMIN and ADMIN_EMPRESA can create/edit prefixes
   */
  private static validateManagePermission(role: Role): void {
    const allowedRoles: Role[] = ["SUPER_ADMIN", "ADMIN_EMPRESA"]

    if (!allowedRoles.includes(role)) {
      throw new Error("No tienes permisos para administrar prefijos de órdenes de trabajo")
    }
  }

  /**
   * Validate if user can view prefixes
   * All authenticated users in the company can view prefixes
   */
  private static validateViewPermission(role: Role): void {
    // All roles can view prefixes
    // This is just a placeholder for consistency
    return
  }

  /**
   * List work order prefixes with optional filters and pagination
   */
  static async listPrefixes(
    companyId: string,
    userRole: Role,
    filters?: WorkOrderPrefixFilters,
    page = 1,
    limit = 10
  ) {
    this.validateViewPermission(userRole)

    return await WorkOrderPrefixRepository.findMany(
      companyId,
      filters,
      page,
      limit
    )
  }

  /**
   * Get all active prefixes (for dropdowns)
   */
  static async getActivePrefixes(
    companyId: string,
    userRole: Role
  ) {
    this.validateViewPermission(userRole)

    return await WorkOrderPrefixRepository.findAllActive(companyId)
  }

  /**
   * Get a single prefix by ID
   */
  static async getPrefix(
    id: string,
    companyId: string,
    userRole: Role
  ) {
    this.validateViewPermission(userRole)

    const prefix = await WorkOrderPrefixRepository.findById(id, companyId)

    if (!prefix) {
      throw new Error("Prefix not found")
    }

    return prefix
  }

  /**
   * Create a new work order prefix
   */
  static async createPrefix(
    data: CreateWorkOrderPrefixData,
    companyId: string,
    userId: string,
    userRole: Role
  ) {
    this.validateManagePermission(userRole)

    // Validate code uniqueness
    const codeExists = await WorkOrderPrefixRepository.codeExists(
      data.code,
      companyId
    )

    if (codeExists) {
      throw new Error(
        `El código '${data.code.toUpperCase()}' ya está en uso. Por favor, elige otro código.`
      )
    }

    // Create the prefix
    return await WorkOrderPrefixRepository.create(
      data,
      companyId,
      userId
    )
  }

  /**
   * Update a work order prefix
   */
  static async updatePrefix(
    id: string,
    data: UpdateWorkOrderPrefixData,
    companyId: string,
    userRole: Role
  ) {
    this.validateManagePermission(userRole)

    // Check if prefix exists
    const existingPrefix = await WorkOrderPrefixRepository.findById(
      id,
      companyId
    )

    if (!existingPrefix) {
      throw new Error("Prefix not found")
    }

    // If code is being updated, validate uniqueness
    if (data.code && data.code !== existingPrefix.code) {
      const codeExists = await WorkOrderPrefixRepository.codeExists(
        data.code,
        companyId,
        id
      )

      if (codeExists) {
        throw new Error(
          `El código '${data.code.toUpperCase()}' ya está en uso. Por favor, elige otro código.`
        )
      }
    }

    // Update the prefix
    return await WorkOrderPrefixRepository.update(
      id,
      data,
      companyId
    )
  }

  /**
   * Soft delete a work order prefix
   */
  static async deletePrefix(
    id: string,
    companyId: string,
    userRole: Role
  ): Promise<void> {
    this.validateManagePermission(userRole)

    // Check if prefix exists
    const existingPrefix = await WorkOrderPrefixRepository.findById(
      id,
      companyId
    )

    if (!existingPrefix) {
      throw new Error("Prefix not found")
    }

    // Soft delete (keeps data but marks as inactive)
    await WorkOrderPrefixRepository.softDelete(id, companyId)
  }

  /**
   * Hard delete a work order prefix
   * Only possible if no work orders are associated
   */
  static async hardDeletePrefix(
    id: string,
    companyId: string,
    userRole: Role
  ): Promise<void> {
    this.validateManagePermission(userRole)

    // Check if prefix exists
    const existingPrefix = await WorkOrderPrefixRepository.findById(
      id,
      companyId
    )

    if (!existingPrefix) {
      throw new Error("Prefix not found")
    }

    // This will throw an error if there are associated work orders
    await WorkOrderPrefixRepository.hardDelete(id, companyId)
  }

  /**
   * Toggle prefix active status
   */
  static async toggleActive(
    id: string,
    companyId: string,
    userRole: Role
  ) {
    this.validateManagePermission(userRole)

    // Check if prefix exists
    const existingPrefix = await WorkOrderPrefixRepository.findById(
      id,
      companyId
    )

    if (!existingPrefix) {
      throw new Error("Prefix not found")
    }

    // Toggle active status
    return await WorkOrderPrefixRepository.update(
      id,
      { isActive: !existingPrefix.isActive },
      companyId
    )
  }
}
