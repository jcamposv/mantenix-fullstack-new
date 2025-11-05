import { Prisma } from "@prisma/client"
import { CompanyGroupRepository } from "@/server/repositories/company-group.repository"
import { PermissionHelper } from "@/server/helpers/permission.helper"
import type {
  CompanyGroupWithRelations,
  CompanyGroupWithDetails,
  CreateCompanyGroupData,
  UpdateCompanyGroupData,
  CompanyGroupFilters,
  PaginatedCompanyGroupsResponse,
  AddCompaniesToGroupData,
  RemoveCompaniesFromGroupData
} from "@/types/company-group.types"
import type { AuthenticatedSession } from "@/types/auth.types"

export class CompanyGroupService {

  static buildWhereClause(filters?: CompanyGroupFilters): Prisma.CompanyGroupWhereInput {
    const whereClause: Prisma.CompanyGroupWhereInput = {}

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (typeof filters?.shareInventory === 'boolean') {
      whereClause.shareInventory = filters.shareInventory
    }

    if (typeof filters?.isActive === 'boolean') {
      whereClause.isActive = filters.isActive
    }

    return whereClause
  }

  static async getList(
    session: AuthenticatedSession,
    filters?: CompanyGroupFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedCompanyGroupsResponse> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_COMPANY_GROUPS)

    let whereClause = this.buildWhereClause(filters)

    // SUPER_ADMIN sees all groups, ADMIN_GRUPO only sees their groups
    if (session.user.role === "ADMIN_GRUPO") {
      if (!session.user.companyId) {
        throw new Error("Usuario sin empresa asociada")
      }

      // Filter to only show groups that include the user's company
      whereClause = {
        ...whereClause,
        companies: {
          some: {
            id: session.user.companyId
          }
        }
      }
    }
    // SUPER_ADMIN sees all groups (no filter needed)

    const { companyGroups, total } = await CompanyGroupRepository.findMany(whereClause, page, limit)

    const totalPages = Math.ceil(total / limit)

    return {
      companyGroups,
      total,
      page,
      limit,
      totalPages
    }
  }

  static async getById(
    session: AuthenticatedSession,
    id: string
  ): Promise<CompanyGroupWithRelations | null> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_COMPANY_GROUPS)

    const group = await CompanyGroupRepository.findById(id)

    // ADMIN_GRUPO can only view their own group
    if (session.user.role === "ADMIN_GRUPO" && group) {
      await this.validateGroupAccess(session, group)
    }

    return group
  }

  static async getByIdWithDetails(
    session: AuthenticatedSession,
    id: string
  ): Promise<CompanyGroupWithDetails | null> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_COMPANY_GROUPS)

    const group = await CompanyGroupRepository.findByIdWithDetails(id)

    // ADMIN_GRUPO can only view their own group
    if (session.user.role === "ADMIN_GRUPO" && group) {
      await this.validateGroupAccess(session, group)
    }

    return group
  }

  static async create(
    session: AuthenticatedSession,
    data: CreateCompanyGroupData
  ): Promise<CompanyGroupWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.CREATE_COMPANY_GROUP)

    // Only SUPER_ADMIN can create new company groups
    if (session.user.role !== "SUPER_ADMIN") {
      throw new Error("Solo el super administrador puede crear grupos corporativos")
    }

    const createData: Prisma.CompanyGroupCreateInput = {
      name: data.name,
      description: data.description,
      logo: data.logo,
      shareInventory: data.shareInventory ?? true,
      autoApproveTransfers: data.autoApproveTransfers ?? false
    }

    // Connect selected companies if provided
    if (data.companyIds && data.companyIds.length > 0) {
      createData.companies = {
        connect: data.companyIds.map(id => ({ id }))
      }
    }

    return await CompanyGroupRepository.create(createData)
  }

  static async update(
    session: AuthenticatedSession,
    id: string,
    data: UpdateCompanyGroupData
  ): Promise<CompanyGroupWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.UPDATE_COMPANY_GROUP)

    // Verify the group exists
    const existingGroup = await CompanyGroupRepository.findById(id)
    if (!existingGroup) {
      throw new Error("Grupo corporativo no encontrado")
    }

    // ADMIN_GRUPO can only update their own group
    if (session.user.role === "ADMIN_GRUPO") {
      await this.validateGroupAccess(session, existingGroup)
    }

    const updateData: Prisma.CompanyGroupUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.logo !== undefined && { logo: data.logo }),
      ...(typeof data.shareInventory === 'boolean' && { shareInventory: data.shareInventory }),
      ...(typeof data.autoApproveTransfers === 'boolean' && { autoApproveTransfers: data.autoApproveTransfers }),
      ...(typeof data.isActive === 'boolean' && { isActive: data.isActive })
    }

    return await CompanyGroupRepository.update(id, updateData)
  }

  static async delete(
    session: AuthenticatedSession,
    id: string
  ): Promise<CompanyGroupWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.DELETE_COMPANY_GROUP)

    // Check if there are companies in the group
    const group = await CompanyGroupRepository.findByIdWithDetails(id)
    if (!group) {
      throw new Error("Grupo corporativo no encontrado")
    }

    // ADMIN_GRUPO can only delete their own group
    if (session.user.role === "ADMIN_GRUPO") {
      await this.validateGroupAccess(session, group)
    }

    if (group.companies.length > 0) {
      throw new Error("No se puede eliminar un grupo que tiene empresas asignadas")
    }

    return await CompanyGroupRepository.delete(id)
  }

  static async addCompanies(
    session: AuthenticatedSession,
    groupId: string,
    data: AddCompaniesToGroupData
  ): Promise<CompanyGroupWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.MANAGE_GROUP_COMPANIES)

    if (!data.companyIds || data.companyIds.length === 0) {
      throw new Error("Debe proporcionar al menos una empresa")
    }

    // Verify the group exists
    const group = await CompanyGroupRepository.findById(groupId)
    if (!group) {
      throw new Error("Grupo corporativo no encontrado")
    }

    // ADMIN_GRUPO can only add companies to their own group
    if (session.user.role === "ADMIN_GRUPO") {
      await this.validateGroupAccess(session, group)
    }

    return await CompanyGroupRepository.addCompanies(groupId, data.companyIds)
  }

  static async removeCompanies(
    session: AuthenticatedSession,
    groupId: string,
    data: RemoveCompaniesFromGroupData
  ): Promise<CompanyGroupWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.MANAGE_GROUP_COMPANIES)

    if (!data.companyIds || data.companyIds.length === 0) {
      throw new Error("Debe proporcionar al menos una empresa")
    }

    // Verify the group exists
    const group = await CompanyGroupRepository.findById(groupId)
    if (!group) {
      throw new Error("Grupo corporativo no encontrado")
    }

    // ADMIN_GRUPO can only remove companies from their own group
    if (session.user.role === "ADMIN_GRUPO") {
      await this.validateGroupAccess(session, group)
    }

    return await CompanyGroupRepository.removeCompanies(groupId, data.companyIds)
  }

  static async getGroupCompanies(
    session: AuthenticatedSession,
    groupId: string
  ) {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_COMPANY_GROUPS)
    return await CompanyGroupRepository.getGroupCompanies(groupId)
  }

  /**
   * Get all active company groups (for dropdowns, etc.)
   */
  static async getActiveGroups(session: AuthenticatedSession) {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_COMPANY_GROUPS)
    return await CompanyGroupRepository.findAll({ isActive: true })
  }

  /**
   * Validates that ADMIN_GRUPO has access to the specified group
   * ADMIN_GRUPO can only access groups that include their company
   */
  private static async validateGroupAccess(
    session: AuthenticatedSession,
    group: CompanyGroupWithRelations | CompanyGroupWithDetails
  ): Promise<void> {
    if (!session.user.companyId) {
      throw new Error("Usuario sin empresa asociada")
    }

    // Get group with companies to check if user's company is in the group
    const groupWithCompanies = 'companies' in group && Array.isArray(group.companies)
      ? group
      : await CompanyGroupRepository.findByIdWithDetails(group.id)

    if (!groupWithCompanies) {
      throw new Error("Grupo corporativo no encontrado")
    }

    if (!groupWithCompanies.companies || !Array.isArray(groupWithCompanies.companies)) {
      throw new Error("No se pudieron cargar las empresas del grupo")
    }

    const userCompanyInGroup = groupWithCompanies.companies.some(
      company => company.id === session.user.companyId
    )

    if (!userCompanyInGroup) {
      throw new Error("No tienes acceso a este grupo corporativo")
    }
  }
}
