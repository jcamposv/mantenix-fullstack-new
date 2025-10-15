import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { AssetWithRelations } from "@/types/asset.types"

/**
 * Repository for Asset data access operations
 * Handles direct database interactions
 */
export class AssetRepository {
  
  /**
   * Include relations for asset queries
   */
  static getIncludeRelations(): Prisma.AssetInclude {
    return {
      site: {
        include: {
          clientCompany: {
            include: {
              tenantCompany: true
            }
          }
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
   * Find asset by ID with relations
   */
  static async findFirst(whereClause: Prisma.AssetWhereInput): Promise<AssetWithRelations | null> {
    return await prisma.asset.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    }) as unknown as AssetWithRelations | null
  }

  /**
   * Find multiple assets with pagination
   */
  static async findMany(
    whereClause: Prisma.AssetWhereInput, 
    page: number, 
    limit: number
  ): Promise<{ assets: AssetWithRelations[], total: number }> {
    const skip = (page - 1) * limit

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.asset.count({ where: whereClause })
    ])

    return { assets: assets as unknown as AssetWithRelations[], total }
  }

  /**
   * Find all assets without pagination
   */
  static async findAll(whereClause: Prisma.AssetWhereInput): Promise<AssetWithRelations[]> {
    return await prisma.asset.findMany({
      where: whereClause,
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' }
    }) as unknown as AssetWithRelations[]
  }

  /**
   * Create new asset
   */
  static async create(assetData: Prisma.AssetCreateInput): Promise<AssetWithRelations> {
    return await prisma.asset.create({
      data: assetData,
      include: this.getIncludeRelations()
    }) as unknown as AssetWithRelations
  }

  /**
   * Update asset
   */
  static async update(id: string, assetData: Prisma.AssetUpdateInput): Promise<AssetWithRelations> {
    return await prisma.asset.update({
      where: { id },
      data: assetData,
      include: this.getIncludeRelations()
    }) as unknown as AssetWithRelations
  }

  /**
   * Soft delete asset (set isActive to false)
   */
  static async delete(id: string): Promise<AssetWithRelations> {
    return await prisma.asset.update({
      where: { id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      },
      include: this.getIncludeRelations()
    }) as unknown as AssetWithRelations
  }

  /**
   * Find asset with related data for validation
   */
  static async findWithRelatedData(id: string): Promise<AssetWithRelations | null> {
    return await prisma.asset.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    }) as unknown as AssetWithRelations | null
  }

  /**
   * Count active work orders for an asset (for future implementation)
   */
  static async countActiveWorkOrders(assetId: string): Promise<number> {
    // return await prisma.workOrder.count({
    //   where: {
    //     assetId,
    //     isActive: true
    //   }
    // })
    
    // For now, return 0 since WorkOrder model doesn't exist yet
    return 0
  }

  /**
   * Check if asset code exists in the same sede
   */
  static async checkCodeExists(code: string, siteId: string, excludeId?: string): Promise<boolean> {
    const whereClause: Prisma.AssetWhereInput = {
      code,
      siteId,
      isActive: true
    }

    if (excludeId) {
      whereClause.id = { not: excludeId }
    }

    const count = await prisma.asset.count({ where: whereClause })
    return count > 0
  }
}