"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { RecurrenceType } from "@prisma/client"
import {
  scheduleDetailSchema,
  type ScheduleDetailFormData,
} from "@/schemas/schedule-detail.schema"

interface UseScheduleDetailOptions {
  scheduleId: string | null
  onSuccess?: () => void
}

interface ScheduleDetail {
  id: string
  name: string
  description: string | null
  recurrenceType: string
  recurrenceInterval: number
  isActive: boolean
  nextGenerationDate: string | null
  completionRate: number
  template: { id: string; name: string }
  asset?: { id: string; name: string; code: string }
  site?: { id: string; name: string }
  assignedUserIds: string[]
}

/**
 * Custom hook for schedule detail form
 * Handles fetching, form state, and submission
 * Max 150 lines as per nextjs-expert standards
 */
export function useScheduleDetail({ scheduleId, onSuccess }: UseScheduleDetailOptions) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [schedule, setSchedule] = useState<ScheduleDetail | null>(null)

  const form = useForm({
    resolver: zodResolver(scheduleDetailSchema),
    defaultValues: {
      name: "",
      description: "",
      interval: 1,
      isActive: true,
      assignedUserIds: [],
    },
  })

  useEffect(() => {
    if (scheduleId) {
      loadSchedule()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId])

  const loadSchedule = async () => {
    if (!scheduleId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/work-order-schedules/${scheduleId}`)
      if (!response.ok) throw new Error("Error al cargar programación")

      const responseData = await response.json()
      // Handle both { schedule: {...} } and direct response
      const data: ScheduleDetail = responseData.schedule || responseData
      setSchedule(data)

      // Populate form
      form.reset({
        name: data.name,
        description: data.description || "",
        recurrenceType: data.recurrenceType as RecurrenceType,
        interval: data.recurrenceInterval,
        isActive: data.isActive,
        assignedUserIds: data.assignedUserIds || [],
      })
    } catch (error) {
      console.error("Error loading schedule:", error)
      toast.error("Error al cargar la programación")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ScheduleDetailFormData) => {
    if (!scheduleId) return

    setSaving(true)
    try {
      // Update schedule including assignments
      const updateResponse = await fetch(`/api/work-order-schedules/${scheduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          recurrenceType: data.recurrenceType,
          recurrenceInterval: data.interval,
          isActive: data.isActive,
          assignedUserIds: data.assignedUserIds,
        }),
      })

      if (!updateResponse.ok) throw new Error("Error al actualizar")

      toast.success("Programación actualizada exitosamente")
      onSuccess?.()
    } catch (error) {
      console.error("Error updating schedule:", error)
      toast.error("Error al actualizar la programación")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!scheduleId) return
    if (!confirm("¿Eliminar esta programación?")) return

    try {
      const response = await fetch(`/api/work-order-schedules/${scheduleId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Programación eliminada")
      onSuccess?.()
    } catch (error) {
      console.error("Error deleting schedule:", error)
      toast.error("Error al eliminar la programación")
    }
  }

  return {
    form,
    loading,
    saving,
    schedule,
    onSubmit: form.handleSubmit(onSubmit),
    handleDelete,
  }
}
