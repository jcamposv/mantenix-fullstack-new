/**
 * Work Order Comment Repository
 * Data access layer for work order comments
 * Follows repository pattern with static methods for CRUD operations
 */

import { prisma } from "@/lib/prisma"
import type {
  WorkOrderCommentWithAuthor,
  CreateWorkOrderCommentData,
  UpdateWorkOrderCommentData,
  WorkOrderCommentFilters,
} from "@/types/work-order-comment.types"

/**
 * Repository for work order comment data access
 * Contains only direct CRUD operations with Prisma
 */
export class WorkOrderCommentRepository {
  /**
   * Find all comments for a specific work order
   * @param workOrderId - The work order ID to filter by
   * @param includeInternal - Whether to include internal comments (default: true)
   * @returns Array of comments with author information
   */
  static async findManyByWorkOrder(
    workOrderId: string,
    includeInternal = true
  ): Promise<WorkOrderCommentWithAuthor[]> {
    const where = includeInternal
      ? { workOrderId }
      : { workOrderId, isInternal: false }

    return (await prisma.workOrderComment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })) as unknown as WorkOrderCommentWithAuthor[]
  }

  /**
   * Find comments with custom filters
   * @param filters - Filter criteria
   * @returns Array of comments matching the filters
   */
  static async findMany(
    filters: WorkOrderCommentFilters
  ): Promise<WorkOrderCommentWithAuthor[]> {
    const where = {
      ...(filters.workOrderId && { workOrderId: filters.workOrderId }),
      ...(filters.authorId && { authorId: filters.authorId }),
      ...(filters.isInternal !== undefined && { isInternal: filters.isInternal }),
    }

    return (await prisma.workOrderComment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })) as unknown as WorkOrderCommentWithAuthor[]
  }

  /**
   * Find a single comment by ID
   * @param id - Comment ID
   * @returns Comment with author information or null
   */
  static async findById(id: string): Promise<WorkOrderCommentWithAuthor | null> {
    return (await prisma.workOrderComment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
    })) as unknown as WorkOrderCommentWithAuthor | null
  }

  /**
   * Create a new work order comment
   * @param data - Comment data
   * @returns Newly created comment with author information
   */
  static async create(
    data: CreateWorkOrderCommentData
  ): Promise<WorkOrderCommentWithAuthor> {
    return (await prisma.workOrderComment.create({
      data: {
        content: data.content,
        workOrderId: data.workOrderId,
        authorId: data.authorId,
        isInternal: data.isInternal ?? false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
    })) as unknown as WorkOrderCommentWithAuthor
  }

  /**
   * Update an existing work order comment
   * @param id - Comment ID
   * @param data - Updated comment data
   * @returns Updated comment with author information
   */
  static async update(
    id: string,
    data: UpdateWorkOrderCommentData
  ): Promise<WorkOrderCommentWithAuthor> {
    return (await prisma.workOrderComment.update({
      where: { id },
      data: {
        ...(data.content !== undefined && { content: data.content }),
        ...(data.isInternal !== undefined && { isInternal: data.isInternal }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
    })) as unknown as WorkOrderCommentWithAuthor
  }

  /**
   * Delete a work order comment
   * @param id - Comment ID
   * @returns Deleted comment
   */
  static async delete(id: string): Promise<WorkOrderCommentWithAuthor> {
    return (await prisma.workOrderComment.delete({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true,
              },
            },
          },
        },
      },
    })) as unknown as WorkOrderCommentWithAuthor
  }

  /**
   * Count comments for a work order
   * @param workOrderId - The work order ID
   * @param includeInternal - Whether to include internal comments
   * @returns Number of comments
   */
  static async count(workOrderId: string, includeInternal = true): Promise<number> {
    const where = includeInternal
      ? { workOrderId }
      : { workOrderId, isInternal: false }

    return await prisma.workOrderComment.count({ where })
  }
}
