import { Prisma, FeatureModule } from "@prisma/client"
import { FeatureRepository } from "@/server/repositories/feature.repository"
import { PermissionHelper } from "@/server/helpers/permission.helper"
import type {
  CompanyFeatureWithRelations,
  CreateFeatureData,
  UpdateFeatureData,
  FeatureToggleData,
  CompanyFeaturesMap,
  FeatureFilters,
  PaginatedFeaturesResponse
} from "@/types/feature.types"
import type { AuthenticatedSession } from "@/types/auth.types"

export class FeatureService {

  static buildWhereClause(filters?: FeatureFilters): Prisma.CompanyFeatureWhereInput {
    const whereClause: Prisma.CompanyFeatureWhereInput = {}

    if (filters?.companyId) {
      whereClause.companyId = filters.companyId
    }

    if (filters?.module) {
      whereClause.module = filters.module
    }

    if (typeof filters?.isEnabled === 'boolean') {
      whereClause.isEnabled = filters.isEnabled
    }

    return whereClause
  }

  static async getList(
    session: AuthenticatedSession,
    filters?: FeatureFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedFeaturesResponse> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_COMPANIES)

    const whereClause = this.buildWhereClause(filters)
    const { features, total } = await FeatureRepository.findMany(whereClause, page, limit)

    const totalPages = Math.ceil(total / limit)

    return {
      features,
      total,
      page,
      limit,
      totalPages
    }
  }

  static async getById(session: AuthenticatedSession, id: string): Promise<CompanyFeatureWithRelations | null> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.VIEW_COMPANIES)
    return await FeatureRepository.findById(id)
  }

  static async getCompanyFeatures(
    session: AuthenticatedSession,
    companyId: string
  ): Promise<CompanyFeatureWithRelations[]> {
    // Super admins can view any company's features
    const hasViewCompaniesPermission = PermissionHelper.hasPermission(
      session.user.role,
      PermissionHelper.PERMISSIONS.VIEW_COMPANIES
    )

    if (hasViewCompaniesPermission) {
      return await FeatureRepository.findAllByCompany(companyId)
    }

    // Regular users can only view their own company's features
    if (session.user.companyId !== companyId) {
      throw new Error("No tienes permisos para ver las features de esta empresa")
    }

    return await FeatureRepository.findAllByCompany(companyId)
  }

  static async getCompanyFeaturesMap(companyId: string): Promise<CompanyFeaturesMap> {
    const features = await FeatureRepository.findAllByCompany(companyId)

    const featuresMap: CompanyFeaturesMap = {}
    features.forEach(feature => {
      featuresMap[feature.module] = feature.isEnabled
    })

    return featuresMap
  }

  /**
   * Get company features for layout/public use (no session required)
   * Used by Server Components like layouts that need features without auth context
   */
  static async getCompanyFeaturesForLayout(companyId: string) {
    return await FeatureRepository.findAllByCompany(companyId)
  }

  static async isModuleEnabled(companyId: string, module: FeatureModule): Promise<boolean> {
    return await FeatureRepository.isModuleEnabled(companyId, module)
  }

  static async requireModuleEnabled(companyId: string, module: FeatureModule): Promise<void> {
    const isEnabled = await this.isModuleEnabled(companyId, module)

    if (!isEnabled) {
      throw new Error(`El módulo ${module} no está habilitado para esta empresa`)
    }
  }

  static async toggleFeature(
    session: AuthenticatedSession,
    data: FeatureToggleData
  ): Promise<CompanyFeatureWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.MANAGE_FEATURES)

    const { companyId, module, isEnabled, changedBy } = data

    const now = new Date()

    const createData: Prisma.CompanyFeatureCreateInput = {
      company: {
        connect: { id: companyId }
      },
      module,
      isEnabled,
      enabledAt: isEnabled ? now : undefined,
      ...(isEnabled && changedBy ? {
        enabledByUser: {
          connect: { id: changedBy }
        }
      } : {})
    }

    const updateData: Prisma.CompanyFeatureUpdateInput = {
      isEnabled,
      ...(isEnabled ? {
        enabledAt: now,
        disabledAt: null,
        disabledBy: null,
        ...(changedBy ? {
          enabledByUser: {
            connect: { id: changedBy }
          }
        } : {})
      } : {
        disabledAt: now,
        ...(changedBy ? {
          disabledBy: changedBy
        } : {})
      })
    }

    return await FeatureRepository.upsert(companyId, module, createData, updateData)
  }

  static async create(
    session: AuthenticatedSession,
    data: CreateFeatureData
  ): Promise<CompanyFeatureWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.MANAGE_FEATURES)

    const { companyId, module, isEnabled = true, enabledBy } = data

    const createData: Prisma.CompanyFeatureCreateInput = {
      company: {
        connect: { id: companyId }
      },
      module,
      isEnabled,
      enabledAt: isEnabled ? new Date() : undefined,
      ...(enabledBy ? {
        enabledByUser: {
          connect: { id: enabledBy }
        }
      } : {})
    }

    return await FeatureRepository.create(createData)
  }

  static async update(
    session: AuthenticatedSession,
    id: string,
    data: UpdateFeatureData
  ): Promise<CompanyFeatureWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.MANAGE_FEATURES)

    const updateData: Prisma.CompanyFeatureUpdateInput = {
      ...(typeof data.isEnabled === 'boolean' && { isEnabled: data.isEnabled }),
      ...(data.disabledBy && { disabledBy: data.disabledBy }),
      ...(data.disabledAt && { disabledAt: data.disabledAt })
    }

    return await FeatureRepository.update(id, updateData)
  }

  static async delete(
    session: AuthenticatedSession,
    id: string
  ): Promise<CompanyFeatureWithRelations> {
    await PermissionHelper.requirePermission(session, PermissionHelper.PERMISSIONS.MANAGE_FEATURES)
    return await FeatureRepository.delete(id)
  }
}
