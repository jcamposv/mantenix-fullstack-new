/**
 * Exploded View Component Repository
 *
 * Repository for ExplodedViewComponent data access operations.
 * Handles direct database interactions for component/part management.
 *
 * Following Next.js Expert standards:
 * - Repository pattern for data access layer
 * - Type-safe Prisma queries
 * - Proper error handling
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { ExplodedViewComponentWithRelations } from "@/types/exploded-view.types"

export class ExplodedViewComponentRepository {
  /**
   * Include relations for component queries
   */
  static getIncludeRelations(): Prisma.ExplodedViewComponentInclude {
    return {
      inventoryItem: {
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          unit: true,
          unitCost: true,
          lastPurchasePrice: true,
          averageCost: true,
          category: true,
          manufacturer: true,
          model: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
          subdomain: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          hotspots: true,
        },
      },
    }
  }

  /**
   * Find component by ID with relations
   */
  static async findById(id: string): Promise<ExplodedViewComponentWithRelations | null> {
    return await prisma.explodedViewComponent.findUnique({
      where: { id },
      include: this.getIncludeRelations(),
    }) as unknown as ExplodedViewComponentWithRelations | null
  }

  /**
   * Find first component matching criteria
   */
  static async findFirst(
    whereClause: Prisma.ExplodedViewComponentWhereInput
  ): Promise<ExplodedViewComponentWithRelations | null> {
    return await prisma.explodedViewComponent.findFirst({
      where: whereClause,
      include: this.getIncludeRelations(),
    }) as unknown as ExplodedViewComponentWithRelations | null
  }

  /**
   * Find multiple components with pagination
   */
  static async findMany(
    whereClause: Prisma.ExplodedViewComponentWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: ExplodedViewComponentWithRelations[]; total: number }> {
    const skip = (page - 1) * limit

    const [components, total] = await Promise.all([
      prisma.explodedViewComponent.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.explodedViewComponent.count({ where: whereClause }),
    ])

    return {
      items: components as unknown as ExplodedViewComponentWithRelations[],
      total,
    }
  }

  /**
   * Find all components without pagination
   */
  static async findAll(
    whereClause: Prisma.ExplodedViewComponentWhereInput
  ): Promise<ExplodedViewComponentWithRelations[]> {
    return await prisma.explodedViewComponent.findMany({
      where: whereClause,
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' },
    }) as unknown as ExplodedViewComponentWithRelations[]
  }

  /**
   * Create new component
   */
  static async create(
    data: Prisma.ExplodedViewComponentCreateInput
  ): Promise<ExplodedViewComponentWithRelations> {
    return await prisma.explodedViewComponent.create({
      data,
      include: this.getIncludeRelations(),
    }) as unknown as ExplodedViewComponentWithRelations
  }

  /**
   * Update component
   */
  static async update(
    id: string,
    data: Prisma.ExplodedViewComponentUpdateInput
  ): Promise<ExplodedViewComponentWithRelations> {
    return await prisma.explodedViewComponent.update({
      where: { id },
      data,
      include: this.getIncludeRelations(),
    }) as unknown as ExplodedViewComponentWithRelations
  }

  /**
   * Soft delete component (set isActive to false)
   */
  static async softDelete(id: string): Promise<ExplodedViewComponentWithRelations> {
    return await prisma.explodedViewComponent.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: this.getIncludeRelations(),
    }) as unknown as ExplodedViewComponentWithRelations
  }

  /**
   * Hard delete component (permanently remove from database)
   * Note: This will cascade delete all hotspots using this component
   */
  static async hardDelete(id: string): Promise<void> {
    await prisma.explodedViewComponent.delete({
      where: { id },
    })
  }

  /**
   * Count components matching criteria
   */
  static async count(whereClause: Prisma.ExplodedViewComponentWhereInput): Promise<number> {
    return await prisma.explodedViewComponent.count({ where: whereClause })
  }

  /**
   * Check if component exists
   */
  static async exists(id: string): Promise<boolean> {
    const count = await prisma.explodedViewComponent.count({
      where: { id, isActive: true },
    })
    return count > 0
  }

  /**
   * Find component by part number within a company
   */
  static async findByPartNumber(
    companyId: string,
    partNumber: string
  ): Promise<ExplodedViewComponentWithRelations | null> {
    return await this.findFirst({
      companyId,
      partNumber,
      isActive: true,
    })
  }

  /**
   * Find components linked to an inventory item
   */
  static async findByInventoryItemId(
    inventoryItemId: string
  ): Promise<ExplodedViewComponentWithRelations[]> {
    return await this.findAll({
      inventoryItemId,
      isActive: true,
    })
  }

  /**
   * Search components by text (name, partNumber, description, manufacturer)
   */
  static async search(
    companyId: string,
    searchTerm: string,
    page: number,
    limit: number
  ): Promise<{ items: ExplodedViewComponentWithRelations[]; total: number }> {
    const whereClause: Prisma.ExplodedViewComponentWhereInput = {
      companyId,
      isActive: true,
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { partNumber: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { manufacturer: { contains: searchTerm, mode: 'insensitive' } },
      ],
    }

    return await this.findMany(whereClause, page, limit)
  }

  /**
   * Bulk create components (for imports)
   */
  static async bulkCreate(
    componentsData: Prisma.ExplodedViewComponentCreateManyInput[]
  ): Promise<number> {
    const result = await prisma.explodedViewComponent.createMany({
      data: componentsData,
      skipDuplicates: true,
    })
    return result.count
  }

  /**
   * Get components by manufacturer
   */
  static async findByManufacturer(
    companyId: string,
    manufacturer: string
  ): Promise<ExplodedViewComponentWithRelations[]> {
    return await this.findAll({
      companyId,
      manufacturer,
      isActive: true,
    })
  }

  /**
   * Get components with low or no inventory stock
   */
  static async findWithLowStock(
    companyId: string
  ): Promise<ExplodedViewComponentWithRelations[]> {
    const components = await prisma.explodedViewComponent.findMany({
      where: {
        companyId,
        isActive: true,
        inventoryItem: {
          isNot: null,
        },
      },
      include: {
        ...this.getIncludeRelations(),
        inventoryItem: {
          include: {
            stockLocations: true,
          },
        },
      },
    })

    // Filter components where total stock is below reorder point
    return components.filter((component) => {
      if (!component.inventoryItem) return false
      const totalStock = component.inventoryItem.stockLocations?.reduce(
        (sum: number, s: { availableQuantity: number }) => sum + s.availableQuantity,
        0
      ) || 0
      return totalStock <= (component.inventoryItem.reorderPoint || 0)
    }) as unknown as ExplodedViewComponentWithRelations[]
  }
}
