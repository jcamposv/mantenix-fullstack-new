"use client"

/**
 * Work Order Management Hook with Offline Support
 *
 * Provides offline-first work order management using:
 * - SWR for data fetching with caching
 * - IndexedDB fallback when offline
 * - Mutation queue for offline actions
 * - Optimistic updates for responsive UI
 *
 * Following Next.js Expert standards:
 * - Type-safe with no `any`
 * - Clean separation of concerns
 * - Proper error handling
 */

import { useState, useCallback, useEffect } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import type { MobileCompleteWorkOrderData } from "@/schemas/mobile-work-order"
import type { WorkOrderWithRelations, JsonValue } from "@/types/work-order.types"
import {
  isOfflineDBAvailable,
  getOfflineWorkOrder,
  saveOfflineWorkOrder,
  updateOfflineWorkOrder,
  queueMutation,
} from "@/lib/offline-db"

// ============================================================================
// TYPES
// ============================================================================

interface UseWorkOrderManagementResult {
  workOrder: WorkOrderWithRelations | null
  loading: boolean
  error: string | null
  updating: boolean
  showForm: boolean
  initialFormValues: Partial<MobileCompleteWorkOrderData>
  isOffline: boolean
  isStale: boolean
  setShowForm: (show: boolean) => void
  fetchWorkOrder: () => Promise<void>
  handleStartWork: () => Promise<void>
  handleCompleteWork: (data: MobileCompleteWorkOrderData) => Promise<void>
  handleCancelWork: (notes?: string) => Promise<void>
}

// ============================================================================
// SWR FETCHER WITH OFFLINE FALLBACK
// ============================================================================

/**
 * Fetcher function that saves to IndexedDB and falls back to cache when offline
 */
async function workOrderFetcher(url: string): Promise<WorkOrderWithRelations> {
  const id = url.split("/").pop()!

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error("Error al cargar la orden de trabajo")
    }

    const data = await response.json()
    const workOrder = data.workOrder || data

    // Save to IndexedDB for offline access
    if (isOfflineDBAvailable()) {
      await saveOfflineWorkOrder(workOrder)
    }

    return workOrder
  } catch (error) {
    // If fetch fails (offline), try to get from IndexedDB
    if (isOfflineDBAvailable()) {
      const cached = await getOfflineWorkOrder(id)
      if (cached) {
        return cached
      }
    }
    throw error
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useWorkOrderManagement(
  workOrderId: string
): UseWorkOrderManagementResult {
  const [updating, setUpdating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [initialFormValues, setInitialFormValues] = useState<
    Partial<MobileCompleteWorkOrderData>
  >({})
  const [isOffline, setIsOffline] = useState(false)

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    setIsOffline(!navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // SWR for data fetching with offline support
  const {
    data: workOrder,
    error: swrError,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<WorkOrderWithRelations>(
    workOrderId ? `/api/work-orders/${workOrderId}` : null,
    workOrderFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: isOffline ? 0 : 3,
      // When offline, don't retry
      shouldRetryOnError: !isOffline,
      // Fallback to cached data on error
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (isOffline) return
        if (retryCount >= 3) return
        setTimeout(() => revalidate({ retryCount }), 5000)
      },
    }
  )

  // Determine if data is stale (from cache while offline)
  const isStale = isOffline && !!workOrder && !isValidating

  // Parse error message
  const error = swrError
    ? swrError instanceof Error
      ? swrError.message
      : "Error desconocido"
    : null

  // Prepare initial form values when work order loads
  useEffect(() => {
    if (!workOrder) return

    const defaultCustomFieldValues: Record<string, unknown> = {}
    const customFields = workOrder.template?.customFields as { fields?: Array<{ id: string; type: string }> } | null
    if (customFields?.fields) {
      const fields = customFields.fields as Array<{
        id: string
        type: string
      }>
      fields.forEach((field) => {
        defaultCustomFieldValues[field.id] =
          (workOrder.customFieldValues as Record<string, unknown>)?.[
            field.id
          ] ||
          (field.type === "CHECKLIST"
            ? []
            : field.type === "CHECKBOX"
              ? false
              : "")
      })
    }

    setInitialFormValues({
      customFieldValues: defaultCustomFieldValues,
      completionNotes: workOrder.completionNotes || "",
      observations: workOrder.observations || "",
      actualDuration: workOrder.actualDuration || undefined,
      actualCost: workOrder.actualCost
        ? Number(workOrder.actualCost)
        : undefined,
    })
  }, [workOrder])

  // ==========================================================================
  // FETCH WORK ORDER (manual refresh)
  // ==========================================================================

  const fetchWorkOrder = useCallback(async () => {
    await mutate()
  }, [mutate])

  // ==========================================================================
  // START WORK
  // ==========================================================================

  const handleStartWork = useCallback(async () => {
    if (!workOrder) return

    setUpdating(true)

    const updatePayload = {
      status: "IN_PROGRESS" as const,
      startedAt: new Date().toISOString(),
    }

    try {
      if (isOffline) {
        // Offline: Optimistic update + queue mutation
        const updated = await updateOfflineWorkOrder(workOrder.id, {
          status: "IN_PROGRESS",
          startedAt: new Date().toISOString(),
        })

        if (updated) {
          await mutate(updated, false)
        }

        await queueMutation({
          type: "UPDATE",
          entity: "workOrder",
          entityId: workOrder.id,
          payload: {
            url: `/api/work-orders/${workOrderId}`,
            method: "PUT",
            body: updatePayload,
          },
        })

        toast.success("Trabajo iniciado (se sincronizará cuando haya conexión)")
        setShowForm(true)
      } else {
        // Online: Direct API call
        const response = await fetch(`/api/work-orders/${workOrderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        })

        if (!response.ok) {
          throw new Error("Error al iniciar trabajo")
        }

        setShowForm(true)
        await mutate()
        toast.success("Trabajo iniciado")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar trabajo"
      toast.error(message)
    } finally {
      setUpdating(false)
    }
  }, [workOrder, workOrderId, isOffline, mutate])

  // ==========================================================================
  // COMPLETE WORK
  // ==========================================================================

  const handleCompleteWork = useCallback(
    async (data: MobileCompleteWorkOrderData) => {
      if (!workOrder) return

      setUpdating(true)

      try {
        if (isOffline) {
          // Offline: Optimistic update + queue mutation
          const updated = await updateOfflineWorkOrder(workOrder.id, {
            status: "COMPLETED",
            completedAt: new Date().toISOString(),
            completionNotes: data.completionNotes,
            observations: data.observations,
            customFieldValues: data.customFieldValues as unknown as JsonValue,
            actualDuration: data.actualDuration,
            actualCost: data.actualCost ? Number(data.actualCost) : null,
          })

          if (updated) {
            await mutate(updated, false)
          }

          await queueMutation({
            type: "UPDATE",
            entity: "workOrder",
            entityId: workOrder.id,
            payload: {
              url: `/api/work-orders/${workOrderId}/complete`,
              method: "POST",
              body: data,
            },
          })

          toast.success("Orden completada (se sincronizará cuando haya conexión)")
          setShowForm(false)
        } else {
          // Online: Direct API call
          const response = await fetch(
            `/api/work-orders/${workOrderId}/complete`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
          )

          if (!response.ok) {
            throw new Error("Error al completar la orden")
          }

          await mutate()
          setShowForm(false)
          toast.success("Orden completada exitosamente")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al completar"
        toast.error(message)
      } finally {
        setUpdating(false)
      }
    },
    [workOrder, workOrderId, isOffline, mutate]
  )

  // ==========================================================================
  // CANCEL WORK
  // ==========================================================================

  const handleCancelWork = useCallback(
    async (notes?: string) => {
      if (!workOrder) return

      setUpdating(true)

      const cancelPayload = {
        notes: notes || `Cancelado desde móvil el ${new Date().toLocaleString()}`,
      }

      try {
        if (isOffline) {
          // Offline: Optimistic update + queue mutation
          const updated = await updateOfflineWorkOrder(workOrder.id, {
            status: "CANCELLED",
            completionNotes: cancelPayload.notes,
          })

          if (updated) {
            await mutate(updated, false)
          }

          await queueMutation({
            type: "UPDATE",
            entity: "workOrder",
            entityId: workOrder.id,
            payload: {
              url: `/api/work-orders/${workOrderId}/cancel`,
              method: "POST",
              body: cancelPayload,
            },
          })

          toast.success("Orden cancelada (se sincronizará cuando haya conexión)")
          setShowForm(false)
        } else {
          // Online: Direct API call
          const response = await fetch(
            `/api/work-orders/${workOrderId}/cancel`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(cancelPayload),
            }
          )

          if (!response.ok) {
            throw new Error("Error al cancelar la orden")
          }

          await mutate()
          setShowForm(false)
          toast.success("Orden cancelada")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cancelar"
        toast.error(message)
      } finally {
        setUpdating(false)
      }
    },
    [workOrder, workOrderId, isOffline, mutate]
  )

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    workOrder: workOrder ?? null,
    loading: isLoading,
    error,
    updating,
    showForm,
    initialFormValues,
    isOffline,
    isStale,
    setShowForm,
    fetchWorkOrder,
    handleStartWork,
    handleCompleteWork,
    handleCancelWork,
  }
}
