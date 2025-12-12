import { Prisma, InventoryRequestStatus, RequestUrgency, LocationType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { WorkOrderInventoryRequestWithRelations } from "@/types/inventory.types"

/**
 * Repository para el acceso a datos de solicitudes de inventario
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class InventoryRequestRepository {

  /**
   * Convert Prisma result to WorkOrderInventoryRequestWithRelations, converting Date fields to strings
   */
  private static convertToWorkOrderInventoryRequestWithRelations(
    item: {
      requestedAt: Date
      reviewedAt: Date | null
      deliveredAt: Date | null
      warehouseDeliveredAt: Date | null
      receivedAt: Date | null
      createdAt: Date
      updatedAt: Date
      [key: string]: unknown
    }
  ): WorkOrderInventoryRequestWithRelations {
    const converted = {
      ...item,
      requestedAt: item.requestedAt instanceof Date ? item.requestedAt.toISOString() : String(item.requestedAt),
      reviewedAt: item.reviewedAt instanceof Date ? item.reviewedAt.toISOString() : (item.reviewedAt ? String(item.reviewedAt) : null),
      deliveredAt: item.deliveredAt instanceof Date ? item.deliveredAt.toISOString() : (item.deliveredAt ? String(item.deliveredAt) : null),
      warehouseDeliveredAt: item.warehouseDeliveredAt instanceof Date ? item.warehouseDeliveredAt.toISOString() : (item.warehouseDeliveredAt ? String(item.warehouseDeliveredAt) : null),
      receivedAt: item.receivedAt instanceof Date ? item.receivedAt.toISOString() : (item.receivedAt ? String(item.receivedAt) : null),
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt)
    }
    return converted as unknown as WorkOrderInventoryRequestWithRelations
  }

  private static readonly includeRelations = {
    workOrder: {
      select: {
        id: true,
        number: true,
        title: true,
        status: true,
        siteId: true,
        companyId: true
      }
    },
    inventoryItem: {
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        images: true
      }
    },
    sourceCompany: {
      select: {
        id: true,
        name: true
      }
    },
    requester: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true
      }
    },
    reviewer: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    },
    deliverer: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    warehouseDeliverer: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    },
    receiver: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    }
  }

  static async findById(id: string): Promise<WorkOrderInventoryRequestWithRelations | null> {
    const item = await prisma.workOrderInventoryRequest.findUnique({
      where: { id },
      include: InventoryRequestRepository.includeRelations
    })
    
    if (!item) return null
    
    return InventoryRequestRepository.convertToWorkOrderInventoryRequestWithRelations(item)
  }

  static async findFirst(
    whereClause: Prisma.WorkOrderInventoryRequestWhereInput
  ): Promise<WorkOrderInventoryRequestWithRelations | null> {
    const item = await prisma.workOrderInventoryRequest.findFirst({
      where: whereClause,
      include: InventoryRequestRepository.includeRelations
    })
    
    if (!item) return null
    
    return InventoryRequestRepository.convertToWorkOrderInventoryRequestWithRelations(item)
  }

  static async findMany(
    whereClause: Prisma.WorkOrderInventoryRequestWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: WorkOrderInventoryRequestWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [requests, total] = await Promise.all([
      prisma.workOrderInventoryRequest.findMany({
        where: whereClause,
        include: InventoryRequestRepository.includeRelations,
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.workOrderInventoryRequest.count({ where: whereClause })
    ])

    return {
      items: requests.map(item => InventoryRequestRepository.convertToWorkOrderInventoryRequestWithRelations(item)),
      total
    }
  }

  static async findAll(
    whereClause: Prisma.WorkOrderInventoryRequestWhereInput
  ): Promise<WorkOrderInventoryRequestWithRelations[]> {
    const requests = await prisma.workOrderInventoryRequest.findMany({
      where: whereClause,
      include: InventoryRequestRepository.includeRelations,
      orderBy: { createdAt: 'desc' }
    })
    
    return requests.map(item => InventoryRequestRepository.convertToWorkOrderInventoryRequestWithRelations(item))
  }

  static async create(
    data: Prisma.WorkOrderInventoryRequestCreateInput
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    const item = await prisma.workOrderInventoryRequest.create({
      data,
      include: InventoryRequestRepository.includeRelations
    })
    
    return InventoryRequestRepository.convertToWorkOrderInventoryRequestWithRelations(item)
  }

  static async update(
    id: string,
    data: Prisma.WorkOrderInventoryRequestUpdateInput
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    const item = await prisma.workOrderInventoryRequest.update({
      where: { id },
      data,
      include: InventoryRequestRepository.includeRelations
    })
    
    return InventoryRequestRepository.convertToWorkOrderInventoryRequestWithRelations(item)
  }

  static async delete(id: string): Promise<WorkOrderInventoryRequestWithRelations> {
    const item = await prisma.workOrderInventoryRequest.delete({
      where: { id },
      include: InventoryRequestRepository.includeRelations
    })
    
    return InventoryRequestRepository.convertToWorkOrderInventoryRequestWithRelations(item)
  }

  /**
   * Find requests by work order
   */
  static async findByWorkOrder(workOrderId: string): Promise<WorkOrderInventoryRequestWithRelations[]> {
    return await InventoryRequestRepository.findAll({
      workOrderId
    })
  }

  /**
   * Find pending requests for approval
   */
  static async findPending(companyId?: string): Promise<WorkOrderInventoryRequestWithRelations[]> {
    const whereClause: Prisma.WorkOrderInventoryRequestWhereInput = {
      status: 'PENDING'
    }

    if (companyId) {
      whereClause.workOrder = {
        companyId
      }
    }

    return await InventoryRequestRepository.findAll(whereClause)
  }

  /**
   * Find requests by requester
   */
  static async findByRequester(userId: string): Promise<WorkOrderInventoryRequestWithRelations[]> {
    return await InventoryRequestRepository.findAll({
      requestedBy: userId
    })
  }

  /**
   * Find requests by status
   */
  static async findByStatus(
    status: InventoryRequestStatus,
    companyId?: string
  ): Promise<WorkOrderInventoryRequestWithRelations[]> {
    const whereClause: Prisma.WorkOrderInventoryRequestWhereInput = {
      status
    }

    if (companyId) {
      whereClause.workOrder = {
        companyId
      }
    }

    return await InventoryRequestRepository.findAll(whereClause)
  }

  /**
   * Find requests by urgency
   */
  static async findByUrgency(
    urgency: RequestUrgency,
    companyId?: string
  ): Promise<WorkOrderInventoryRequestWithRelations[]> {
    const whereClause: Prisma.WorkOrderInventoryRequestWhereInput = {
      urgency,
      status: {
        in: ['PENDING', 'APPROVED', 'IN_TRANSIT']
      }
    }

    if (companyId) {
      whereClause.workOrder = {
        companyId
      }
    }

    return await InventoryRequestRepository.findAll(whereClause)
  }

  /**
   * Approve request
   */
  static async approve(
    id: string,
    reviewedBy: string,
    quantityApproved: number,
    reviewNotes?: string,
    sourceLocationId?: string,
    sourceLocationType?: LocationType
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    const updateData: Prisma.WorkOrderInventoryRequestUpdateInput = {
      status: 'APPROVED',
      quantityApproved,
      reviewer: { connect: { id: reviewedBy } },
      reviewedAt: new Date(),
      reviewNotes,
      ...(sourceLocationId && { sourceLocationId }),
      ...(sourceLocationType && { sourceLocationType: sourceLocationType as LocationType })
    }

    // If source is a WAREHOUSE, set sourceCompanyId
    if (sourceLocationId && sourceLocationType === 'WAREHOUSE') {
      updateData.sourceCompany = { connect: { id: sourceLocationId } }
    }

    return await InventoryRequestRepository.update(id, updateData)
  }

  /**
   * Reject request
   */
  static async reject(
    id: string,
    reviewedBy: string,
    reviewNotes: string
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryRequestRepository.update(id, {
      status: 'REJECTED',
      reviewer: { connect: { id: reviewedBy } },
      reviewedAt: new Date(),
      reviewNotes
    })
  }

  /**
   * Mark as in transit
   */
  static async markInTransit(id: string): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryRequestRepository.update(id, {
      status: 'IN_TRANSIT'
    })
  }

  /**
   * Mark as delivered
   */
  static async markDelivered(
    id: string,
    deliveredBy: string,
    quantityDelivered: number
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryRequestRepository.update(id, {
      status: 'DELIVERED',
      quantityDelivered,
      deliverer: { connect: { id: deliveredBy } },
      deliveredAt: new Date()
    })
  }

  /**
   * Deliver from warehouse (Encargado de bodega entrega físicamente)
   */
  static async deliverFromWarehouse(
    id: string,
    warehouseDeliveredBy: string,
    notes?: string
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    const request = await InventoryRequestRepository.findById(id)
    if (!request) {
      throw new Error("Solicitud de inventario no encontrada")
    }

    // Determine if it's same company or inter-company transfer
    const isSameCompany = !request.sourceCompanyId ||
      request.sourceCompanyId === request.workOrder?.companyId

    return await InventoryRequestRepository.update(id, {
      status: isSameCompany ? InventoryRequestStatus.READY_FOR_PICKUP : InventoryRequestStatus.IN_TRANSIT,
      warehouseDeliverer: { connect: { id: warehouseDeliveredBy } },
      warehouseDeliveredAt: new Date(),
      ...(notes && { reviewNotes: notes })
    })
  }

  /**
   * Receive at destination warehouse (Bodega destino recibe - solo inter-empresa)
   */
  static async receiveAtDestinationWarehouse(
    id: string,
    destinationWarehouseReceivedBy: string,
    notes?: string
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryRequestRepository.update(id, {
      status: InventoryRequestStatus.RECEIVED_AT_DESTINATION,
      destinationWarehouseReceiver: { connect: { id: destinationWarehouseReceivedBy } },
      destinationWarehouseReceivedAt: new Date(),
      ...(notes && { reviewNotes: notes })
    })
  }

  /**
   * Prepare for technician pickup (Bodega prepara para entregar al técnico)
   */
  static async prepareForPickup(
    id: string
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryRequestRepository.update(id, {
      status: InventoryRequestStatus.READY_FOR_PICKUP
    })
  }

  /**
   * Confirm receipt (Técnico confirma recepción)
   */
  static async confirmReceipt(
    id: string,
    receivedBy: string,
    notes?: string
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryRequestRepository.update(id, {
      status: InventoryRequestStatus.DELIVERED,
      receiver: { connect: { id: receivedBy } },
      receivedAt: new Date(),
      ...(notes && { notes })
    })
  }

  /**
   * Cancel request
   */
  static async cancel(id: string): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryRequestRepository.update(id, {
      status: 'CANCELLED'
    })
  }
}
