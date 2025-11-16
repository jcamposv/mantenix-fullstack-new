import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { AssetRepository } from "../repositories/asset.repository"
import { AuthService } from "./auth.service"
import { getCurrentCompanyId } from "@/lib/company-context"
import { getOrCreateInternalSite } from "@/lib/internal-site-helper"
import { parseCompanyFeatures } from "@/lib/features"
import type { AuthenticatedSession } from "@/types/auth.types"
import type { AssetFilters, PaginatedAssetsResponse, AssetWithRelations } from "@/types/asset.types"
import type { CreateAssetInput, UpdateAssetInput } from "../../app/api/schemas/asset-schemas"

/**
 * Servicio de lógica de negocio para activos
 * Contiene las reglas de negocio y orquesta las operaciones
 */
export class AssetService {
  
  /**
   * Construye el WHERE clause para filtrar activos según el rol del usuario
   * Uses getCurrentCompanyId to respect subdomain context for ADMIN_GRUPO
   * Filters by tenantCompanyId to show both internal and external assets
   */
  static async buildWhereClause(session: AuthenticatedSession, assetId?: string, filters?: AssetFilters): Promise<Prisma.AssetWhereInput> {
    const whereClause: Prisma.AssetWhereInput = assetId ? { id: assetId } : {}

    // Aplicar filtros de acceso por rol
    if (session.user.role === "SUPER_ADMIN") {
      // Super admin puede ver todos los activos
    } else if (
      session.user.role === "ADMIN_EMPRESA" ||
      session.user.role === "ADMIN_GRUPO" ||
      session.user.role === "JEFE_MANTENIMIENTO" ||
      session.user.role === "ENCARGADO_BODEGA" ||
      session.user.role === "SUPERVISOR" ||
      session.user.role === "TECNICO" ||
      session.user.role === "OPERARIO"
    ) {
      // Get company ID based on current subdomain (for ADMIN_GRUPO)
      const companyId = await getCurrentCompanyId(session)

      if (!companyId) {
        throw new Error("No se pudo determinar la empresa")
      }

      // Personal interno de la empresa puede ver todos los activos (internos y externos) de su empresa
      whereClause.site = {
        clientCompany: {
          tenantCompanyId: companyId
        }
      }
    } else if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
      if (!session.user.clientCompanyId) {
        throw new Error("Usuario sin empresa cliente asociada")
      }
      // Admin general cliente solo puede ver activos de sedes de su empresa cliente
      whereClause.site = {
        clientCompanyId: session.user.clientCompanyId
      }
    } else if (session.user.role === "CLIENTE_ADMIN_SEDE" || session.user.role === "CLIENTE_OPERARIO") {
      if (!session.user.siteId) {
        throw new Error("Usuario sin sede asociada")
      }
      // Site admin y operario cliente solo pueden ver activos de su sede
      whereClause.siteId = session.user.siteId
    } else {
      throw new Error("Rol no autorizado para gestionar activos")
    }

    // Aplicar filtros adicionales
    if (filters) {
      if (filters.siteId) whereClause.siteId = filters.siteId
      if (filters.status) whereClause.status = filters.status
      if (filters.category) whereClause.category = filters.category
      if (filters.isActive !== undefined) whereClause.isActive = filters.isActive
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { code: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { location: { contains: filters.search, mode: 'insensitive' } },
          { manufacturer: { contains: filters.search, mode: 'insensitive' } },
          { model: { contains: filters.search, mode: 'insensitive' } },
          { serialNumber: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    }

    // Por defecto, solo mostrar activos activos
    if (whereClause.isActive === undefined) {
      whereClause.isActive = true
    }

    return whereClause
  }

  /**
   * Obtiene un activo por ID verificando permisos
   */
  static async getById(assetId: string, session: AuthenticatedSession): Promise<AssetWithRelations | null> {
    const whereClause = await this.buildWhereClause(session, assetId)
    return await AssetRepository.findFirst(whereClause)
  }

  /**
   * Obtiene lista paginada de activos
   */
  static async getList(session: AuthenticatedSession, filters: AssetFilters, page: number, limit: number): Promise<PaginatedAssetsResponse> {
    // Verificar permisos
    const hasPermission = await AuthService.canUserPerformActionAsync(session, 'view_assets')

    if (!hasPermission) {
      throw new Error("No tienes permisos para ver activos")
    }

    const whereClause = await this.buildWhereClause(session, undefined, filters)
    const { assets, total } = await AssetRepository.findMany(whereClause, page, limit)

    return {
      assets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Obtiene todos los activos (sin paginación)
   */
  static async getAll(session: AuthenticatedSession): Promise<AssetWithRelations[]> {
    // Verificar permisos
    const hasPermission = await AuthService.canUserPerformActionAsync(session, 'view_assets')

    if (!hasPermission) {
      throw new Error("No tienes permisos para ver activos")
    }

    const whereClause = await this.buildWhereClause(session)
    return await AssetRepository.findAll(whereClause)
  }

  /**
   * Crea un nuevo activo
   * Auto-assigns internal site when EXTERNAL_CLIENT_MANAGEMENT is disabled
   */
  static async create(assetData: CreateAssetInput, session: AuthenticatedSession): Promise<AssetWithRelations> {
    // Verificar permisos
    if (!await AuthService.canUserPerformActionAsync(session, 'create_asset')) {
      throw new Error("No tienes permisos para crear activos")
    }

    // Get company ID for context
    const companyId = await getCurrentCompanyId(session)

    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    // Check if company has EXTERNAL_CLIENT_MANAGEMENT feature
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { features: true }
    })

    const featureFlags = parseCompanyFeatures(company?.features)
    const hasExternalClientMgmt = featureFlags.hasExternalClientMgmt

    // Determine siteId: use provided or auto-assign internal site
    let siteId = assetData.siteId

    if (!siteId) {
      if (hasExternalClientMgmt) {
        throw new Error("La sede es requerida para activos externos")
      }
      // Auto-assign internal site for internal assets
      siteId = await getOrCreateInternalSite(companyId, session.user.id)
    } else {
      // If siteId provided, validate user has access
      await this.validateSite(siteId, session)
    }

    // Verificar que el código no exista en la misma sede
    const codeExists = await AssetRepository.checkCodeExists(assetData.code, siteId)
    if (codeExists) {
      throw new Error("Ya existe un activo con este código en la sede seleccionada")
    }

    // Preparar datos para crear
    const createData: Prisma.AssetCreateInput = {
      name: assetData.name,
      code: assetData.code,
      description: assetData.description,
      location: assetData.location,
      images: assetData.images || [],
      status: assetData.status || "OPERATIVO",
      manufacturer: assetData.manufacturer,
      model: assetData.model,
      serialNumber: assetData.serialNumber,
      purchaseDate: assetData.purchaseDate,
      estimatedLifespan: assetData.estimatedLifespan,
      category: assetData.category,
      customFields: (assetData.customFields ?? undefined) as Prisma.InputJsonValue | undefined,
      site: { connect: { id: siteId } }
    }

    return await AssetRepository.create(createData)
  }

  /**
   * Actualiza un activo
   */
  static async update(id: string, assetData: UpdateAssetInput, session: AuthenticatedSession): Promise<AssetWithRelations | null> {
    // Verificar permisos
    if (!await AuthService.canUserPerformActionAsync(session, 'update_asset')) {
      throw new Error("No tienes permisos para actualizar activos")
    }

    // Verificar que el activo existe y se tiene acceso
    const existingAsset = await this.getById(id, session)
    if (!existingAsset) {
      return null
    }

    // Si se actualiza el código, verificar que no exista en la misma sede
    if (assetData.code && assetData.code !== existingAsset.code) {
      const siteId = assetData.siteId || existingAsset.siteId
      const codeExists = await AssetRepository.checkCodeExists(assetData.code, siteId, id)
      if (codeExists) {
        throw new Error("Ya existe un activo con este código en la sede seleccionada")
      }
    }

    // If site is updated, validate the new site
    if (assetData.siteId && assetData.siteId !== existingAsset.siteId) {
      await this.validateSite(assetData.siteId, session)
    }

    // Preparar datos para actualizar
    const updateData: Prisma.AssetUpdateInput = {
      name: assetData.name,
      code: assetData.code,
      description: assetData.description,
      location: assetData.location,
      images: assetData.images,
      status: assetData.status,
      manufacturer: assetData.manufacturer,
      model: assetData.model,
      serialNumber: assetData.serialNumber,
      purchaseDate: assetData.purchaseDate,
      estimatedLifespan: assetData.estimatedLifespan,
      category: assetData.category,
      customFields: (assetData.customFields ?? undefined) as Prisma.InputJsonValue | undefined,
      updatedAt: new Date(),
      site: assetData.siteId ? { connect: { id: assetData.siteId } } : undefined
    }

    return await AssetRepository.update(id, updateData)
  }

  /**
   * Elimina (desactiva) un activo
   */
  static async delete(id: string, session: AuthenticatedSession): Promise<AssetWithRelations | null> {
    // Verificar permisos
    if (!await AuthService.canUserPerformActionAsync(session, 'delete_asset')) {
      throw new Error("No tienes permisos para eliminar activos")
    }

    // Verificar que el activo existe y se tiene acceso
    const existingAsset = await AssetRepository.findWithRelatedData(id)
    if (!existingAsset) {
      return null
    }

    // Verificar permisos de acceso por rol
    if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO") {
      const companyId = await getCurrentCompanyId(session)
      if (!companyId || existingAsset.site?.clientCompany?.tenantCompanyId !== companyId) {
        throw new Error("No tienes acceso a este activo")
      }
    } else if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
      if (!session.user.clientCompanyId || existingAsset.site?.clientCompany?.id !== session.user.clientCompanyId) {
        throw new Error("No tienes acceso a este activo")
      }
    } else if (session.user.role === "CLIENTE_ADMIN_SEDE") {
      if (!session.user.siteId || existingAsset.siteId !== session.user.siteId) {
        throw new Error("No tienes acceso a este activo")
      }
    }

    // Verificar que no tenga órdenes de trabajo activas
    const activeWorkOrders = await AssetRepository.countActiveWorkOrders(id)
    if (activeWorkOrders > 0) {
      throw new Error("No se puede eliminar un activo con órdenes de trabajo activas. Primero complete o cancele todas las órdenes de trabajo.")
    }

    return await AssetRepository.delete(id)
  }

  /**
   * Validates that the site exists and the user has access
   * Uses getCurrentCompanyId for ADMIN_GRUPO context switching
   */
  private static async validateSite(siteId: string, session: AuthenticatedSession): Promise<void> {
    // For company/group admin, verify that the site belongs to a client company of their company
    if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO") {
      const companyId = await getCurrentCompanyId(session)

      if (!companyId) {
        throw new Error("No se pudo determinar la empresa")
      }

      const site = await prisma.site.findFirst({
        where: {
          id: siteId,
          clientCompany: {
            tenantCompanyId: companyId
          },
          isActive: true
        }
      })

      if (!site) {
        throw new Error("Sede no encontrada o no pertenece a tu empresa")
      }
    } else if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
      if (!session.user.clientCompanyId) {
        throw new Error("Usuario sin empresa cliente asociada")
      }
      
      const site = await prisma.site.findFirst({
        where: {
          id: siteId,
          clientCompanyId: session.user.clientCompanyId,
          isActive: true
        }
      })

      if (!site) {
        throw new Error("Sede no encontrada o no pertenece a tu empresa cliente")
      }
    } else if (session.user.role === "CLIENTE_ADMIN_SEDE") {
      if (!session.user.siteId || session.user.siteId !== siteId) {
        throw new Error("No tienes acceso a esta sede")
      }
    } else if (session.user.role === "SUPER_ADMIN") {
      // Super admin can create assets for any site
      const site = await prisma.site.findUnique({
        where: { id: siteId }
      })

      if (!site) {
        throw new Error("Sede no encontrada")
      }
    }
  }
}