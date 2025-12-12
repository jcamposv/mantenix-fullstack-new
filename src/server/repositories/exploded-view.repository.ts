/**
 * Exploded View Repository
 *
 * Repository for AssetExplodedView and ExplodedViewHotspot data access operations.
 * Handles direct database interactions for exploded views and hotspots.
 *
 * Following Next.js Expert standards:
 * - Repository pattern for data access layer
 * - Type-safe Prisma queries
 * - Proper error handling
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type {
  AssetExplodedViewWithRelations,
  ExplodedViewHotspotWithComponent
} from "@/types/exploded-view.types"

export class ExplodedViewRepository {
  /**
   * Include relations for exploded view queries
   */
  static getIncludeRelations(): Prisma.AssetExplodedViewInclude {
    return {
      asset: {
        select: {
          id: true,
          name: true,
          code: true,
          manufacturer: true,
          model: true,
        },
      },
      hotspots: {
        where: { isActive: true },
        include: {
          component: {
            include: {
              inventoryItem: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  unitCost: true,
                  unit: true,
                },
              },
              company: {
                select: {
                  id: true,
                  name: true,
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
            },
          },
        },
        orderBy: { order: 'asc' },
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
   * Find exploded view by ID with relations
   */
  static async findById(id: string): Promise<AssetExplodedViewWithRelations | null> {
    return await prisma.assetExplodedView.findUnique({
      where: { id },
      include: this.getIncludeRelations(),
    }) as unknown as AssetExplodedViewWithRelations | null
  }

  /**
   * Find first exploded view matching criteria
   */
  static async findFirst(
    whereClause: Prisma.AssetExplodedViewWhereInput
  ): Promise<AssetExplodedViewWithRelations | null> {
    return await prisma.assetExplodedView.findFirst({
      where: whereClause,
      include: this.getIncludeRelations(),
    }) as unknown as AssetExplodedViewWithRelations | null
  }

  /**
   * Find multiple exploded views with pagination
   */
  static async findMany(
    whereClause: Prisma.AssetExplodedViewWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: AssetExplodedViewWithRelations[]; total: number }> {
    const skip = (page - 1) * limit

    const [views, total] = await Promise.all([
      prisma.assetExplodedView.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.assetExplodedView.count({ where: whereClause }),
    ])

    return {
      items: views as unknown as AssetExplodedViewWithRelations[],
      total,
    }
  }

  /**
   * Find all exploded views without pagination
   */
  static async findAll(
    whereClause: Prisma.AssetExplodedViewWhereInput
  ): Promise<AssetExplodedViewWithRelations[]> {
    return await prisma.assetExplodedView.findMany({
      where: whereClause,
      include: this.getIncludeRelations(),
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    }) as unknown as AssetExplodedViewWithRelations[]
  }

  /**
   * Create new exploded view
   */
  static async create(
    data: Prisma.AssetExplodedViewCreateInput
  ): Promise<AssetExplodedViewWithRelations> {
    return await prisma.assetExplodedView.create({
      data,
      include: this.getIncludeRelations(),
    }) as unknown as AssetExplodedViewWithRelations
  }

  /**
   * Update exploded view
   */
  static async update(
    id: string,
    data: Prisma.AssetExplodedViewUpdateInput
  ): Promise<AssetExplodedViewWithRelations> {
    return await prisma.assetExplodedView.update({
      where: { id },
      data,
      include: this.getIncludeRelations(),
    }) as unknown as AssetExplodedViewWithRelations
  }

  /**
   * Soft delete exploded view (set isActive to false)
   */
  static async softDelete(id: string): Promise<AssetExplodedViewWithRelations> {
    return await prisma.assetExplodedView.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: this.getIncludeRelations(),
    }) as unknown as AssetExplodedViewWithRelations
  }

  /**
   * Hard delete exploded view (permanently remove from database)
   * Note: This will cascade delete all hotspots
   */
  static async hardDelete(id: string): Promise<void> {
    await prisma.assetExplodedView.delete({
      where: { id },
    })
  }

  /**
   * Count exploded views matching criteria
   */
  static async count(whereClause: Prisma.AssetExplodedViewWhereInput): Promise<number> {
    return await prisma.assetExplodedView.count({ where: whereClause })
  }

  /**
   * Check if exploded view exists
   */
  static async exists(id: string): Promise<boolean> {
    const count = await prisma.assetExplodedView.count({
      where: { id, isActive: true },
    })
    return count > 0
  }

  /**
   * Reorder exploded views for an asset
   */
  static async reorder(assetId: string, viewIds: string[]): Promise<void> {
    await prisma.$transaction(
      viewIds.map((viewId, index) =>
        prisma.assetExplodedView.update({
          where: { id: viewId, assetId },
          data: { order: index },
        })
      )
    )
  }
}

// ============================================================================
// HOTSPOT REPOSITORY
// ============================================================================

export class ExplodedViewHotspotRepository {
  /**
   * Include relations for hotspot queries
   */
  static getIncludeRelations(): Prisma.ExplodedViewHotspotInclude {
    return {
      component: {
        include: {
          inventoryItem: {
            select: {
              id: true,
              code: true,
              name: true,
              unitCost: true,
              unit: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
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
        },
      },
      view: {
        select: {
          id: true,
          name: true,
          assetId: true,
        },
      },
    }
  }

  /**
   * Find hotspot by ID with relations
   */
  static async findById(id: string): Promise<ExplodedViewHotspotWithComponent | null> {
    return await prisma.explodedViewHotspot.findUnique({
      where: { id },
      include: this.getIncludeRelations(),
    }) as unknown as ExplodedViewHotspotWithComponent | null
  }

  /**
   * Find hotspots for a view
   */
  static async findByViewId(viewId: string): Promise<ExplodedViewHotspotWithComponent[]> {
    return await prisma.explodedViewHotspot.findMany({
      where: { viewId, isActive: true },
      include: this.getIncludeRelations(),
      orderBy: { order: 'asc' },
    }) as unknown as ExplodedViewHotspotWithComponent[]
  }

  /**
   * Create new hotspot
   */
  static async create(
    data: Prisma.ExplodedViewHotspotCreateInput
  ): Promise<ExplodedViewHotspotWithComponent> {
    return await prisma.explodedViewHotspot.create({
      data,
      include: this.getIncludeRelations(),
    }) as unknown as ExplodedViewHotspotWithComponent
  }

  /**
   * Update hotspot
   */
  static async update(
    id: string,
    data: Prisma.ExplodedViewHotspotUpdateInput
  ): Promise<ExplodedViewHotspotWithComponent> {
    return await prisma.explodedViewHotspot.update({
      where: { id },
      data,
      include: this.getIncludeRelations(),
    }) as unknown as ExplodedViewHotspotWithComponent
  }

  /**
   * Soft delete hotspot
   */
  static async softDelete(id: string): Promise<ExplodedViewHotspotWithComponent> {
    return await prisma.explodedViewHotspot.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: this.getIncludeRelations(),
    }) as unknown as ExplodedViewHotspotWithComponent
  }

  /**
   * Hard delete hotspot
   */
  static async hardDelete(id: string): Promise<void> {
    await prisma.explodedViewHotspot.delete({
      where: { id },
    })
  }

  /**
   * Reorder hotspots for a view
   */
  static async reorder(viewId: string, hotspotIds: string[]): Promise<void> {
    await prisma.$transaction(
      hotspotIds.map((hotspotId, index) =>
        prisma.explodedViewHotspot.update({
          where: { id: hotspotId, viewId },
          data: { order: index },
        })
      )
    )
  }

  /**
   * Delete all hotspots for a view
   */
  static async deleteAllByViewId(viewId: string): Promise<void> {
    await prisma.explodedViewHotspot.deleteMany({
      where: { viewId },
    })
  }
}
