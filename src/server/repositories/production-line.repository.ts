import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type {
  ProductionLineWithRelations,
  ProductionLineAssetWithAsset,
} from '@/types/production-line.types'

/**
 * Production Line Repository
 * Handles direct database interactions
 * Following Next.js Expert: Repository Pattern for data access
 */
export class ProductionLineRepository {
  /**
   * Include relations for production line queries
   */
  static getIncludeRelations(): Prisma.ProductionLineInclude {
    return {
      site: {
        select: {
          id: true,
          name: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      assets: {
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              code: true,
              status: true,
              location: true,
              manufacturer: true,
              model: true,
            },
          },
        },
        orderBy: {
          sequence: 'asc',
        },
      },
      _count: {
        select: {
          assets: true,
        },
      },
    }
  }

  /**
   * Find production line by ID
   */
  static async findById(
    id: string,
    companyId?: string
  ): Promise<ProductionLineWithRelations | null> {
    const whereClause: Prisma.ProductionLineWhereInput = {
      id,
      isActive: true,
    }

    if (companyId) {
      whereClause.companyId = companyId
    }

    return (await prisma.productionLine.findFirst({
      where: whereClause,
      include: this.getIncludeRelations(),
    })) as unknown as ProductionLineWithRelations | null
  }

  /**
   * Find multiple production lines with pagination
   */
  static async findMany(
    whereClause: Prisma.ProductionLineWhereInput,
    page: number,
    limit: number
  ): Promise<{
    items: ProductionLineWithRelations[]
    total: number
  }> {
    const skip = (page - 1) * limit

    const [productionLines, total] = await Promise.all([
      prisma.productionLine.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.productionLine.count({ where: whereClause }),
    ])

    return {
      items:
        productionLines as unknown as ProductionLineWithRelations[],
      total,
    }
  }

  /**
   * Find all production lines for a company (no pagination)
   */
  static async findAllByCompany(
    companyId: string
  ): Promise<ProductionLineWithRelations[]> {
    return (await prisma.productionLine.findMany({
      where: {
        companyId,
        isActive: true,
      },
      include: this.getIncludeRelations(),
      orderBy: { name: 'asc' },
    })) as unknown as ProductionLineWithRelations[]
  }

  /**
   * Find all production lines for a site
   */
  static async findAllBySite(
    siteId: string
  ): Promise<ProductionLineWithRelations[]> {
    return (await prisma.productionLine.findMany({
      where: {
        siteId,
        isActive: true,
      },
      include: this.getIncludeRelations(),
      orderBy: { name: 'asc' },
    })) as unknown as ProductionLineWithRelations[]
  }

  /**
   * Create new production line
   */
  static async create(
    data: Prisma.ProductionLineCreateInput
  ): Promise<ProductionLineWithRelations> {
    return (await prisma.productionLine.create({
      data,
      include: this.getIncludeRelations(),
    })) as unknown as ProductionLineWithRelations
  }

  /**
   * Update production line
   */
  static async update(
    id: string,
    data: Prisma.ProductionLineUpdateInput
  ): Promise<ProductionLineWithRelations> {
    return (await prisma.productionLine.update({
      where: { id },
      data,
      include: this.getIncludeRelations(),
    })) as unknown as ProductionLineWithRelations
  }

  /**
   * Soft delete production line
   */
  static async softDelete(
    id: string
  ): Promise<ProductionLineWithRelations> {
    return (await prisma.productionLine.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: this.getIncludeRelations(),
    })) as unknown as ProductionLineWithRelations
  }

  /**
   * Check if code exists in the same company
   */
  static async checkCodeExists(
    code: string,
    companyId: string,
    excludeId?: string
  ): Promise<boolean> {
    const whereClause: Prisma.ProductionLineWhereInput = {
      code,
      companyId,
      isActive: true,
    }

    if (excludeId) {
      whereClause.id = { not: excludeId }
    }

    const count = await prisma.productionLine.count({ where: whereClause })
    return count > 0
  }

  /**
   * Add asset to production line
   */
  static async addAsset(
    data: Prisma.ProductionLineAssetCreateInput
  ): Promise<ProductionLineAssetWithAsset> {
    return (await prisma.productionLineAsset.create({
      data,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            location: true,
            manufacturer: true,
            model: true,
          },
        },
      },
    })) as unknown as ProductionLineAssetWithAsset
  }

  /**
   * Update asset in production line
   */
  static async updateAsset(
    id: string,
    data: Prisma.ProductionLineAssetUpdateInput
  ): Promise<ProductionLineAssetWithAsset> {
    return (await prisma.productionLineAsset.update({
      where: { id },
      data,
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            location: true,
            manufacturer: true,
            model: true,
          },
        },
      },
    })) as unknown as ProductionLineAssetWithAsset
  }

  /**
   * Remove asset from production line
   */
  static async removeAsset(id: string): Promise<void> {
    await prisma.productionLineAsset.delete({
      where: { id },
    })
  }

  /**
   * Get assets in production line
   */
  static async getLineAssets(
    productionLineId: string
  ): Promise<ProductionLineAssetWithAsset[]> {
    return (await prisma.productionLineAsset.findMany({
      where: {
        productionLineId,
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            location: true,
            manufacturer: true,
            model: true,
          },
        },
      },
      orderBy: {
        sequence: 'asc',
      },
    })) as unknown as ProductionLineAssetWithAsset[]
  }

  /**
   * Get production line stats
   */
  static async getStats(companyId: string) {
    const [
      totalLines,
      activeLines,
      totalMachines,
      machinesByStatus,
      avgThroughput,
    ] = await Promise.all([
      prisma.productionLine.count({
        where: {
          companyId,
          isActive: true,
        },
      }),
      prisma.productionLine.count({
        where: {
          companyId,
          isActive: true,
        },
      }),
      prisma.productionLineAsset.count({
        where: {
          productionLine: {
            companyId,
            isActive: true,
          },
        },
      }),
      prisma.productionLineAsset.groupBy({
        by: ['assetId'],
        where: {
          productionLine: {
            companyId,
            isActive: true,
          },
        },
        _count: true,
      }),
      prisma.productionLine.aggregate({
        where: {
          companyId,
          isActive: true,
        },
        _avg: {
          targetThroughput: true,
        },
      }),
    ])

    // Get actual asset statuses
    const assetIds = machinesByStatus.map((m) => m.assetId)
    const assets = await prisma.asset.groupBy({
      by: ['status'],
      where: {
        id: { in: assetIds },
      },
      _count: true,
    })

    const operationalMachines =
      assets.find((a) => a.status === 'OPERATIVO')?._count || 0
    const machinesInMaintenance =
      assets.find((a) => a.status === 'EN_MANTENIMIENTO')?._count || 0
    const machinesOutOfService =
      assets.find((a) => a.status === 'FUERA_DE_SERVICIO')?._count || 0

    return {
      totalLines,
      activeLines,
      totalMachines,
      operationalMachines,
      machinesInMaintenance,
      machinesOutOfService,
      averageThroughput: avgThroughput._avg.targetThroughput,
      utilizationRate:
        totalMachines > 0
          ? Math.round((operationalMachines / totalMachines) * 100)
          : 0,
    }
  }
}
