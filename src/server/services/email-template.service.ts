import { Prisma } from "@prisma/client"
import { EmailTemplateRepository } from "../repositories/email-template.repository"
import { EmailConfigurationRepository } from "../repositories/email-configuration.repository"
import { AuthService } from "./auth.service"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  EmailTemplateType,
  CreateEmailTemplateData,
  UpdateEmailTemplateData,
  EmailTemplateFilters
} from "@/types/email.types"

/**
 * Servicio de lógica de negocio para templates de email
 * Contiene las reglas de negocio y orquesta las operaciones
 */
export class EmailTemplateService {

  /**
   * Construye el WHERE clause para filtrar templates según el rol del usuario
   */
  static async buildWhereClause(
    session: AuthenticatedSession,
    templateId?: string,
    filters?: EmailTemplateFilters
  ): Promise<Prisma.EmailTemplateWhereInput> {
    const whereClause: Prisma.EmailTemplateWhereInput = templateId ? { id: templateId } : {}

    // Solo activos y no eliminados
    whereClause.isActive = true
    whereClause.deletedAt = null

    // Aplicar filtros de acceso por rol
    if (session.user.role === "SUPER_ADMIN") {
      // Super admin puede ver todos los templates
    } else if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "SUPERVISOR" || session.user.role === "TECNICO") {
      if (!session.user.companyId) {
        throw new Error("Usuario sin empresa asociada")
      }
      // Admin empresa puede ver templates de su company
      whereClause.emailConfiguration = {
        is: {
          companyId: session.user.companyId
        }
      }
    } else {
      throw new Error("Rol no autorizado para gestionar templates de email")
    }

    // Aplicar filtros adicionales
    if (filters) {
      if (filters.emailConfigurationId) {
        whereClause.emailConfigurationId = filters.emailConfigurationId
      }
      if (filters.type) {
        whereClause.type = filters.type
      }
      if (filters.companyId) {
        whereClause.emailConfiguration = {
          is: {
            companyId: filters.companyId
          }
        }
      }
    }

    return whereClause
  }

  /**
   * Obtiene un template por ID verificando permisos
   */
  static async getById(templateId: string, session: AuthenticatedSession) {
    const whereClause = await this.buildWhereClause(session, templateId)
    return await EmailTemplateRepository.findFirst(whereClause)
  }

  /**
   * Obtiene un template por configuración y tipo
   */
  static async getByConfigurationAndType(
    emailConfigurationId: string,
    type: EmailTemplateType,
    session: AuthenticatedSession
  ) {
    // Verificar acceso a la configuración
    const config = await EmailConfigurationRepository.findById(emailConfigurationId)
    if (!config) {
      throw new Error("Configuración de email no encontrada")
    }

    // Validar acceso
    if (session.user.role !== "SUPER_ADMIN") {
      if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "SUPERVISOR" || session.user.role === "TECNICO") {
        if (config.companyId !== session.user.companyId) {
          throw new Error("No tienes acceso a esta configuración")
        }
      } else {
        throw new Error("Rol no autorizado")
      }
    }

    return await EmailTemplateRepository.findByConfigurationAndType(emailConfigurationId, type)
  }

  /**
   * Obtiene lista paginada de templates
   */
  static async getList(
    session: AuthenticatedSession,
    filters: EmailTemplateFilters,
    page: number,
    limit: number
  ) {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'view_email_templates')) {
      throw new Error("No tienes permisos para ver templates de email")
    }

    const whereClause = await this.buildWhereClause(session, undefined, filters)
    const { templates, total } = await EmailTemplateRepository.findMany(whereClause, page, limit)

    return {
      templates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Obtiene todos los templates de una configuración
   */
  static async getByEmailConfigurationId(
    emailConfigurationId: string,
    session: AuthenticatedSession
  ) {
    // Verificar acceso a la configuración
    const config = await EmailConfigurationRepository.findById(emailConfigurationId)
    if (!config) {
      throw new Error("Configuración de email no encontrada")
    }

    // Validar acceso
    if (session.user.role !== "SUPER_ADMIN") {
      if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "SUPERVISOR" || session.user.role === "TECNICO") {
        if (config.companyId !== session.user.companyId) {
          throw new Error("No tienes acceso a esta configuración")
        }
      } else {
        throw new Error("Rol no autorizado")
      }
    }

    return await EmailTemplateRepository.findByEmailConfigurationId(emailConfigurationId)
  }

  /**
   * Crea un nuevo template de email
   */
  static async create(
    templateData: CreateEmailTemplateData,
    session: AuthenticatedSession
  ) {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'create_email_template')) {
      throw new Error("No tienes permisos para crear templates de email")
    }

    // Verificar acceso a la configuración
    const config = await EmailConfigurationRepository.findById(templateData.emailConfigurationId)
    if (!config) {
      throw new Error("Configuración de email no encontrada")
    }

    // Validar acceso
    if (session.user.role !== "SUPER_ADMIN") {
      if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "SUPERVISOR" || session.user.role === "TECNICO") {
        if (config.companyId !== session.user.companyId) {
          throw new Error("No tienes acceso a esta configuración")
        }
      } else {
        throw new Error("Rol no autorizado")
      }
    }

    // Verificar que no existe un template del mismo tipo para esta configuración
    const existingTemplate = await EmailTemplateRepository.findByConfigurationAndType(
      templateData.emailConfigurationId,
      templateData.type
    )
    if (existingTemplate && existingTemplate.isActive) {
      throw new Error("Ya existe un template activo de este tipo para esta configuración")
    }

    // Preparar datos para crear
    const createData: Prisma.EmailTemplateCreateInput = {
      type: templateData.type,
      name: templateData.name,
      subject: templateData.subject,
      templateId: templateData.templateId || null,
      emailConfiguration: {
        connect: { id: templateData.emailConfigurationId }
      }
    }

    return await EmailTemplateRepository.create(createData)
  }

  /**
   * Actualiza un template de email
   */
  static async update(
    id: string,
    templateData: UpdateEmailTemplateData,
    session: AuthenticatedSession
  ) {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'update_email_template')) {
      throw new Error("No tienes permisos para actualizar templates de email")
    }

    // Verificar que el template existe y se tiene acceso
    const existingTemplate = await this.getById(id, session)
    if (!existingTemplate) {
      return null
    }

    // Preparar datos para actualizar
    const updateData: Prisma.EmailTemplateUpdateInput = {}

    if (templateData.name !== undefined) updateData.name = templateData.name
    if (templateData.subject !== undefined) updateData.subject = templateData.subject
    if (templateData.templateId !== undefined) updateData.templateId = templateData.templateId
    if (templateData.isActive !== undefined) updateData.isActive = templateData.isActive

    return await EmailTemplateRepository.update(id, updateData)
  }

  /**
   * Elimina (soft delete) un template de email
   */
  static async delete(id: string, session: AuthenticatedSession) {
    // Verificar permisos
    if (!AuthService.canUserPerformAction(session.user.role, 'delete_email_template')) {
      throw new Error("No tienes permisos para eliminar templates de email")
    }

    // Verificar que el template existe y se tiene acceso
    const existingTemplate = await this.getById(id, session)
    if (!existingTemplate) {
      return null
    }

    return await EmailTemplateRepository.softDelete(id)
  }
}
