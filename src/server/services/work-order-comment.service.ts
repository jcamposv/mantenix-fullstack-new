/**
 * Work Order Comment Service
 * Business logic layer for work order comments
 * Handles authorization, validation, and orchestration of comment operations
 */

import { WorkOrderCommentRepository } from "../repositories/work-order-comment.repository"
import { WorkOrderRepository } from "../repositories/work-order.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  WorkOrderCommentWithAuthor,
  CreateWorkOrderCommentData,
  UpdateWorkOrderCommentData,
} from "@/types/work-order-comment.types"
import type {
  CreateWorkOrderCommentInput,
  UpdateWorkOrderCommentInput,
} from "@/app/api/schemas/work-order-comment-schemas"

/**
 * Service for work order comment business logic
 * Contains business rules and orchestrates operations
 */
export class WorkOrderCommentService {
  /**
   * Get all comments for a work order
   * Verifies that the user has access to the work order
   * @param workOrderId - The work order ID
   * @param session - Authenticated user session
   * @param includeInternal - Whether to include internal comments
   * @returns Array of comments with author information
   */
  static async getByWorkOrder(
    workOrderId: string,
    session: AuthenticatedSession,
    includeInternal = true
  ): Promise<WorkOrderCommentWithAuthor[]> {
    // Verify user has access to the work order
    const workOrder = await WorkOrderRepository.findById(workOrderId, session.user.companyId)

    if (!workOrder) {
      throw new Error("Orden de trabajo no encontrada o sin acceso")
    }

    // Check if user has permission to view internal comments
    // Users with work_orders.manage or work_orders.* can see internal comments
    const canViewInternal = await PermissionGuard.check(session, "work_orders.manage") ||
                           await PermissionGuard.check(session, "work_orders.*")

    const shouldIncludeInternal = includeInternal && canViewInternal

    return await WorkOrderCommentRepository.findManyByWorkOrder(
      workOrderId,
      shouldIncludeInternal
    )
  }

  /**
   * Get a single comment by ID
   * Verifies access to the work order
   * @param commentId - Comment ID
   * @param session - Authenticated user session
   * @returns Comment with author information or null
   */
  static async getById(
    commentId: string,
    session: AuthenticatedSession
  ): Promise<WorkOrderCommentWithAuthor | null> {
    const comment = await WorkOrderCommentRepository.findById(commentId)

    if (!comment) {
      return null
    }

    // Verify user has access to the work order
    const workOrder = await WorkOrderRepository.findById(
      comment.workOrderId,
      session.user.companyId
    )

    if (!workOrder) {
      throw new Error("No tienes acceso a este comentario")
    }

    return comment
  }

  /**
   * Create a new comment on a work order
   * Verifies permissions and access to the work order
   * @param workOrderId - The work order ID
   * @param commentData - Comment data from request
   * @param session - Authenticated user session
   * @returns Newly created comment
   */
  static async create(
    workOrderId: string,
    commentData: CreateWorkOrderCommentInput,
    session: AuthenticatedSession
  ): Promise<WorkOrderCommentWithAuthor> {
    // Verify user has access to the work order
    const workOrder = await WorkOrderRepository.findById(workOrderId, session.user.companyId)

    if (!workOrder) {
      throw new Error("Orden de trabajo no encontrada o sin acceso")
    }

    // Verify permission to comment on work orders
    await PermissionGuard.require(session, "work_orders.comment")

    // Only allow internal comments for users with manage permission
    const isInternal = commentData.isInternal ?? false
    if (isInternal) {
      const canCreateInternal = await PermissionGuard.check(session, "work_orders.manage") ||
                               await PermissionGuard.check(session, "work_orders.*")

      if (!canCreateInternal) {
        throw new Error("No tienes permisos para crear comentarios internos")
      }
    }

    const createData: CreateWorkOrderCommentData = {
      content: commentData.content,
      workOrderId,
      authorId: session.user.id,
      isInternal,
    }

    return await WorkOrderCommentRepository.create(createData)
  }

  /**
   * Update an existing work order comment
   * Only the author or admins can update
   * @param commentId - Comment ID
   * @param commentData - Updated comment data
   * @param session - Authenticated user session
   * @returns Updated comment
   */
  static async update(
    commentId: string,
    commentData: UpdateWorkOrderCommentInput,
    session: AuthenticatedSession
  ): Promise<WorkOrderCommentWithAuthor> {
    // Get the existing comment
    const existingComment = await this.getById(commentId, session)

    if (!existingComment) {
      throw new Error("Comentario no encontrado")
    }

    // Check if user is the author or has manage permission
    const isAuthor = existingComment.authorId === session.user.id
    const canManage = await PermissionGuard.check(session, "work_orders.manage") ||
                     await PermissionGuard.check(session, "work_orders.*")

    if (!isAuthor && !canManage) {
      throw new Error("No tienes permisos para editar este comentario")
    }

    // Verify permission to update comments
    await PermissionGuard.require(session, "work_orders.comment")

    const updateData: UpdateWorkOrderCommentData = {
      ...(commentData.content !== undefined && { content: commentData.content }),
      ...(commentData.isInternal !== undefined && { isInternal: commentData.isInternal }),
    }

    return await WorkOrderCommentRepository.update(commentId, updateData)
  }

  /**
   * Delete a work order comment
   * Only the author or admins can delete
   * @param commentId - Comment ID
   * @param session - Authenticated user session
   * @returns Deleted comment
   */
  static async delete(
    commentId: string,
    session: AuthenticatedSession
  ): Promise<WorkOrderCommentWithAuthor> {
    // Get the existing comment
    const existingComment = await this.getById(commentId, session)

    if (!existingComment) {
      throw new Error("Comentario no encontrado")
    }

    // Check if user is the author or has manage permission
    const isAuthor = existingComment.authorId === session.user.id
    const canManage = await PermissionGuard.check(session, "work_orders.manage") ||
                     await PermissionGuard.check(session, "work_orders.*")

    if (!isAuthor && !canManage) {
      throw new Error("No tienes permisos para eliminar este comentario")
    }

    // Verify permission to delete comments
    await PermissionGuard.require(session, "work_orders.comment")

    return await WorkOrderCommentRepository.delete(commentId)
  }

  /**
   * Get comment count for a work order
   * @param workOrderId - The work order ID
   * @param session - Authenticated user session
   * @param includeInternal - Whether to include internal comments
   * @returns Number of comments
   */
  static async getCount(
    workOrderId: string,
    session: AuthenticatedSession,
    includeInternal = true
  ): Promise<number> {
    // Verify user has access to the work order
    const workOrder = await WorkOrderRepository.findById(workOrderId, session.user.companyId)

    if (!workOrder) {
      throw new Error("Orden de trabajo no encontrada o sin acceso")
    }

    // Check if user has permission to view internal comments
    const canViewInternal = await PermissionGuard.check(session, "work_orders.manage") ||
                           await PermissionGuard.check(session, "work_orders.*")

    const shouldIncludeInternal = includeInternal && canViewInternal

    return await WorkOrderCommentRepository.count(workOrderId, shouldIncludeInternal)
  }
}
