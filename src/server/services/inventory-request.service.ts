import { Prisma, RequestUrgency } from "@prisma/client"
import { InventoryService } from "./inventory.service"
import { InventoryRequestRepository } from "@/server/repositories/inventory-request.repository"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  WorkOrderInventoryRequestWithRelations,
  CreateInventoryRequestData,
  InventoryRequestFilters,
  PaginatedInventoryRequestsResponse,
  ReviewInventoryRequestData,
  DeliverInventoryRequestData
} from "@/types/inventory.types"
import { updateInventoryRequestSchema } from "@/app/api/schemas/inventory-schemas"
import type { z } from "zod"

/**
 * Service for managing inventory requests
 * Wraps InventoryService methods for better API organization
 */
export class InventoryRequestService {

  static async getList(
    session: AuthenticatedSession,
    filters?: InventoryRequestFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedInventoryRequestsResponse> {
    return await InventoryService.getRequestList(session, filters, page, limit)
  }

  static async getById(
    session: AuthenticatedSession,
    id: string
  ): Promise<WorkOrderInventoryRequestWithRelations | null> {
    return await InventoryService.getRequestById(session, id)
  }

  static async create(
    session: AuthenticatedSession,
    data: CreateInventoryRequestData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryService.createRequest(session, data)
  }

  static async update(
    session: AuthenticatedSession,
    id: string,
    data: z.infer<typeof updateInventoryRequestSchema>
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    // Get the current request to check its status
    const currentRequest = await InventoryService.getRequestById(session, id)
    if (!currentRequest) {
      throw new Error("Solicitud de inventario no encontrada")
    }

    // Check if request can be modified
    if (currentRequest.status !== "PENDING") {
      throw new Error(`La solicitud con estado ${currentRequest.status} no puede ser modificada`)
    }

    // Build update data from the schema
    const updateData: Prisma.WorkOrderInventoryRequestUpdateInput = {}
    if (data.requestedQuantity !== undefined) {
      updateData.quantityRequested = data.requestedQuantity
    }
    if (data.urgency !== undefined) {
      updateData.urgency = data.urgency as RequestUrgency
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes
    }

    return await InventoryRequestRepository.update(id, updateData)
  }

  static async approve(
    session: AuthenticatedSession,
    id: string,
    data: ReviewInventoryRequestData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryService.approveRequest(session, id, data)
  }

  static async reject(
    session: AuthenticatedSession,
    id: string,
    data: ReviewInventoryRequestData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryService.rejectRequest(session, id, data)
  }

  static async deliver(
    session: AuthenticatedSession,
    id: string,
    data: DeliverInventoryRequestData
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryService.deliverRequest(session, id, data)
  }

  static async cancel(
    session: AuthenticatedSession,
    id: string
  ): Promise<WorkOrderInventoryRequestWithRelations> {
    return await InventoryService.cancelRequest(session, id)
  }
}
