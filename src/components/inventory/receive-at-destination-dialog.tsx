"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Package, Building2, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { deliverFromWarehouseSchema, type DeliverFromWarehouseFormData } from "@/schemas/inventory"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReceiveAtDestinationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: DeliverFromWarehouseFormData) => Promise<void>
  itemName: string
  itemCode: string
  quantity: number
  isLoading?: boolean
}

export function ReceiveAtDestinationDialog({
  open,
  onOpenChange,
  onSubmit,
  itemName,
  itemCode,
  quantity,
  isLoading = false
}: ReceiveAtDestinationDialogProps) {
  const form = useForm<DeliverFromWarehouseFormData>({
    resolver: zodResolver(deliverFromWarehouseSchema),
    defaultValues: {
      notes: ""
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({ notes: "" })
    }
  }, [open, form])

  const handleSubmit = async (data: DeliverFromWarehouseFormData) => {
    await onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Recibir en Bodega Destino
          </DialogTitle>
          <DialogDescription>
            Confirmar la llegada del repuesto a la bodega de destino
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">{itemName}</p>
              <p className="text-sm text-muted-foreground">Código: {itemCode}</p>
              <p className="text-sm">
                Cantidad: <span className="font-semibold">{quantity}</span> unidades
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Condiciones de recepción, observaciones..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Confirmar Recepción"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
