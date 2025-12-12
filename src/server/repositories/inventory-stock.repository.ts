import { Prisma, LocationType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { InventoryStockWithLocation } from "@/types/inventory.types"

/**
 * Repository para el acceso a datos de stock de inventario
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class InventoryStockRepository {

  /**
   * Convert Prisma result to InventoryStockWithLocation, converting Date fields to strings
   */
  private static convertToInventoryStockWithLocation(
    item: {
      lastCountDate: Date | null
      updatedAt: Date
      [key: string]: unknown
    }
  ): InventoryStockWithLocation {
    const converted = {
      ...item,
      lastCountDate: item.lastCountDate instanceof Date ? item.lastCountDate.toISOString() : (item.lastCountDate ? String(item.lastCountDate) : null),
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt)
    }
    return converted as unknown as InventoryStockWithLocation
  }

  private static readonly includeRelations = {
    inventoryItem: {
      select: {
        id: true,
        code: true,
        name: true,
        unit: true
      }
    }
  }

  static async findById(id: string): Promise<InventoryStockWithLocation | null> {
    const item = await prisma.inventoryStock.findUnique({
      where: { id },
      include: InventoryStockRepository.includeRelations
    })
    
    if (!item) return null
    
    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }

  static async findByItemAndLocation(
    inventoryItemId: string,
    locationId: string,
    locationType: LocationType
  ): Promise<InventoryStockWithLocation | null> {
    const item = await prisma.inventoryStock.findUnique({
      where: {
        inventoryItemId_locationId_locationType: {
          inventoryItemId,
          locationId,
          locationType
        }
      },
      include: InventoryStockRepository.includeRelations
    })
    
    if (!item) return null
    
    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }

  static async findByItem(inventoryItemId: string): Promise<InventoryStockWithLocation[]> {
    const items = await prisma.inventoryStock.findMany({
      where: { inventoryItemId },
      include: InventoryStockRepository.includeRelations,
      orderBy: {
        locationName: 'asc'
      }
    })
    
    return items.map(item => InventoryStockRepository.convertToInventoryStockWithLocation(item))
  }

  static async findByLocation(
    locationId: string,
    locationType: LocationType
  ): Promise<InventoryStockWithLocation[]> {
    const items = await prisma.inventoryStock.findMany({
      where: {
        locationId,
        locationType
      },
      include: InventoryStockRepository.includeRelations,
      orderBy: {
        inventoryItem: {
          name: 'asc'
        }
      }
    })
    
    return items.map(item => InventoryStockRepository.convertToInventoryStockWithLocation(item))
  }

  static async create(data: Prisma.InventoryStockCreateInput): Promise<InventoryStockWithLocation> {
    const item = await prisma.inventoryStock.create({
      data,
      include: InventoryStockRepository.includeRelations
    })
    
    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }

  static async update(id: string, data: Prisma.InventoryStockUpdateInput): Promise<InventoryStockWithLocation> {
    const item = await prisma.inventoryStock.update({
      where: { id },
      data,
      include: InventoryStockRepository.includeRelations
    })
    
    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }

  static async updateByItemAndLocation(
    inventoryItemId: string,
    locationId: string,
    locationType: LocationType,
    data: Prisma.InventoryStockUpdateInput
  ): Promise<InventoryStockWithLocation> {
    const item = await prisma.inventoryStock.update({
      where: {
        inventoryItemId_locationId_locationType: {
          inventoryItemId,
          locationId,
          locationType
        }
      },
      data,
      include: InventoryStockRepository.includeRelations
    })
    
    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }

  static async delete(id: string): Promise<InventoryStockWithLocation> {
    const item = await prisma.inventoryStock.delete({
      where: { id },
      include: InventoryStockRepository.includeRelations
    })
    
    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }

  /**
   * Increment quantity at a location
   */
  static async incrementQuantity(
    inventoryItemId: string,
    locationId: string,
    locationType: LocationType,
    quantity: number
  ): Promise<InventoryStockWithLocation> {
    const item = await prisma.inventoryStock.update({
      where: {
        inventoryItemId_locationId_locationType: {
          inventoryItemId,
          locationId,
          locationType
        }
      },
      data: {
        quantity: {
          increment: quantity
        },
        availableQuantity: {
          increment: quantity
        }
      },
      include: InventoryStockRepository.includeRelations
    })
    
    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }

  /**
   * Decrement quantity at a location
   */
  static async decrementQuantity(
    inventoryItemId: string,
    locationId: string,
    locationType: LocationType,
    quantity: number
  ): Promise<InventoryStockWithLocation> {
    const item = await prisma.inventoryStock.update({
      where: {
        inventoryItemId_locationId_locationType: {
          inventoryItemId,
          locationId,
          locationType
        }
      },
      data: {
        quantity: {
          decrement: quantity
        },
        availableQuantity: {
          decrement: quantity
        }
      },
      include: InventoryStockRepository.includeRelations
    })
    
    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }

  /**
   * Reserve quantity at a location
   */
  static async reserveQuantity(
    inventoryItemId: string,
    locationId: string,
    locationType: LocationType,
    quantity: number
  ): Promise<InventoryStockWithLocation> {
    const item = await prisma.inventoryStock.update({
      where: {
        inventoryItemId_locationId_locationType: {
          inventoryItemId,
          locationId,
          locationType
        }
      },
      data: {
        reservedQuantity: {
          increment: quantity
        },
        availableQuantity: {
          decrement: quantity
        }
      },
      include: InventoryStockRepository.includeRelations
    })
    
    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }

  /**
   * Release reserved quantity at a location
   */
  static async releaseReservedQuantity(
    inventoryItemId: string,
    locationId: string,
    locationType: LocationType,
    quantity: number
  ): Promise<InventoryStockWithLocation> {
    const item = await prisma.inventoryStock.update({
      where: {
        inventoryItemId_locationId_locationType: {
          inventoryItemId,
          locationId,
          locationType
        }
      },
      data: {
        reservedQuantity: {
          decrement: quantity
        },
        availableQuantity: {
          increment: quantity
        }
      },
      include: InventoryStockRepository.includeRelations
    })
    
    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }

  /**
   * Set exact quantity (for adjustments)
   */
  static async setQuantity(
    inventoryItemId: string,
    locationId: string,
    locationType: LocationType,
    newQuantity: number,
    countedBy: string,
    locationName?: string
  ): Promise<InventoryStockWithLocation> {
    // Get current reserved quantity to recalculate available
    const currentStock = await prisma.inventoryStock.findUnique({
      where: {
        inventoryItemId_locationId_locationType: {
          inventoryItemId,
          locationId,
          locationType
        }
      }
    })

    const reservedQuantity = currentStock?.reservedQuantity || 0
    const availableQuantity = Math.max(0, newQuantity - reservedQuantity)

    // Use upsert to create if doesn't exist, update if exists
    const item = await prisma.inventoryStock.upsert({
      where: {
        inventoryItemId_locationId_locationType: {
          inventoryItemId,
          locationId,
          locationType
        }
      },
      create: {
        inventoryItem: {
          connect: { id: inventoryItemId }
        },
        locationId,
        locationType,
        locationName: locationName || locationId, // Use locationId as fallback
        quantity: newQuantity,
        availableQuantity,
        reservedQuantity: 0,
        lastCountDate: new Date(),
        lastCountBy: countedBy
      },
      update: {
        quantity: newQuantity,
        availableQuantity,
        lastCountDate: new Date(),
        lastCountBy: countedBy
      },
      include: InventoryStockRepository.includeRelations
    })

    return InventoryStockRepository.convertToInventoryStockWithLocation(item)
  }
}
