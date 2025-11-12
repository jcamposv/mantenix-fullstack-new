import { Prisma, MovementType, LocationType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { InventoryMovementWithRelations } from "@/types/inventory.types"

/**
 * Repository para el acceso a datos de movimientos de inventario
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class InventoryMovementRepository {

  /**
   * Convert Prisma result to InventoryMovementWithRelations, converting Date fields to strings
   */
  private static convertToInventoryMovementWithRelations(
    item: {
      createdAt: Date
      [key: string]: unknown
    }
  ): InventoryMovementWithRelations {
    const converted = {
      ...item,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt)
    }
    return converted as unknown as InventoryMovementWithRelations
  }

  private static readonly includeRelations = {
    inventoryItem: {
      select: {
        id: true,
        code: true,
        name: true,
        unit: true
      }
    },
    fromCompany: {
      select: {
        id: true,
        name: true
      }
    },
    toCompany: {
      select: {
        id: true,
        name: true
      }
    },
    workOrder: {
      select: {
        id: true,
        number: true,
        title: true
      }
    },
    request: {
      select: {
        id: true,
        status: true
      }
    },
    creator: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    approver: {
      select: {
        id: true,
        name: true,
        email: true
      }
    }
  }

  static async findById(id: string): Promise<InventoryMovementWithRelations | null> {
    const item = await prisma.inventoryMovement.findUnique({
      where: { id },
      include: InventoryMovementRepository.includeRelations
    })
    
    if (!item) return null
    
    return InventoryMovementRepository.convertToInventoryMovementWithRelations(item)
  }

  static async findFirst(
    whereClause: Prisma.InventoryMovementWhereInput
  ): Promise<InventoryMovementWithRelations | null> {
    const item = await prisma.inventoryMovement.findFirst({
      where: whereClause,
      include: InventoryMovementRepository.includeRelations
    })
    
    if (!item) return null
    
    return InventoryMovementRepository.convertToInventoryMovementWithRelations(item)
  }

  static async findMany(
    whereClause: Prisma.InventoryMovementWhereInput,
    page: number,
    limit: number
  ): Promise<{ movements: InventoryMovementWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where: whereClause,
        include: InventoryMovementRepository.includeRelations,
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.inventoryMovement.count({ where: whereClause })
    ])

    return { 
      movements: movements.map(item => InventoryMovementRepository.convertToInventoryMovementWithRelations(item)), 
      total 
    }
  }

  static async findAll(
    whereClause: Prisma.InventoryMovementWhereInput
  ): Promise<InventoryMovementWithRelations[]> {
    const movements = await prisma.inventoryMovement.findMany({
      where: whereClause,
      include: InventoryMovementRepository.includeRelations,
      orderBy: { createdAt: 'desc' }
    })
    
    return movements.map(item => InventoryMovementRepository.convertToInventoryMovementWithRelations(item))
  }

  static async create(
    data: Prisma.InventoryMovementCreateInput
  ): Promise<InventoryMovementWithRelations> {
    const item = await prisma.inventoryMovement.create({
      data,
      include: InventoryMovementRepository.includeRelations
    })
    
    return InventoryMovementRepository.convertToInventoryMovementWithRelations(item)
  }

  /**
   * Find movements by inventory item
   */
  static async findByItem(inventoryItemId: string): Promise<InventoryMovementWithRelations[]> {
    return await InventoryMovementRepository.findAll({
      inventoryItemId
    })
  }

  /**
   * Find movements by type
   */
  static async findByType(
    type: MovementType,
    companyId?: string
  ): Promise<InventoryMovementWithRelations[]> {
    const whereClause: Prisma.InventoryMovementWhereInput = {
      type
    }

    if (companyId) {
      whereClause.OR = [
        { fromCompanyId: companyId },
        { toCompanyId: companyId }
      ]
    }

    return await InventoryMovementRepository.findAll(whereClause)
  }

  /**
   * Find movements by work order
   */
  static async findByWorkOrder(workOrderId: string): Promise<InventoryMovementWithRelations[]> {
    return await InventoryMovementRepository.findAll({
      workOrderId
    })
  }

  /**
   * Find movements by request
   */
  static async findByRequest(requestId: string): Promise<InventoryMovementWithRelations[]> {
    return await InventoryMovementRepository.findAll({
      requestId
    })
  }

  /**
   * Find movements by company (from or to)
   */
  static async findByCompany(
    companyId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<InventoryMovementWithRelations[]> {
    const whereClause: Prisma.InventoryMovementWhereInput = {
      OR: [
        { fromCompanyId: companyId },
        { toCompanyId: companyId }
      ]
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom) whereClause.createdAt.gte = dateFrom
      if (dateTo) whereClause.createdAt.lte = dateTo
    }

    return await InventoryMovementRepository.findAll(whereClause)
  }

  /**
   * Find movements by location
   */
  static async findByLocation(
    locationId: string,
    locationType: LocationType
  ): Promise<InventoryMovementWithRelations[]> {
    return await InventoryMovementRepository.findAll({
      OR: [
        {
          fromLocationId: locationId,
          fromLocationType: locationType
        },
        {
          toLocationId: locationId,
          toLocationType: locationType
        }
      ]
    })
  }

  /**
   * Find movements by date range
   */
  static async findByDateRange(
    dateFrom: Date,
    dateTo: Date,
    companyId?: string
  ): Promise<InventoryMovementWithRelations[]> {
    const whereClause: Prisma.InventoryMovementWhereInput = {
      createdAt: {
        gte: dateFrom,
        lte: dateTo
      }
    }

    if (companyId) {
      whereClause.OR = [
        { fromCompanyId: companyId },
        { toCompanyId: companyId }
      ]
    }

    return await InventoryMovementRepository.findAll(whereClause)
  }

  /**
   * Find transfers between companies
   */
  static async findInterCompanyTransfers(
    fromCompanyId?: string,
    toCompanyId?: string
  ): Promise<InventoryMovementWithRelations[]> {
    const whereClause: Prisma.InventoryMovementWhereInput = {
      type: 'TRANSFER',
      NOT: {
        OR: [
          { fromCompanyId: null },
          { toCompanyId: null }
        ]
      }
    }

    if (fromCompanyId) {
      whereClause.fromCompanyId = fromCompanyId
    }

    if (toCompanyId) {
      whereClause.toCompanyId = toCompanyId
    }

    return await InventoryMovementRepository.findAll(whereClause)
  }

  /**
   * Get movements statistics by type
   */
  static async getStatsByType(companyId?: string) {
    const whereClause: Prisma.InventoryMovementWhereInput = {}

    if (companyId) {
      whereClause.OR = [
        { fromCompanyId: companyId },
        { toCompanyId: companyId }
      ]
    }

    const movements = await InventoryMovementRepository.findAll(whereClause)

    const stats: Record<string, number> = {}
    movements.forEach(movement => {
      stats[movement.type] = (stats[movement.type] || 0) + 1
    })

    return stats
  }

  /**
   * Get total value movements
   */
  static async getTotalValue(
    companyId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{ totalIn: number, totalOut: number }> {
    const whereClause: Prisma.InventoryMovementWhereInput = {}

    if (companyId) {
      whereClause.OR = [
        { fromCompanyId: companyId },
        { toCompanyId: companyId }
      ]
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom) whereClause.createdAt.gte = dateFrom
      if (dateTo) whereClause.createdAt.lte = dateTo
    }

    const movements = await InventoryMovementRepository.findAll(whereClause)

    let totalIn = 0
    let totalOut = 0

    movements.forEach(movement => {
      const value = movement.totalCost || 0
      if (movement.type === 'IN') {
        totalIn += value
      } else if (movement.type === 'OUT') {
        totalOut += value
      }
    })

    return { totalIn, totalOut }
  }
}
