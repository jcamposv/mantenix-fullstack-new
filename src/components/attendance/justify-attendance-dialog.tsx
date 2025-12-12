"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useJustifyAttendance } from "@/hooks/use-justify-attendance"
import type { AttendanceRecordWithRelations } from "@/types/attendance.types"
import { Badge } from "@/components/ui/badge"

interface JustifyAttendanceDialogProps {
  record: AttendanceRecordWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const statusConfig = {
  ON_TIME: { label: "A Tiempo", variant: "default" as const },
  LATE: { label: "Tarde", variant: "secondary" as const },
  ABSENT: { label: "Ausente", variant: "destructive" as const },
  JUSTIFIED: { label: "Justificado", variant: "outline" as const },
  EARLY_DEPARTURE: { label: "Salida Temprana", variant: "secondary" as const },
}

/**
 * Dialog component for justifying attendance records
 * Uses React Hook Form with Zod validation
 */
export function JustifyAttendanceDialog({
  record,
  open,
  onOpenChange,
  onSuccess,
}: JustifyAttendanceDialogProps) {
  const { form, isSubmitting, justifyAttendance } = useJustifyAttendance({
    onSuccess: () => {
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    },
  })

  const handleSubmit = async () => {
    if (!record) return

    try {
      await justifyAttendance(record.id)
    } catch (error) {
      // Error handling is done in the hook
      console.error("Error justifying attendance:", error)
    }
  }

  if (!record) return null

  const config = statusConfig[record.status]
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Justificar Asistencia</DialogTitle>
          <DialogDescription>
            Proporciona una justificación para este registro de asistencia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Record Info */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Usuario:</span>
              <span className="text-sm">{record.user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fecha:</span>
              <span className="text-sm">{formatDate(record.checkInAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Entrada:</span>
              <span className="text-sm">{formatTime(record.checkInAt)}</span>
            </div>
            {record.checkOutAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Salida:</span>
                <span className="text-sm">{formatTime(record.checkOutAt)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estado Actual:</span>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            {record.lateMinutes && record.lateMinutes > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tiempo tarde:</span>
                <span className="text-sm text-warning">{record.lateMinutes} minutos</span>
              </div>
            )}
            {record.earlyDepartureMinutes && record.earlyDepartureMinutes > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Salida temprana:</span>
                <span className="text-sm text-orange-500">
                  {record.earlyDepartureMinutes} minutos
                </span>
              </div>
            )}
          </div>

          {/* Justification Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="justificationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justificación *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe la razón de la justificación..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Justificando..." : "Justificar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
