"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ScrollableDialog } from "@/components/common/scrollable-dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  workOrderQuickEditSchema,
  type WorkOrderQuickEditData,
} from "@/schemas/work-order-quick-actions.schema"

interface QuickEditDialogProps {
  workOrder: {
    id: string
    number: string
    title: string
    scheduledDate: string | null
    priority: string
    status: string
    estimatedDuration: number | null
    description: string | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * QuickEditDialog
 * Quick edit work order details from calendar
 */
export function QuickEditDialog({
  workOrder,
  open,
  onOpenChange,
  onSuccess,
}: QuickEditDialogProps) {
  const form = useForm({
    resolver: zodResolver(workOrderQuickEditSchema),
  })

  useEffect(() => {
    if (open && workOrder) {
      form.reset({
        workOrderId: workOrder.id,
        title: workOrder.title,
        scheduledDate: workOrder.scheduledDate
          ? new Date(workOrder.scheduledDate).toISOString()
          : new Date().toISOString(),
        priority: workOrder.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        status: workOrder.status as "DRAFT" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
        estimatedDuration: workOrder.estimatedDuration || undefined,
        description: workOrder.description || undefined,
      })
    }
  }, [open, workOrder, form])

  const onSubmit = async (data: WorkOrderQuickEditData): Promise<void> => {
    try {
      const response = await fetch(`/api/work-orders/${workOrder?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          scheduledDate: new Date(data.scheduledDate),
          priority: data.priority,
          status: data.status,
          estimatedDuration: data.estimatedDuration,
          description: data.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar orden")
      }

      toast.success("Orden actualizada exitosamente")
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error updating work order:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar orden")
    }
  }

  const handleClose = (): void => {
    if (!form.formState.isSubmitting) {
      form.reset()
      onOpenChange(false)
    }
  }

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={handleClose}
      title="Editar Orden de Trabajo"
      description={workOrder?.number}
      maxWidth="lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={form.formState.isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Guardar Cambios
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título de la orden" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">Baja</SelectItem>
                      <SelectItem value="MEDIUM">Media</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">Borrador</SelectItem>
                      <SelectItem value="ASSIGNED">Asignada</SelectItem>
                      <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                      <SelectItem value="COMPLETED">Completada</SelectItem>
                      <SelectItem value="CANCELLED">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Programada</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => {
                        const date = new Date(e.target.value)
                        field.onChange(date.toISOString())
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedDuration"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Duración Estimada (horas)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      {...field}
                      value={(value as number | undefined) ?? ""}
                      onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción de la orden de trabajo"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ScrollableDialog>
  )
}
