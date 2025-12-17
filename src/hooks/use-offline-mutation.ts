"use client"

/**
 * Offline Mutation Hook
 *
 * Provides offline-capable mutations with automatic queueing.
 * When offline, mutations are stored in IndexedDB and synced when back online.
 *
 * Features:
 * - Optimistic updates support
 * - Automatic offline queue
 * - Toast notifications for user feedback
 * - Retry mechanism for failed mutations
 *
 * Following Next.js Expert standards:
 * - Client component only (uses browser APIs)
 * - Type-safe with no `any`
 * - Composable with existing hooks
 */

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { usePathname } from "next/navigation"
import {
  offlineDB,
  isOfflineDBAvailable,
  type PendingMutation,
} from "@/lib/offline-db"
import { useNetworkStatus } from "./use-network-status"
import { useServiceWorker } from "./use-service-worker"

// ============================================================================
// TYPES
// ============================================================================

type EntityType = "workOrder" | "alert" | "timeLog" | "asset"
type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE"

interface MutationOptions<TData> {
  /** Callback executed on successful mutation */
  onSuccess?: (data: TData) => void
  /** Callback executed on error */
  onError?: (error: Error) => void
  /** Function to apply optimistic update immediately */
  optimisticUpdate?: () => void
  /** Function to rollback optimistic update on error */
  rollbackUpdate?: () => void
  /** Custom success message for toast */
  successMessage?: string
  /** Custom offline message for toast */
  offlineMessage?: string
  /** Whether to show toast notifications (default: true) */
  showToast?: boolean
}

interface MutateParams<TPayload> {
  /** API endpoint URL */
  url: string
  /** HTTP method */
  method: HttpMethod
  /** Request payload */
  payload: TPayload
  /** Entity type for categorization */
  entity: EntityType
  /** Optional entity ID for updates/deletes */
  entityId?: string
}

interface UseOfflineMutationResult {
  /** Function to execute a mutation */
  mutate: <TPayload, TResponse = unknown>(
    params: MutateParams<TPayload>,
    options?: MutationOptions<TResponse>
  ) => Promise<TResponse | { queued: true }>
  /** Whether a mutation is currently in progress */
  isPending: boolean
  /** Whether currently offline */
  isOffline: boolean
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * useOfflineMutation - Mutation hook with offline support
 *
 * @example
 * ```tsx
 * const { mutate, isPending, isOffline } = useOfflineMutation()
 *
 * const handleComplete = async () => {
 *   await mutate(
 *     {
 *       url: `/api/work-orders/${id}/complete`,
 *       method: 'POST',
 *       payload: { notes: 'Completed successfully' },
 *       entity: 'workOrder',
 *       entityId: id,
 *     },
 *     {
 *       onSuccess: () => refresh(),
 *       optimisticUpdate: () => setStatus('COMPLETED'),
 *       rollbackUpdate: () => setStatus(previousStatus),
 *       successMessage: 'Orden completada',
 *     }
 *   )
 * }
 * ```
 */
export function useOfflineMutation(): UseOfflineMutationResult {
  const pathname = usePathname()
  const { registration } = useServiceWorker(pathname)
  const { isOnline } = useNetworkStatus(registration)
  const [isPending, setIsPending] = useState(false)

  // ========================================================================
  // MUTATE FUNCTION
  // ========================================================================

  const mutate = useCallback(
    async <TPayload, TResponse = unknown>(
      params: MutateParams<TPayload>,
      options?: MutationOptions<TResponse>
    ): Promise<TResponse | { queued: true }> => {
      const { url, method, payload, entity, entityId } = params
      const {
        onSuccess,
        onError,
        optimisticUpdate,
        rollbackUpdate,
        successMessage = "Operacion completada",
        offlineMessage = "Guardado localmente. Se sincronizara cuando vuelva la conexion.",
        showToast = true,
      } = options || {}

      setIsPending(true)

      // Apply optimistic update immediately
      try {
        optimisticUpdate?.()
      } catch (error) {
        console.error("[useOfflineMutation] Optimistic update failed:", error)
      }

      // ====================================================================
      // ONLINE: Try to execute mutation directly
      // ====================================================================
      if (isOnline) {
        try {
          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(
              errorData.error || `Request failed with status ${response.status}`
            )
          }

          const data = (await response.json()) as TResponse

          if (showToast) {
            toast.success(successMessage)
          }

          onSuccess?.(data)
          setIsPending(false)
          return data
        } catch (error) {
          console.log(
            "[useOfflineMutation] Online request failed, queueing for later:",
            error
          )
          // Fall through to offline queue
        }
      }

      // ====================================================================
      // OFFLINE or FAILED: Queue mutation for later sync
      // ====================================================================
      if (isOfflineDBAvailable() && offlineDB) {
        try {
          const mutation: Omit<PendingMutation, "id"> = {
            type: method === "POST" ? "CREATE" : method === "DELETE" ? "DELETE" : "UPDATE",
            entity,
            entityId,
            payload: { url, method, body: payload },
            createdAt: Date.now(),
            status: "pending",
            retryCount: 0,
          }

          await offlineDB.pendingMutations.add(mutation)

          if (showToast) {
            toast.info("Guardado offline", {
              description: offlineMessage,
            })
          }

          // Still call onSuccess for optimistic updates to persist
          // The actual sync will happen later
          onSuccess?.({} as TResponse)
          setIsPending(false)
          return { queued: true }
        } catch (dbError) {
          console.error("[useOfflineMutation] Failed to queue mutation:", dbError)

          // Rollback optimistic update since we couldn't save
          try {
            rollbackUpdate?.()
          } catch (rollbackError) {
            console.error("[useOfflineMutation] Rollback failed:", rollbackError)
          }

          const error = new Error("No se pudo guardar la accion offline")
          onError?.(error)

          if (showToast) {
            toast.error("Error", {
              description: "No se pudo guardar la accion. Por favor, intente de nuevo.",
            })
          }

          setIsPending(false)
          throw error
        }
      }

      // ====================================================================
      // NO DB AVAILABLE: Fail gracefully
      // ====================================================================
      const error = new Error(
        "No hay conexion y el almacenamiento offline no esta disponible"
      )

      // Rollback optimistic update
      try {
        rollbackUpdate?.()
      } catch (rollbackError) {
        console.error("[useOfflineMutation] Rollback failed:", rollbackError)
      }

      onError?.(error)

      if (showToast) {
        toast.error("Sin conexion", {
          description: "No se puede realizar esta accion sin conexion a internet.",
        })
      }

      setIsPending(false)
      throw error
    },
    [isOnline]
  )

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    mutate,
    isPending,
    isOffline: !isOnline,
  }
}

// ============================================================================
// PRESET MUTATION FUNCTIONS
// ============================================================================

/**
 * Complete a work order
 */
export function useCompleteWorkOrder() {
  const { mutate, isPending, isOffline } = useOfflineMutation()

  const completeWorkOrder = useCallback(
    async (
      workOrderId: string,
      data: { observations?: string; completionNotes?: string },
      options?: MutationOptions<unknown>
    ) => {
      return mutate(
        {
          url: `/api/work-orders/${workOrderId}/complete`,
          method: "POST",
          payload: data,
          entity: "workOrder",
          entityId: workOrderId,
        },
        {
          successMessage: "Orden de trabajo completada",
          ...options,
        }
      )
    },
    [mutate]
  )

  return { completeWorkOrder, isPending, isOffline }
}

/**
 * Start time tracking for a work order
 */
export function useStartTimeLog() {
  const { mutate, isPending, isOffline } = useOfflineMutation()

  const startTimeLog = useCallback(
    async (
      workOrderId: string,
      data: { latitude?: number; longitude?: number },
      options?: MutationOptions<unknown>
    ) => {
      return mutate(
        {
          url: `/api/work-orders/${workOrderId}/time-logs`,
          method: "POST",
          payload: { action: "START", ...data },
          entity: "timeLog",
          entityId: workOrderId,
        },
        {
          successMessage: "Tiempo iniciado",
          ...options,
        }
      )
    },
    [mutate]
  )

  return { startTimeLog, isPending, isOffline }
}

/**
 * Stop time tracking for a work order
 */
export function useStopTimeLog() {
  const { mutate, isPending, isOffline } = useOfflineMutation()

  const stopTimeLog = useCallback(
    async (
      workOrderId: string,
      data: { latitude?: number; longitude?: number; notes?: string },
      options?: MutationOptions<unknown>
    ) => {
      return mutate(
        {
          url: `/api/work-orders/${workOrderId}/time-logs`,
          method: "POST",
          payload: { action: "COMPLETE", ...data },
          entity: "timeLog",
          entityId: workOrderId,
        },
        {
          successMessage: "Tiempo detenido",
          ...options,
        }
      )
    },
    [mutate]
  )

  return { stopTimeLog, isPending, isOffline }
}
