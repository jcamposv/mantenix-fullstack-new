import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Repository for WorkOrderTemplate data access operations
 * Handles direct database interactions
 */
export class WorkOrderTemplateRepository {
  
  /**
   * Include relations for template queries
   */
  static getIncludeRelations(): Prisma.WorkOrderTemplateInclude {
    return {
      company: {
        select: {
          id: true,
          name: true,
          subdomain: true
        }
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
      // _count: {
      //   select: {
      //     workOrders: true // For future implementation
      //   }
      // }
    }
  }

  /**
   * Find template by ID with relations
   */
  static async findFirst(whereClause: Prisma.WorkOrderTemplateWhereInput) {
    return await prisma.workOrderTemplate.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    })
  }

  /**
   * Find multiple templates with pagination
   */
  static async findMany(
    whereClause: Prisma.WorkOrderTemplateWhereInput, 
    page: number, 
    limit: number
  ) {
    const skip = (page - 1) * limit

    const [templates, total] = await Promise.all([
      prisma.workOrderTemplate.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.workOrderTemplate.count({ where: whereClause })
    ])

    return { items: templates, total }
  }

  /**
   * Find all templates without pagination
   */
  static async findAll(whereClause: Prisma.WorkOrderTemplateWhereInput) {
    return await prisma.workOrderTemplate.findMany({
      where: whereClause,
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Create new template
   */
  static async create(templateData: Prisma.WorkOrderTemplateCreateInput) {
    return await prisma.workOrderTemplate.create({
      data: templateData,
      include: this.getIncludeRelations()
    })
  }

  /**
   * Update template
   */
  static async update(id: string, templateData: Prisma.WorkOrderTemplateUpdateInput) {
    return await prisma.workOrderTemplate.update({
      where: { id },
      data: templateData,
      include: this.getIncludeRelations()
    })
  }

  /**
   * Soft delete template (set isActive to false)
   */
  static async delete(id: string) {
    return await prisma.workOrderTemplate.update({
      where: { id },
      data: { 
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date()
      },
      include: this.getIncludeRelations()
    })
  }

  /**
   * Find template with minimal data for validation
   */
  static async findMinimal(id: string) {
    return await prisma.workOrderTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        companyId: true,
        createdBy: true,
        isActive: true,
        status: true
      }
    })
  }

  /**
   * Check if template name exists in the same company
   */
  static async checkNameExists(name: string, companyId: string, excludeId?: string): Promise<boolean> {
    const whereClause: Prisma.WorkOrderTemplateWhereInput = {
      name,
      companyId,
      isActive: true
    }

    if (excludeId) {
      whereClause.id = { not: excludeId }
    }

    const count = await prisma.workOrderTemplate.count({ where: whereClause })
    return count > 0
  }

  /**
   * Get templates by category for a company
   */
  static async findByCategory(companyId: string, category: string) {
    return await prisma.workOrderTemplate.findMany({
      where: {
        companyId,
        category,
        status: "ACTIVE",
        isActive: true
      },
      include: this.getIncludeRelations(),
      orderBy: { name: 'asc' }
    })
  }

  /**
   * Get template categories for a company
   */
  static async getCategories(companyId: string): Promise<string[]> {
    const result = await prisma.workOrderTemplate.findMany({
      where: {
        companyId,
        isActive: true,
        category: { not: null }
      },
      select: {
        category: true
      },
      distinct: ['category']
    })

    return result
      .map(item => item.category)
      .filter((category): category is string => category !== null)
      .sort()
  }

  /**
   * Count templates by status for a company
   */
  static async countByStatus(companyId: string) {
    const result = await prisma.workOrderTemplate.groupBy({
      by: ['status'],
      where: {
        companyId,
        isActive: true
      },
      _count: {
        id: true
      }
    })

    return result.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * Find templates that can be used for a specific asset type
   */
  static async findForAssetCategory(companyId: string, assetCategory?: string) {
    const whereClause: Prisma.WorkOrderTemplateWhereInput = {
      companyId,
      status: "ACTIVE",
      isActive: true
    }

    // If asset has a category, prioritize templates with the same category
    if (assetCategory) {
      whereClause.OR = [
        { category: assetCategory },
        { category: null } // Generic templates
      ]
    }

    return await prisma.workOrderTemplate.findMany({
      where: whereClause,
      include: this.getIncludeRelations(),
      orderBy: [
        { category: assetCategory ? 'asc' : 'desc' }, // Prioritize matching categories
        { name: 'asc' }
      ]
    })
  }
}