"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { InventoryItemSelect } from "@/components/inventory/inventory-item-select"
import { LocationSelect } from "@/components/inventory/location-select"
import { toast } from "sonner"
import { adjustInventoryStockSchema } from "@/app/api/schemas/inventory-schemas"

interface CreateInventoryEntryDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateInventoryEntryDialog({
  open,
  onClose,
  onSuccess
}: CreateInventoryEntryDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<z.infer<typeof adjustInventoryStockSchema>>({
    resolver: zodResolver(adjustInventoryStockSchema),
    defaultValues: {
      inventoryItemId: "",
      locationId: "",
      locationType: undefined,
      newQuantity: 0,
      reason: "",
      notes: ""
    }
  })

  const onSubmit = async (data: z.infer<typeof adjustInventoryStockSchema>) => {
    try {
      setSubmitting(true)

      const response = await fetch("/api/admin/inventory/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al agregar entrada de inventario")
      }

      toast.success("Entrada de inventario agregada exitosamente")
      form.reset()
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error creating inventory entry:", error)
      toast.error(error instanceof Error ? error.message : "Error al agregar entrada")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Entrada de Inventario</DialogTitle>
          <DialogDescription>
            Registra la entrada de repuestos al inventario
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Item Selection */}
            <FormField
              control={form.control}
              name="inventoryItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repuesto *</FormLabel>
                  <FormControl>
                    <InventoryItemSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Selection */}
            <div>
              <FormLabel>Ubicación *</FormLabel>
              <LocationSelect
                locationTypeValue={form.watch("locationType")}
                locationIdValue={form.watch("locationId")}
                onLocationTypeChange={(value) => form.setValue("locationType", value)}
                onLocationIdChange={(value) => form.setValue("locationId", value)}
                disabled={submitting}
                locationTypeLabel=""
                locationIdLabel=""
              />
              {form.formState.errors.locationType && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.locationType.message}
                </p>
              )}
              {form.formState.errors.locationId && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.locationId.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <FormField
              control={form.control}
              name="newQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={submitting}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo *</FormLabel>
                  <FormControl>
                    <Input
                      disabled={submitting}
                      placeholder="Ej: Compra, Devolución, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={submitting}
                      placeholder="Información adicional..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Agregar Entrada"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
