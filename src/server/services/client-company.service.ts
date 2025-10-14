import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { ClientCompanyRepository } from "../repositories/client-company.repository"
import { AuthService } from "./auth.service"
import type { AuthenticatedSession } from "@/types/auth.types"
import type { ClientCompanyFilters, PaginatedClientCompaniesResponse, ClientCompanyWithRelations } from "@/types/client-company.types"
import type { CreateClientCompanyInput, UpdateClientCompanyInput } from "../../app/api/schemas/client-company-schemas"

/**
 * Servicio de lógica de negocio para empresas cliente
 * Contiene las reglas de negocio y orquesta las operaciones
 */
export class ClientCompanyService {
  
  /**
   * Construye el WHERE clause para filtrar empresas cliente según el rol del usuario
   */
  static buildWhereClause(session: AuthenticatedSession, clientCompanyId?: string, filters?: ClientCompanyFilters): Prisma.ClientCompanyWhereInput {
    const whereClause: Prisma.ClientCompanyWhereInput = clientCompanyId ? { id: clientCompanyId } : {}

    // Aplicar filtros de acceso por rol
    if (session.user.role === "SUPER_ADMIN") {
      // Super admin puede ver todas las empresas cliente
    } else if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        throw new Error("Usuario sin empresa asociada")
      }
      // Admin empresa solo puede ver empresas cliente de su empresa
      whereClause.tenantCompanyId = session.user.companyId
    } else {
      throw new Error("Rol no autorizado para gestionar empresas cliente")
    }

    // Aplicar filtros adicionales
    if (filters) {
      if (filters.tenantCompanyId) whereClause.tenantCompanyId = filters.tenantCompanyId
      if (filters.isActive !== undefined) whereClause.isActive = filters.isActive
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { contactName: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    }

    // Por defecto, solo mostrar empresas activas
    if (whereClause.isActive === undefined) {
      whereClause.isActive = true
    }

    return whereClause
  }

  /**
   * Obtiene una empresa cliente por ID verificando permisos
   */
  static async getById(clientCompanyId: string, session: AuthenticatedSession): Promise<ClientCompanyWithRelations | null> {
    const whereClause = this.buildWhereClause(session, clientCompanyId)
    return await ClientCompanyRepository.findFirst(whereClause)
  }

  /**
   * Obtiene lista paginada de empresas cliente
   */
  static async getList(session: AuthenticatedSession, filters: ClientCompanyFilters, page: number, limit: number): Promise<PaginatedClientCompaniesResponse> {
    // Verificar permisos
    const hasPermission = AuthService.canUserPerformAction(session.user.role, 'view_client_companies')
    
    if (!hasPermission) {
      throw new Error("No tienes permisos para ver empresas cliente")
    }

    const whereClause = this.buildWhereClause(session, undefined, filters)
    const { clientCompanies, total } = await ClientCompanyRepository.findMany(whereClause, page, limit)

    return {
      clientCompanies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Obtiene todas las empresas cliente (sin paginación)
   */
  static async getAll(session: AuthenticatedSession): Promise<ClientCompanyWithRelations[]> {
    // Verificar permisos
    const hasPermission = AuthService.canUserPerformAction(session.user.role, 'view_client_companies')
    
    if (!hasPermission) {
      throw new Error("No tienes permisos para ver empresas cliente")
    }

    const whereClause = this.buildWhereClause(session)
    return await ClientCompanyRepository.findAll(whereClause)
  }

  /**
   * Crea una nueva empresa cliente
   */
  static async create(clientCompanyData: CreateClientCompanyInput, session: AuthenticatedSession): Promise<ClientCompanyWithRelations> {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'create_client_company')) {
      throw new Error("No tienes permisos para crear empresas cliente")
    }

    // Validar empresa tenant según el rol
    await this.validateTenantCompany(clientCompanyData, session)

    // Preparar datos para crear
    const createData: Prisma.ClientCompanyCreateInput = {
      name: clientCompanyData.name,
      companyId: clientCompanyData.companyId,
      address: clientCompanyData.address,
      phone: clientCompanyData.phone,
      email: clientCompanyData.email,
      contactName: clientCompanyData.contactName,
      logo: clientCompanyData.logo,
      latitude: clientCompanyData.latitude,
      longitude: clientCompanyData.longitude,
      notes: clientCompanyData.notes,
      tenantCompany: { connect: { id: clientCompanyData.tenantCompanyId } },
      createdByUser: { connect: { id: session.user.id } }
    }

    return await ClientCompanyRepository.create(createData)
  }

  /**
   * Actualiza una empresa cliente
   */
  static async update(id: string, clientCompanyData: UpdateClientCompanyInput, session: AuthenticatedSession): Promise<ClientCompanyWithRelations | null> {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'update_client_company')) {
      throw new Error("No tienes permisos para actualizar empresas cliente")
    }

    // Verificar que la empresa cliente existe y se tiene acceso
    const existingClientCompany = await this.getById(id, session)
    if (!existingClientCompany) {
      return null
    }

    // Preparar datos para actualizar
    const updateData: Prisma.ClientCompanyUpdateInput = {
      name: clientCompanyData.name,
      companyId: clientCompanyData.companyId,
      address: clientCompanyData.address,
      phone: clientCompanyData.phone,
      email: clientCompanyData.email,
      contactName: clientCompanyData.contactName,
      logo: clientCompanyData.logo,
      latitude: clientCompanyData.latitude,
      longitude: clientCompanyData.longitude,
      notes: clientCompanyData.notes,
      updatedAt: new Date()
    }

    return await ClientCompanyRepository.update(id, updateData)
  }

  /**
   * Elimina (desactiva) una empresa cliente
   */
  static async delete(id: string, session: AuthenticatedSession): Promise<ClientCompanyWithRelations | null> {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'delete_client_company')) {
      throw new Error("No tienes permisos para eliminar empresas cliente")
    }

    // Verificar que la empresa cliente existe y se tiene acceso
    const existingClientCompany = await ClientCompanyRepository.findWithRelatedData(id)
    if (!existingClientCompany) {
      return null
    }

    // Verificar permisos de acceso por rol
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId || existingClientCompany.tenantCompanyId !== session.user.companyId) {
        throw new Error("No tienes acceso a esta empresa cliente")
      }
    }

    // Verificar que no tenga sedes activas
    if (existingClientCompany.sites && existingClientCompany.sites.length > 0) {
      throw new Error("No se puede eliminar una empresa cliente con sedes activas. Primero desactive todas las sedes.")
    }

    // Verificar que no tenga usuarios externos
    if (existingClientCompany.externalUsers && existingClientCompany.externalUsers.length > 0) {
      throw new Error("No se puede eliminar una empresa cliente con usuarios externos. Primero elimine todos los usuarios externos.")
    }

    return await ClientCompanyRepository.delete(id)
  }

  /**
   * Valida la empresa tenant según el rol del usuario
   */
  private static async validateTenantCompany(clientCompanyData: CreateClientCompanyInput, session: AuthenticatedSession): Promise<void> {
    let targetTenantCompanyId = clientCompanyData.tenantCompanyId

    // Para admin empresa, forzar su propia empresa
    if (session.user.role === "ADMIN_EMPRESA") {
      if (!session.user.companyId) {
        throw new Error("Usuario sin empresa asociada")
      }
      targetTenantCompanyId = session.user.companyId
    }

    // Para super admin, requerir empresa
    if (session.user.role === "SUPER_ADMIN" && !targetTenantCompanyId) {
      throw new Error("Empresa es requerida para crear empresa cliente")
    }

    // Validar que la empresa existe
    const tenantCompany = await prisma.company.findUnique({
      where: { id: targetTenantCompanyId }
    })

    if (!tenantCompany) {
      throw new Error("Empresa no encontrada")
    }

    // Actualizar el ID de la empresa en los datos
    clientCompanyData.tenantCompanyId = targetTenantCompanyId
  }
}