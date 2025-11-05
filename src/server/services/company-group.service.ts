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

    const whereClause = this.buildWhereClause(filters)
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
    return await CompanyGroupRepository.findById(id)
  }

  static async getByIdWithDetails(
    session: AuthenticatedSession,
    id: string
  ): Promise<CompanyGroupWithDetails | null> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_COMPANY_GROUPS)
    return await CompanyGroupRepository.findByIdWithDetails(id)
  }

  static async create(
    session: AuthenticatedSession,
    data: CreateCompanyGroupData
  ): Promise<CompanyGroupWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.CREATE_COMPANY_GROUP)

    const createData: Prisma.CompanyGroupCreateInput = {
      name: data.name,
      description: data.description,
      shareInventory: data.shareInventory ?? true,
      autoApproveTransfers: data.autoApproveTransfers ?? false
    }

    // If companyIds are provided, connect them
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

    const updateData: Prisma.CompanyGroupUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
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
    if (group && group.companies.length > 0) {
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
}
