import { Prisma } from "@prisma/client"
import { EmailConfigurationRepository } from "../repositories/email-configuration.repository"
import { AuthService } from "./auth.service"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  CreateEmailConfigurationData,
  UpdateEmailConfigurationData
} from "@/types/email.types"

/**
 * Servicio de lógica de negocio para configuraciones de email
 * Contiene las reglas de negocio y orquesta las operaciones
 */
export class EmailConfigurationService {

  /**
   * Construye el WHERE clause para filtrar configuraciones según el rol del usuario
   */
  static buildWhereClause(session: AuthenticatedSession, configId?: string): Prisma.EmailConfigurationWhereInput {
    const whereClause: Prisma.EmailConfigurationWhereInput = configId ? { id: configId } : {}

    // Solo activos y no eliminados
    whereClause.isActive = true
    whereClause.deletedAt = null

    // Aplicar filtros de acceso por rol
    if (session.user.role === "SUPER_ADMIN") {
      // Super admin puede ver todas las configuraciones
    } else if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "SUPERVISOR" || session.user.role === "TECNICO") {
      if (!session.user.companyId) {
        throw new Error("Usuario sin empresa asociada")
      }
      // Admin empresa puede ver solo la configuración de su empresa
      whereClause.companyId = session.user.companyId
    } else {
      throw new Error("Rol no autorizado para gestionar configuraciones de email")
    }

    return whereClause
  }

  /**
   * Obtiene una configuración por ID verificando permisos
   */
  static async getById(configId: string, session: AuthenticatedSession) {
    const whereClause = this.buildWhereClause(session, configId)
    return await EmailConfigurationRepository.findFirst(whereClause)
  }

  /**
   * Obtiene la configuración por company ID
   */
  static async getByCompanyId(
    companyId: string,
    session: AuthenticatedSession
  ) {
    // Verificar permisos
    this.validateCompanyAccess(companyId, session)

    return await EmailConfigurationRepository.findByCompanyId(companyId)
  }

  /**
   * Obtiene lista paginada de configuraciones
   */
  static async getList(
    session: AuthenticatedSession,
    page: number,
    limit: number
  ) {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'view_email_configurations')) {
      throw new Error("No tienes permisos para ver configuraciones de email")
    }

    const whereClause = this.buildWhereClause(session)
    const { configurations, total } = await EmailConfigurationRepository.findMany(whereClause, page, limit)

    return {
      configurations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Crea una nueva configuración de email
   */
  static async create(
    configData: CreateEmailConfigurationData,
    session: AuthenticatedSession
  ) {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'create_email_configuration')) {
      throw new Error("No tienes permisos para crear configuraciones de email")
    }

    // Verificar acceso a la company
    this.validateCompanyAccess(configData.companyId, session)

    // Verificar que no existe una configuración para esta company
    const existingConfig = await EmailConfigurationRepository.findByCompanyId(configData.companyId)
    if (existingConfig) {
      throw new Error("Ya existe una configuración de email para esta empresa")
    }

    // Preparar datos para crear
    const createData: Prisma.EmailConfigurationCreateInput = {
      apiToken: configData.apiToken,
      fromEmail: configData.fromEmail,
      fromName: configData.fromName,
      domainId: configData.domainId || null,
      replyToEmail: configData.replyToEmail || null,
      company: {
        connect: { id: configData.companyId }
      }
    }

    return await EmailConfigurationRepository.create(createData)
  }

  /**
   * Actualiza una configuración de email
   */
  static async update(
    id: string,
    configData: UpdateEmailConfigurationData,
    session: AuthenticatedSession
  ) {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'update_email_configuration')) {
      throw new Error("No tienes permisos para actualizar configuraciones de email")
    }

    // Verificar que la configuración existe y se tiene acceso
    const existingConfig = await this.getById(id, session)
    if (!existingConfig) {
      return null
    }

    // Preparar datos para actualizar
    const updateData: Prisma.EmailConfigurationUpdateInput = {}

    if (configData.apiToken !== undefined) updateData.apiToken = configData.apiToken
    if (configData.domainId !== undefined) updateData.domainId = configData.domainId
    if (configData.fromEmail !== undefined) updateData.fromEmail = configData.fromEmail
    if (configData.fromName !== undefined) updateData.fromName = configData.fromName
    if (configData.replyToEmail !== undefined) updateData.replyToEmail = configData.replyToEmail
    if (configData.isActive !== undefined) updateData.isActive = configData.isActive

    return await EmailConfigurationRepository.update(id, updateData)
  }

  /**
   * Elimina (soft delete) una configuración de email
   */
  static async delete(id: string, session: AuthenticatedSession) {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'delete_email_configuration')) {
      throw new Error("No tienes permisos para eliminar configuraciones de email")
    }

    // Verificar que la configuración existe y se tiene acceso
    const existingConfig = await this.getById(id, session)
    if (!existingConfig) {
      return null
    }

    return await EmailConfigurationRepository.softDelete(id)
  }

  /**
   * Valida que el usuario tenga acceso a la company
   */
  private static validateCompanyAccess(companyId: string, session: AuthenticatedSession): void {
    if (session.user.role === "SUPER_ADMIN") {
      return
    }

    if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "SUPERVISOR" || session.user.role === "TECNICO") {
      if (session.user.companyId !== companyId) {
        throw new Error("No tienes acceso a esta empresa")
      }
      return
    }

    throw new Error("Rol no autorizado")
  }
}
