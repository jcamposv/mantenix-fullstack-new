import { Prisma } from "@prisma/client"
import { WorkOrderTemplateRepository } from "../repositories/work-order-template.repository"
import { AuthService } from "./auth.service"
import type { AuthenticatedSession } from "@/types/auth.types"
import type { 
  CreateWorkOrderTemplateInput, 
  UpdateWorkOrderTemplateInput,
  WorkOrderTemplateFiltersInput
} from "@/app/api/schemas/work-order-template-schemas"

/**
 * Service for WorkOrderTemplate business logic
 * Contains business rules and orchestrates operations
 */
export class WorkOrderTemplateService {
  
  /**
   * Builds the WHERE clause for filtering templates according to user role
   */
  static buildWhereClause(
    session: AuthenticatedSession, 
    templateId?: string, 
    filters?: Omit<WorkOrderTemplateFiltersInput, 'page' | 'limit'>
  ): Prisma.WorkOrderTemplateWhereInput {
    const whereClause: Prisma.WorkOrderTemplateWhereInput = templateId ? { id: templateId } : {}

    // Apply access filters by role
    if (session.user.role === "SUPER_ADMIN") {
      // Super admin can see all templates
    } else if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO") {
      if (!session.user.companyId) {
        throw new Error("Usuario sin empresa asociada")
      }
      // Company/group admin can only see templates from their company
      whereClause.companyId = session.user.companyId
    } else {
      throw new Error("Rol no autorizado para gestionar templates de órdenes de trabajo")
    }

    // Apply additional filters
    if (filters) {
      if (filters.category) whereClause.category = filters.category
      if (filters.status) whereClause.status = filters.status
      if (filters.createdBy) whereClause.createdBy = filters.createdBy
      if (filters.isActive !== undefined) whereClause.isActive = filters.isActive
      if (filters.search) {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { category: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    }

    // By default, only show active templates
    if (whereClause.isActive === undefined) {
      whereClause.isActive = true
    }

    return whereClause
  }

  /**
   * Gets a template by ID verifying permissions
   */
  static async getById(templateId: string, session: AuthenticatedSession) {
    const whereClause = this.buildWhereClause(session, templateId)
    return await WorkOrderTemplateRepository.findFirst(whereClause)
  }

  /**
   * Gets paginated list of templates
   */
  static async getList(session: AuthenticatedSession, filters: WorkOrderTemplateFiltersInput) {
    // Verify permissions
    const hasPermission = await AuthService.canUserPerformActionAsync(session, 'view_work_order_templates')
    
    if (!hasPermission) {
      throw new Error("No tienes permisos para ver templates de órdenes de trabajo")
    }

    const { page, limit, ...filterParams } = filters
    const whereClause = this.buildWhereClause(session, undefined, filterParams)
    const { templates, total } = await WorkOrderTemplateRepository.findMany(whereClause, page, limit)

    return {
      templates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Gets all templates (without pagination)
   */
  static async getAll(session: AuthenticatedSession) {
    // Verify permissions
    const hasPermission = await AuthService.canUserPerformActionAsync(session, 'view_work_order_templates')
    
    if (!hasPermission) {
      throw new Error("No tienes permisos para ver templates de órdenes de trabajo")
    }

    const whereClause = this.buildWhereClause(session)
    return await WorkOrderTemplateRepository.findAll(whereClause)
  }

  /**
   * Creates a new template
   */
  static async create(templateData: CreateWorkOrderTemplateInput, session: AuthenticatedSession) {
    // Verify permissions
    if (!await AuthService.canUserPerformActionAsync(session, 'create_work_order_template')) {
      throw new Error("No tienes permisos para crear templates de órdenes de trabajo")
    }

    if (!session.user.companyId) {
      throw new Error("Usuario sin empresa asociada")
    }

    // Check if template name already exists
    const nameExists = await WorkOrderTemplateRepository.checkNameExists(
      templateData.name, 
      session.user.companyId
    )
    if (nameExists) {
      throw new Error("Ya existe un template con este nombre en tu empresa")
    }

    // Prepare data for creation
    const createData: Prisma.WorkOrderTemplateCreateInput = {
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      status: templateData.status || "ACTIVE",
      customFields: (templateData.customFields ?? undefined) as Prisma.InputJsonValue | undefined,
      company: { connect: { id: session.user.companyId } },
      creator: { connect: { id: session.user.id } }
    }

    return await WorkOrderTemplateRepository.create(createData)
  }

  /**
   * Updates a template
   */
  static async update(
    id: string, 
    templateData: UpdateWorkOrderTemplateInput, 
    session: AuthenticatedSession
  ) {
    // Verify permissions
    if (!await AuthService.canUserPerformActionAsync(session, 'update_work_order_template')) {
      throw new Error("No tienes permisos para actualizar templates de órdenes de trabajo")
    }

    // Verify that template exists and user has access
    const existingTemplate = await this.getById(id, session)
    if (!existingTemplate) {
      return null
    }

    // If name is updated, check that it doesn't already exist
    if (templateData.name && templateData.name !== existingTemplate.name) {
      const nameExists = await WorkOrderTemplateRepository.checkNameExists(
        templateData.name, 
        existingTemplate.companyId, 
        id
      )
      if (nameExists) {
        throw new Error("Ya existe un template con este nombre en tu empresa")
      }
    }

    // Prepare data for update
    const updateData: Prisma.WorkOrderTemplateUpdateInput = {
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      status: templateData.status,
      customFields: (templateData.customFields ?? undefined) as Prisma.InputJsonValue | undefined,
      updatedAt: new Date()
    }

    return await WorkOrderTemplateRepository.update(id, updateData)
  }

  /**
   * Deletes (deactivates) a template
   */
  static async delete(id: string, session: AuthenticatedSession) {
    // Verify permissions
    if (!await AuthService.canUserPerformActionAsync(session, 'delete_work_order_template')) {
      throw new Error("No tienes permisos para eliminar templates de órdenes de trabajo")
    }

    // Verify that template exists and user has access
    const existingTemplate = await WorkOrderTemplateRepository.findMinimal(id)
    if (!existingTemplate) {
      return null
    }

    // Check access based on role
    if (session.user.role === "ADMIN_EMPRESA" || session.user.role === "ADMIN_GRUPO") {
      if (!session.user.companyId || existingTemplate.companyId !== session.user.companyId) {
        throw new Error("No tienes acceso a este template")
      }
    }

    // Check if template has active work orders (for future implementation)
    // const activeWorkOrders = await WorkOrderTemplateRepository.countActiveWorkOrders(id)
    // if (activeWorkOrders > 0) {
    //   throw new Error("No se puede eliminar un template con órdenes de trabajo activas")
    // }

    return await WorkOrderTemplateRepository.delete(id)
  }

  /**
   * Gets template categories for a company
   */
  static async getCategories(session: AuthenticatedSession): Promise<string[]> {
    // Verify permissions
    const hasPermission = await AuthService.canUserPerformActionAsync(session, 'view_work_order_templates')
    
    if (!hasPermission) {
      throw new Error("No tienes permisos para ver templates de órdenes de trabajo")
    }

    if (!session.user.companyId) {
      throw new Error("Usuario sin empresa asociada")
    }

    return await WorkOrderTemplateRepository.getCategories(session.user.companyId)
  }

  /**
   * Gets template statistics for dashboard
   */
  static async getStats(session: AuthenticatedSession) {
    // Verify permissions
    const hasPermission = await AuthService.canUserPerformActionAsync(session, 'view_work_order_templates')
    
    if (!hasPermission) {
      throw new Error("No tienes permisos para ver estadísticas de templates")
    }

    if (!session.user.companyId) {
      throw new Error("Usuario sin empresa asociada")
    }

    const statusCounts = await WorkOrderTemplateRepository.countByStatus(session.user.companyId)
    const categories = await WorkOrderTemplateRepository.getCategories(session.user.companyId)

    return {
      totalTemplates: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
      activeTemplates: statusCounts.ACTIVE || 0,
      inactiveTemplates: statusCounts.INACTIVE || 0,
      categoriesCount: categories.length,
      categories
    }
  }

  /**
   * Gets templates suitable for a specific asset
   */
  static async getTemplatesForAsset(assetId: string, session: AuthenticatedSession) {
    // Verify permissions
    const hasPermission = await AuthService.canUserPerformActionAsync(session, 'view_work_order_templates')
    
    if (!hasPermission) {
      throw new Error("No tienes permisos para ver templates de órdenes de trabajo")
    }

    if (!session.user.companyId) {
      throw new Error("Usuario sin empresa asociada")
    }

    // Get asset category (this would require asset service integration)
    // For now, return all templates for the company
    return await WorkOrderTemplateRepository.findForAssetCategory(session.user.companyId)
  }
}