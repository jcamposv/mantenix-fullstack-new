import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { justifyAttendanceSchema } from "@/app/api/schemas/attendance-schemas"
import { z } from "zod"

type JustifyAttendanceFormData = z.infer<typeof justifyAttendanceSchema>

interface UseJustifyAttendanceOptions {
  onSuccess?: () => void
}

interface UseJustifyAttendanceReturn {
  form: ReturnType<typeof useForm<JustifyAttendanceFormData>>
  isSubmitting: boolean
  justifyAttendance: (attendanceId: string) => Promise<void>
}

/**
 * Custom hook for justifying attendance records
 * Handles form state, validation, and API calls
 */
export function useJustifyAttendance(
  options: UseJustifyAttendanceOptions = {}
): UseJustifyAttendanceReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<JustifyAttendanceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(justifyAttendanceSchema) as any,
    defaultValues: {
      justificationNotes: "",
    },
  })

  const justifyAttendance = useCallback(
    async (attendanceId: string) => {
      try {
        setIsSubmitting(true)

        const values = form.getValues()
        const response = await fetch(`/api/attendance/${attendanceId}/justify`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al justificar asistencia")
        }

        toast.success("Asistencia justificada exitosamente")
        form.reset()

        if (options.onSuccess) {
          options.onSuccess()
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido"
        toast.error(message)
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, options]
  )

  return {
    form,
    isSubmitting,
    justifyAttendance,
  }
}
