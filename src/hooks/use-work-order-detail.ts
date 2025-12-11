"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { WorkOrderPriority } from "@prisma/client"
import {
  workOrderDetailSchema,
  type WorkOrderDetailFormData,
} from "@/schemas/work-order-detail.schema"

// Valid statuses for the form schema
type FormStatus = "DRAFT" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

// Map Prisma WorkOrderStatus to form-compatible status
const mapStatusToForm = (status: string): FormStatus => {
  const validStatuses: FormStatus[] = ["DRAFT", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
  if (validStatuses.includes(status as FormStatus)) {
    return status as FormStatus
  }
  // Map workflow statuses to form-compatible statuses
  switch (status) {
    case "PENDING_APPROVAL":
    case "APPROVED":
      return "ASSIGNED"
    case "REJECTED":
      return "DRAFT"
    case "PENDING_QA":
      return "COMPLETED"
    default:
      return "DRAFT"
  }
}

interface UseWorkOrderDetailOptions {
  workOrderId: string | null
  onSuccess?: () => void
}

interface WorkOrderDetail {
  id: string
  number: string
  title: string
  description: string | null
  priority: string
  status: string
  scheduledDate: string | null
  estimatedDuration: number | null
  customFieldValues: Record<string, unknown>
  template?: {
    id: string
    name: string
    customFields: { fields?: Array<{ id: string; label: string; type: string; required?: boolean; options?: string[] }> } | null
  }
  asset?: { id: string; name: string; code: string }
  site?: { id: string; name: string }
  assignments: Array<{ userId: string; user: { id: string; name: string; email: string } }>
}

/**
 * Custom hook for work order detail form
 * Handles fetching, form state, and submission
 * Max 150 lines as per nextjs-expert standards
 */
export function useWorkOrderDetail({ workOrderId, onSuccess }: UseWorkOrderDetailOptions) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [workOrder, setWorkOrder] = useState<WorkOrderDetail | null>(null)

  const form = useForm({
    resolver: zodResolver(workOrderDetailSchema),
    defaultValues: {
      title: "",
      description: "",
      technicianIds: [],
    },
  })

  useEffect(() => {
    if (workOrderId) {
      loadWorkOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrderId])

  const loadWorkOrder = async () => {
    if (!workOrderId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/work-orders/${workOrderId}`)
      if (!response.ok) throw new Error("Error al cargar orden")

      const responseData = await response.json()
      // API returns { workOrder: {...} }
      const data: WorkOrderDetail = responseData.workOrder || responseData
      setWorkOrder(data)

      // Populate form
      form.reset({
        title: data.title,
        description: data.description || "",
        priority: data.priority as WorkOrderPriority,
        status: mapStatusToForm(data.status),
        scheduledDate: data.scheduledDate
          ? new Date(data.scheduledDate).toISOString().split("T")[0]
          : "",
        estimatedDuration: data.estimatedDuration || undefined,
        technicianIds: data.assignments?.map((a) => a.userId) || [],
        customFieldValues: data.customFieldValues || {},
      })
    } catch (error) {
      console.error("Error loading work order:", error)
      toast.error("Error al cargar la orden de trabajo")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: WorkOrderDetailFormData) => {
    if (!workOrderId) return

    setSaving(true)
    try {
      // Update work order
      const updateResponse = await fetch(`/api/work-orders/${workOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          scheduledDate: data.scheduledDate || null,
          estimatedDuration: data.estimatedDuration || null,
          customFieldValues: data.customFieldValues,
        }),
      })

      if (!updateResponse.ok) throw new Error("Error al actualizar")

      // Update assignments
      const assignResponse = await fetch(`/api/work-orders/${workOrderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: data.technicianIds }),
      })

      if (!assignResponse.ok) throw new Error("Error al asignar técnicos")

      toast.success("Orden actualizada exitosamente")
      onSuccess?.()
    } catch (error) {
      console.error("Error updating work order:", error)
      toast.error("Error al actualizar la orden de trabajo")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!workOrderId) return
    if (!confirm("¿Eliminar esta orden de trabajo?")) return

    try {
      const response = await fetch(`/api/work-orders/${workOrderId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Orden eliminada")
      onSuccess?.()
    } catch (error) {
      console.error("Error deleting work order:", error)
      toast.error("Error al eliminar la orden de trabajo")
    }
  }

  return {
    form,
    loading,
    saving,
    workOrder,
    onSubmit: form.handleSubmit(onSubmit),
    handleDelete,
  }
}
