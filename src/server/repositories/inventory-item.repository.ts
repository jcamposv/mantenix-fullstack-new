import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { InventoryItemWithRelations } from "@/types/inventory.types"

/**
 * Repository para el acceso a datos de items de inventario
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class InventoryItemRepository {

  /**
   * Convert Prisma result to InventoryItemWithRelations, converting Date fields to strings
   */
  private static convertToInventoryItemWithRelations(
    item: {
      createdAt: Date
      updatedAt: Date
      deletedAt: Date | null
      stockLocations?: Array<{ updatedAt: Date; [key: string]: unknown }>
      _count?: {
        stockLocations?: number
        movements?: number
        workOrderRequests?: number
        [key: string]: unknown
      }
      [key: string]: unknown
    },
    totals?: { totalQuantity: number; totalAvailable: number; totalReserved: number }
  ): InventoryItemWithRelations {
    const { stockLocations, _count, ...rest } = item
    const stock = stockLocations || []
    
    const converted = {
      ...rest,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt),
      deletedAt: item.deletedAt instanceof Date ? item.deletedAt.toISOString() : (item.deletedAt ? String(item.deletedAt) : null),
      stock: stock.map((s) => ({
        ...s,
        updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : String(s.updatedAt)
      })),
      _count: _count ? {
        stock: _count.stockLocations ?? _count.stock ?? 0,
        movements: _count.movements ?? 0,
        requests: _count.workOrderRequests ?? _count.requests ?? 0
      } : undefined,
      ...(totals && totals)
    }
    return converted as unknown as InventoryItemWithRelations
  }

  private static readonly includeRelations = {
    company: {
      select: {
        id: true,
        name: true
      }
    },
    creator: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    stockLocations: {
      select: {
        id: true,
        locationId: true,
        locationType: true,
        locationName: true,
        quantity: true,
        reservedQuantity: true,
        availableQuantity: true,
        aisle: true,
        rack: true,
        bin: true,
        updatedAt: true
      }
    },
    _count: {
      select: {
        stockLocations: true,
        movements: true,
        workOrderRequests: true
      }
    }
  }

  static async findById(id: string): Promise<InventoryItemWithRelations | null> {
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: InventoryItemRepository.includeRelations
    })

    if (!item) return null

    // Calculate totals from stock
    const stockArray = item.stockLocations || []
    const totalQuantity = stockArray.reduce((sum: number, s) => sum + s.quantity, 0)
    const totalAvailable = stockArray.reduce((sum: number, s) => sum + s.availableQuantity, 0)
    const totalReserved = stockArray.reduce((sum: number, s) => sum + s.reservedQuantity, 0)

    return InventoryItemRepository.convertToInventoryItemWithRelations(item, {
      totalQuantity,
      totalAvailable,
      totalReserved
    })
  }

  static async findFirst(whereClause: Prisma.InventoryItemWhereInput): Promise<InventoryItemWithRelations | null> {
    const item = await prisma.inventoryItem.findFirst({
      where: whereClause,
      include: InventoryItemRepository.includeRelations
    })
    
    if (!item) return null
    
    return InventoryItemRepository.convertToInventoryItemWithRelations(item)
  }

  static async findMany(
    whereClause: Prisma.InventoryItemWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: InventoryItemWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: whereClause,
        include: InventoryItemRepository.includeRelations,
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.inventoryItem.count({ where: whereClause })
    ])

    // Calculate totals for each item
    const itemsWithTotals = items.map(item => {
      const stockArray = item.stockLocations || []
      const totalQuantity = stockArray.reduce((sum: number, s) => sum + s.quantity, 0)
      const totalAvailable = stockArray.reduce((sum: number, s) => sum + s.availableQuantity, 0)
      const totalReserved = stockArray.reduce((sum: number, s) => sum + s.reservedQuantity, 0)

      return InventoryItemRepository.convertToInventoryItemWithRelations(item, {
        totalQuantity,
        totalAvailable,
        totalReserved
      })
    })

    return { items: itemsWithTotals, total }
  }

  static async findAll(whereClause: Prisma.InventoryItemWhereInput): Promise<InventoryItemWithRelations[]> {
    const items = await prisma.inventoryItem.findMany({
      where: whereClause,
      include: InventoryItemRepository.includeRelations,
      orderBy: { name: 'asc' }
    })
    
    return items.map(item => InventoryItemRepository.convertToInventoryItemWithRelations(item))
  }

  static async create(data: Prisma.InventoryItemCreateInput): Promise<InventoryItemWithRelations> {
    const item = await prisma.inventoryItem.create({
      data,
      include: InventoryItemRepository.includeRelations
    })

    return InventoryItemRepository.convertToInventoryItemWithRelations(item, {
      totalQuantity: 0,
      totalAvailable: 0,
      totalReserved: 0
    })
  }

  static async update(id: string, data: Prisma.InventoryItemUpdateInput): Promise<InventoryItemWithRelations> {
    const item = await prisma.inventoryItem.update({
      where: { id },
      data,
      include: InventoryItemRepository.includeRelations
    })

    const stockArray = item.stockLocations || []
    const totalQuantity = stockArray.reduce((sum: number, s) => sum + s.quantity, 0)
    const totalAvailable = stockArray.reduce((sum: number, s) => sum + s.availableQuantity, 0)
    const totalReserved = stockArray.reduce((sum: number, s) => sum + s.reservedQuantity, 0)

    return InventoryItemRepository.convertToInventoryItemWithRelations(item, {
      totalQuantity,
      totalAvailable,
      totalReserved
    })
  }

  static async delete(id: string): Promise<InventoryItemWithRelations> {
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      },
      include: InventoryItemRepository.includeRelations
    })

    const stockArray = item.stockLocations || []
    const totalQuantity = stockArray.reduce((sum: number, s) => sum + s.quantity, 0)
    const totalAvailable = stockArray.reduce((sum: number, s) => sum + s.availableQuantity, 0)
    const totalReserved = stockArray.reduce((sum: number, s) => sum + s.reservedQuantity, 0)

    return InventoryItemRepository.convertToInventoryItemWithRelations(item, {
      totalQuantity,
      totalAvailable,
      totalReserved
    })
  }

  /**
   * Find items by company
   */
  static async findByCompany(companyId: string): Promise<InventoryItemWithRelations[]> {
    return await InventoryItemRepository.findAll({
      companyId,
      isActive: true
    })
  }

  /**
   * Find items by category
   */
  static async findByCategory(companyId: string, category: string): Promise<InventoryItemWithRelations[]> {
    return await InventoryItemRepository.findAll({
      companyId,
      category,
      isActive: true
    })
  }

  /**
   * Find items with low stock (below min stock)
   */
  static async findLowStock(companyId: string): Promise<InventoryItemWithRelations[]> {
    const items = await prisma.inventoryItem.findMany({
      where: {
        companyId,
        isActive: true
      },
      include: InventoryItemRepository.includeRelations,
      orderBy: { name: 'asc' }
    })

    // Filter items where total quantity is below minStock
    return items
      .filter(item => {
        const stockArray = item.stockLocations || []
        const totalQuantity = stockArray.reduce((sum: number, s) => sum + s.quantity, 0)
        return totalQuantity < item.minStock
      })
      .map(item => {
        const stockArray = item.stockLocations || []
        const totalQuantity = stockArray.reduce((sum: number, s) => sum + s.quantity, 0)
        const totalAvailable = stockArray.reduce((sum: number, s) => sum + s.availableQuantity, 0)
        const totalReserved = stockArray.reduce((sum: number, s) => sum + s.reservedQuantity, 0)
        return InventoryItemRepository.convertToInventoryItemWithRelations(item, {
          totalQuantity,
          totalAvailable,
          totalReserved
        })
      })
  }

  /**
   * Find items below reorder point
   */
  static async findBelowReorderPoint(companyId: string): Promise<InventoryItemWithRelations[]> {
    const items = await prisma.inventoryItem.findMany({
      where: {
        companyId,
        isActive: true
      },
      include: InventoryItemRepository.includeRelations,
      orderBy: { name: 'asc' }
    })

    return items
      .filter(item => {
        const stockArray = item.stockLocations || []
        const totalQuantity = stockArray.reduce((sum: number, s) => sum + s.quantity, 0)
        return totalQuantity <= item.reorderPoint
      })
      .map(item => {
        const stockArray = item.stockLocations || []
        const totalQuantity = stockArray.reduce((sum: number, s) => sum + s.quantity, 0)
        const totalAvailable = stockArray.reduce((sum: number, s) => sum + s.availableQuantity, 0)
        const totalReserved = stockArray.reduce((sum: number, s) => sum + s.reservedQuantity, 0)
        return InventoryItemRepository.convertToInventoryItemWithRelations(item, {
          totalQuantity,
          totalAvailable,
          totalReserved
        })
      })
  }

  /**
   * Check if item code is unique for company
   */
  static async isCodeUnique(companyId: string, code: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        companyId,
        code,
        ...(excludeId && { NOT: { id: excludeId } })
      }
    })
    return !existing
  }
}
