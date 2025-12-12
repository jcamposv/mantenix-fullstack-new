/**
 * Work Order Comment Types
 * Type definitions for work order comments system
 */

export interface WorkOrderCommentWithAuthor {
  id: string
  content: string
  isInternal: boolean
  createdAt: Date
  workOrderId: string
  authorId: string
  author: {
    id: string
    name: string
    email: string
    role: string
  }
}

export interface CreateWorkOrderCommentData {
  content: string
  workOrderId: string
  authorId: string
  isInternal?: boolean
}

export interface UpdateWorkOrderCommentData {
  content?: string
  isInternal?: boolean
}

export interface WorkOrderCommentFilters {
  workOrderId?: string
  authorId?: string
  isInternal?: boolean
}
