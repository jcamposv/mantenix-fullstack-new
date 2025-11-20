import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { SiteRepository } from "../repositories/site.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import type { AuthenticatedSession } from "@/types/auth.types"
import type { SiteFilters, PaginatedSitesResponse, SiteWithRelations } from "@/types/site.types"
import type { CreateSiteInput, UpdateSiteInput } from "../../app/api/schemas/site-schemas"

/**
 * Servicio de lógica de negocio para sedes
 * Contiene las reglas de negocio y orquesta las operaciones
 */
export class SiteService {
  
  /**
   * Construye el WHERE clause para filtrar sedes según el rol del usuario
   */
  static buildWhereClause(session: AuthenticatedSession, siteId?: string, filters?: SiteFilters): Prisma.SiteWhereInput {
    const whereClause: Prisma.SiteWhereInput = siteId ? { id: siteId } : {}

    // Aplicar filtros de acceso por rol
    if (session.user.role === "SUPER_ADMIN") {
      // Super admin puede ver todas las sedes
    } else if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO") {
      if (!session.user.companyId) {
        throw new Error("Usuario sin empresa asociada")
      }
      // Admin empresa/grupo solo puede ver sedes de empresas cliente de su empresa
      whereClause.clientCompany = {
        tenantCompanyId: session.user.companyId
      }
    } else if (session.user.role === "CLIENTE_ADMIN_GENERAL") {
      if (!session.user.clientCompanyId) {
        throw new Error("Usuario sin empresa cliente asociada")
      }
      // Admin general cliente solo puede ver sedes de su empresa cliente
      whereClause.clientCompanyId = session.user.clientCompanyId
    } else if (session.user.role === "CLIENTE_ADMIN_SEDE") {
      if (!session.user.siteId) {
        throw new Error("Usuario sin sede asociada")
      }
      // Admin sede solo puede ver su propia sede
      whereClause.id = session.user.siteId
    } else {
      throw new Error("Rol no autorizado para gestionar sedes")
    }

    // Aplicar filtros adicionales
    if (filters) {
      if (filters.clientCompanyId) whereClause.clientCompanyId = filters.clientCompanyId
      if (filters.tenantCompanyId) {
        whereClause.clientCompany = {
          tenantCompanyId: filters.tenantCompanyId
        }
      }
      if (filters.isActive !== undefined) whereClause.isActive = filters.isActive
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { address: { contains: filters.search, mode: 'insensitive' } },
          { contactName: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    }

    // Por defecto, solo mostrar sedes activas
    if (whereClause.isActive === undefined) {
      whereClause.isActive = true
    }

    return whereClause
  }

  /**
   * Obtiene una sede por ID verificando permisos
   */
  static async getById(siteId: string, session: AuthenticatedSession): Promise<SiteWithRelations | null> {
    const whereClause = this.buildWhereClause(session, siteId)
    return await SiteRepository.findFirst(whereClause)
  }

  /**
   * Obtiene lista paginada de sedes
   */
  static async getList(session: AuthenticatedSession, filters: SiteFilters, page: number, limit: number): Promise<PaginatedSitesResponse> {
    // Verificar permisos
    await PermissionGuard.require(session, 'sites.view')

    const whereClause = this.buildWhereClause(session, undefined, filters)
    const { items, total } = await SiteRepository.findMany(whereClause, page, limit)

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Obtiene todas las sedes (sin paginación)
   */
  static async getAll(session: AuthenticatedSession): Promise<SiteWithRelations[]> {
    // Verificar permisos
    await PermissionGuard.require(session, 'sites.view')

    const whereClause = this.buildWhereClause(session)
    return await SiteRepository.findAll(whereClause)
  }

  /**
   * Crea una nueva sede
   */
  static async create(siteData: CreateSiteInput, session: AuthenticatedSession): Promise<SiteWithRelations> {
    // Verificar permisos
    await PermissionGuard.require(session, 'sites.create')

    // Validar empresa cliente según el rol
    await this.validateClientCompany(siteData.clientCompanyId, session)

    // Preparar datos para crear
    const createData: Prisma.SiteCreateInput = {
      name: siteData.name,
      address: siteData.address,
      phone: siteData.phone,
      email: siteData.email,
      contactName: siteData.contactName,
      latitude: siteData.latitude,
      longitude: siteData.longitude,
      timezone: siteData.timezone || "UTC",
      notes: siteData.notes,
      clientCompany: { connect: { id: siteData.clientCompanyId } },
      createdByUser: { connect: { id: session.user.id } }
    }

    return await SiteRepository.create(createData)
  }

  /**
   * Actualiza una sede
   */
  static async update(id: string, siteData: UpdateSiteInput, session: AuthenticatedSession): Promise<SiteWithRelations | null> {
    // Verificar permisos
    await PermissionGuard.require(session, 'sites.update')

    // Verificar que la sede existe y se tiene acceso
    const existingSite = await this.getById(id, session)
    if (!existingSite) {
      return null
    }

    // Preparar datos para actualizar
    const updateData: Prisma.SiteUpdateInput = {
      name: siteData.name,
      address: siteData.address,
      phone: siteData.phone,
      email: siteData.email,
      contactName: siteData.contactName,
      latitude: siteData.latitude,
      longitude: siteData.longitude,
      timezone: siteData.timezone,
      notes: siteData.notes,
      updatedAt: new Date()
    }

    return await SiteRepository.update(id, updateData)
  }

  /**
   * Elimina (desactiva) una sede
   */
  static async delete(id: string, session: AuthenticatedSession): Promise<SiteWithRelations | null> {
    // Verificar permisos
    await PermissionGuard.require(session, 'sites.delete')

    // Verificar que la sede existe y se tiene acceso
    const existingSite = await SiteRepository.findWithRelatedData(id)
    if (!existingSite) {
      return null
    }

    // Verificar permisos de acceso por rol
    if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO") {
      if (!session.user.companyId || existingSite.clientCompany?.tenantCompany.id !== session.user.companyId) {
        throw new Error("No tienes acceso a esta sede")
      }
    }

    // Verificar que no tenga usuarios asignados
    if (existingSite.siteUsers && existingSite.siteUsers.length > 0) {
      throw new Error("No se puede eliminar una sede con usuarios asignados. Primero reasigne o elimine todos los usuarios.")
    }

    // Verificar invitaciones pendientes
    const pendingInvitations = await SiteRepository.countPendingInvitations(id)
    if (pendingInvitations > 0) {
      throw new Error("No se puede eliminar una sede con invitaciones pendientes. Primero cancele todas las invitaciones.")
    }

    return await SiteRepository.delete(id)
  }

  /**
   * Valida que la empresa cliente existe y el usuario tiene acceso
   */
  private static async validateClientCompany(clientCompanyId: string, session: AuthenticatedSession): Promise<void> {
    // Para admin empresa/grupo, verificar que la empresa cliente pertenece a su empresa
    if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO") {
      if (!session.user.companyId) {
        throw new Error("Usuario sin empresa asociada")
      }
      
      const clientCompany = await prisma.clientCompany.findFirst({
        where: {
          id: clientCompanyId,
          tenantCompanyId: session.user.companyId,
          isActive: true
        }
      })

      if (!clientCompany) {
        throw new Error("Empresa cliente no encontrada o no pertenece a tu empresa")
      }
    } else if (session.user.role === "SUPER_ADMIN") {
      // Super admin puede crear sedes para cualquier empresa cliente
      const clientCompany = await prisma.clientCompany.findUnique({
        where: { id: clientCompanyId }
      })

      if (!clientCompany) {
        throw new Error("Empresa cliente no encontrada")
      }
    }
  }
}