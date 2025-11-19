import { Prisma } from "@prisma/client"
import { CompanyRepository } from "@/server/repositories/company.repository"
import { PermissionHelper } from "@/server/helpers/permission.helper"
import type { 
  CompanyWithRelations, 
  CompanyBranding, 
  CompanyBasicInfo,
  CreateCompanyData,
  UpdateCompanyData,
  CompanyFilters,
  PaginatedCompaniesResponse
} from "@/types/company.types"
import type { AuthenticatedSession } from "@/types/auth.types"

export class CompanyService {
  
  static buildWhereClause(filters?: CompanyFilters): Prisma.CompanyWhereInput {
    const whereClause: Prisma.CompanyWhereInput = {}

    if (filters?.tier) {
      whereClause.tier = filters.tier
    }

    if (typeof filters?.isActive === 'boolean') {
      whereClause.isActive = filters.isActive
    }

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { subdomain: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return whereClause
  }

  static async getList(
    session: AuthenticatedSession,
    filters?: CompanyFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedCompaniesResponse> {
    const isSuperAdmin = PermissionHelper.hasPermission(
      session.user.role,
      PermissionHelper.PERMISSIONS.VIEW_COMPANIES
    )
    const isGroupAdmin = session.user.role === 'ADMIN_GRUPO'
    const isCompanyAdmin = session.user.role === 'ADMIN_EMPRESA'

    // Build where clause based on role
    let whereClause = this.buildWhereClause(filters)

    if (!isSuperAdmin) {
      if (isGroupAdmin) {
        // ADMIN_GRUPO can see companies in their group
        if (session.user.companyGroupId) {
          whereClause = {
            ...whereClause,
            companyGroupId: session.user.companyGroupId
          }
        } else {
          // If ADMIN_GRUPO doesn't have a companyGroupId, return only their company
          whereClause = {
            ...whereClause,
            id: session.user.companyId
          }
        }
      } else if (isCompanyAdmin) {
        // ADMIN_EMPRESA can only see their own company
        whereClause = {
          ...whereClause,
          id: session.user.companyId
        }
      } else {
        throw new Error("No tienes permisos para ver empresas")
      }
    }

    const { companies, total } = await CompanyRepository.findMany(whereClause, page, limit)

    const totalPages = Math.ceil(total / limit)

    return {
      companies,
      total,
      page,
      limit,
      totalPages
    }
  }

  static async getById(session: AuthenticatedSession, id: string): Promise<CompanyWithRelations | null> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_COMPANIES)
    return await CompanyRepository.findById(id)
  }

  static async getBasicInfoById(session: AuthenticatedSession, id: string): Promise<CompanyBasicInfo | null> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.VIEW_COMPANIES)
    return await CompanyRepository.findBasicInfoById(id)
  }

  static async create(session: AuthenticatedSession, data: CreateCompanyData): Promise<CompanyWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.CREATE_COMPANY)

    const existingCompany = await CompanyRepository.findFirst({
      subdomain: data.subdomain
    })

    if (existingCompany) {
      throw new Error("El subdominio ya está en uso")
    }

    const createData: Prisma.CompanyCreateInput = {
      name: data.name,
      subdomain: data.subdomain,
      tier: data.tier || "STARTER",
      primaryColor: data.primaryColor || "#3b82f6",
      secondaryColor: data.secondaryColor || "#64748b",
      backgroundColor: data.backgroundColor || "#ffffff",
      logo: data.logo,
      mfaEnforced: data.mfaEnforced || false,
      ipWhitelist: data.ipWhitelist || []
    }

    const company = await CompanyRepository.create(createData)

    // Crear subscripción si se proporcionó un planId
    if (data.planId) {
      const { SubscriptionService } = await import('./subscription.service')
      await SubscriptionService.createSubscription({
        companyId: company.id,
        planId: data.planId,
        billingInterval: 'MONTHLY',
        startDate: new Date()
      })
    }

    return company
  }

  static async update(session: AuthenticatedSession, id: string, data: UpdateCompanyData): Promise<CompanyWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.UPDATE_COMPANY)

    if (data.subdomain) {
      const existingCompany = await CompanyRepository.findFirst({
        subdomain: data.subdomain,
        NOT: { id }
      })

      if (existingCompany) {
        throw new Error("El subdominio ya está en uso")
      }
    }

    const updateData: Prisma.CompanyUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.subdomain && { subdomain: data.subdomain }),
      ...(data.tier && { tier: data.tier }),
      ...(data.primaryColor && { primaryColor: data.primaryColor }),
      ...(data.secondaryColor && { secondaryColor: data.secondaryColor }),
      ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
      ...(data.logo !== undefined && { logo: data.logo }),
      ...(data.logoSmall !== undefined && { logoSmall: data.logoSmall }),
      ...(data.customFont !== undefined && { customFont: data.customFont }),
      ...(typeof data.mfaEnforced === 'boolean' && { mfaEnforced: data.mfaEnforced }),
      ...(data.ipWhitelist && { ipWhitelist: data.ipWhitelist }),
      ...(typeof data.isActive === 'boolean' && { isActive: data.isActive })
    }

    const company = await CompanyRepository.update(id, updateData)

    // Manejar cambio de plan
    if (data.planId) {
      const { SubscriptionService } = await import('./subscription.service')
      const { SubscriptionRepository } = await import('../repositories/subscription.repository')

      // Verificar si ya tiene subscripción
      const existingSubscription = await SubscriptionRepository.findByCompanyId(id)

      if (existingSubscription) {
        // Actualizar plan existente
        await SubscriptionService.updateSubscription({
          id: existingSubscription.id,
          planId: data.planId
        })

        // Re-activar features del nuevo plan
        await SubscriptionService.activatePlanFeatures(id, data.planId)
      } else {
        // Crear nueva subscripción
        await SubscriptionService.createSubscription({
          companyId: id,
          planId: data.planId,
          billingInterval: 'MONTHLY',
          startDate: new Date()
        })
      }
    }

    return company
  }

  static async delete(session: AuthenticatedSession, id: string): Promise<CompanyWithRelations> {
    await PermissionHelper.requirePermissionAsync(session, PermissionHelper.PERMISSIONS.DELETE_COMPANY)
    return await CompanyRepository.delete(id)
  }

  static async getBrandingBySubdomain(subdomain: string): Promise<CompanyBranding | null> {
    return await CompanyRepository.findBrandingBySubdomain(subdomain)
  }
}