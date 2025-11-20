/**
 * useWorkOrderComments Hook
 * Custom hook for managing work order comments
 * Handles fetching, creating, updating, and deleting comments
 */

import { useState, useEffect, useCallback } from "react"
import type { WorkOrderCommentWithAuthor } from "@/types/work-order-comment.types"

interface UseWorkOrderCommentsOptions {
  workOrderId: string
  enabled?: boolean
}

interface UseWorkOrderCommentsReturn {
  comments: WorkOrderCommentWithAuthor[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addComment: (content: string, isInternal?: boolean) => Promise<void>
  updateComment: (commentId: string, content: string, isInternal?: boolean) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
}

export function useWorkOrderComments({
  workOrderId,
  enabled = true,
}: UseWorkOrderCommentsOptions): UseWorkOrderCommentsReturn {
  const [comments, setComments] = useState<WorkOrderCommentWithAuthor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!enabled || !workOrderId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/work-orders/${workOrderId}/comments`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al cargar comentarios")
      }

      const data: WorkOrderCommentWithAuthor[] = await response.json()
      setComments(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido al cargar comentarios"
      setError(errorMessage)
      console.error("Error fetching work order comments:", err)
    } finally {
      setLoading(false)
    }
  }, [workOrderId, enabled])

  const addComment = useCallback(
    async (content: string, isInternal = false) => {
      try {
        setError(null)

        const response = await fetch(`/api/work-orders/${workOrderId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content, isInternal }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al crear comentario")
        }

        const newComment: WorkOrderCommentWithAuthor = await response.json()
        setComments((prev) => [...prev, newComment])
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido al crear comentario"
        setError(errorMessage)
        throw err
      }
    },
    [workOrderId]
  )

  const updateComment = useCallback(
    async (commentId: string, content: string, isInternal?: boolean) => {
      try {
        setError(null)

        const response = await fetch(
          `/api/work-orders/${workOrderId}/comments/${commentId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content, isInternal }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al actualizar comentario")
        }

        const updatedComment: WorkOrderCommentWithAuthor = await response.json()
        setComments((prev) =>
          prev.map((comment) => (comment.id === commentId ? updatedComment : comment))
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido al actualizar comentario"
        setError(errorMessage)
        throw err
      }
    },
    [workOrderId]
  )

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        setError(null)

        const response = await fetch(
          `/api/work-orders/${workOrderId}/comments/${commentId}`,
          {
            method: "DELETE",
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al eliminar comentario")
        }

        setComments((prev) => prev.filter((comment) => comment.id !== commentId))
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido al eliminar comentario"
        setError(errorMessage)
        throw err
      }
    },
    [workOrderId]
  )

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    addComment,
    updateComment,
    deleteComment,
  }
}
