"use client"

import { useState, useEffect } from "react"
import type { MobileCompleteWorkOrderData } from "@/schemas/mobile-work-order"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

export function useWorkOrderManagement(workOrderId: string) {
  const [workOrder, setWorkOrder] = useState<WorkOrderWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [initialFormValues, setInitialFormValues] = useState<Partial<MobileCompleteWorkOrderData>>({})

  const fetchWorkOrder = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/work-orders/${workOrderId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar la orden de trabajo')
      }

      const data = await response.json()
      const workOrderData = data.workOrder || data

      setWorkOrder(workOrderData)
      
      // Prepare initial form values
      const defaultCustomFieldValues: Record<string, unknown> = {}
      if (workOrderData.template?.customFields?.fields) {
        workOrderData.template.customFields.fields.forEach((field: { id: string; type: string }) => {
          defaultCustomFieldValues[field.id] = workOrderData.customFieldValues?.[field.id] || 
            (field.type === 'CHECKLIST' ? [] : (field.type === 'CHECKBOX' ? false : ''))
        })
      }

      setInitialFormValues({
        customFieldValues: defaultCustomFieldValues,
        completionNotes: workOrderData.completionNotes || "",
        observations: workOrderData.observations || "",
        actualDuration: workOrderData.actualDuration || undefined,
        actualCost: workOrderData.actualCost || undefined
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleStartWork = async () => {
    if (!workOrder) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/work-orders/${workOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'IN_PROGRESS',
          startedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Error al iniciar trabajo')
      }

      setShowForm(true)
      await fetchWorkOrder()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar trabajo')
    } finally {
      setUpdating(false)
    }
  }

  const handleCompleteWork = async (data: MobileCompleteWorkOrderData) => {
    if (!workOrder) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/work-orders/${workOrderId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Error al completar la orden')
      }

      await fetchWorkOrder()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelWork = async (notes?: string) => {
    if (!workOrder) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/work-orders/${workOrderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notes || `Cancelado desde móvil el ${new Date().toLocaleString()}`
        })
      })

      if (!response.ok) {
        throw new Error('Error al cancelar la orden')
      }

      await fetchWorkOrder()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar')
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    fetchWorkOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrderId])

  return {
    workOrder,
    loading,
    error,
    updating,
    showForm,
    initialFormValues,
    setShowForm,
    fetchWorkOrder,
    handleStartWork,
    handleCompleteWork,
    handleCancelWork
  }
}