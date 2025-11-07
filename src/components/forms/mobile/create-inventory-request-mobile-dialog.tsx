"use client"

import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { InventoryRequestFields } from "./inventory-request-fields"
import { createInventoryRequestSchema } from "@/app/api/schemas/inventory-schemas"
import { toast } from "sonner"

type CreateInventoryRequestFormData = z.infer<typeof createInventoryRequestSchema>

interface CreateInventoryRequestMobileDialogProps {
  open: boolean
  onClose: () => void
  workOrderId: string
  onSuccess: () => void
}

export function CreateInventoryRequestMobileDialog({
  open,
  onClose,
  workOrderId,
  onSuccess
}: CreateInventoryRequestMobileDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<CreateInventoryRequestFormData>({
    resolver: zodResolver(createInventoryRequestSchema) as Resolver<CreateInventoryRequestFormData>,
    defaultValues: {
      workOrderId,
      inventoryItemId: "",
      requestedQuantity: 1,
      sourceLocationId: "",
      sourceLocationType: "WAREHOUSE",
      urgency: "NORMAL",
      notes: ""
    }
  })

  const onSubmit = async (data: CreateInventoryRequestFormData) => {
    try {
      setSubmitting(true)

      const response = await fetch("/api/admin/inventory/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear la solicitud")
      }

      onSuccess()
      form.reset()
    } catch (error) {
      console.error("Error creating inventory request:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear la solicitud")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Solicitar Repuesto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InventoryRequestFields
              form={form}
              disabled={submitting}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 text-sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Solicitud"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
