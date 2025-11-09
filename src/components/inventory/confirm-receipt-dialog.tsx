"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Package, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { confirmReceiptSchema, type ConfirmReceiptFormData } from "@/schemas/inventory"
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

interface ConfirmReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ConfirmReceiptFormData) => Promise<void>
  itemName: string
  itemCode: string
  quantity: number
  warehouseDeliveredAt?: string
  isLoading?: boolean
}

export function ConfirmReceiptDialog({
  open,
  onOpenChange,
  onSubmit,
  itemName,
  itemCode,
  quantity,
  warehouseDeliveredAt,
  isLoading = false
}: ConfirmReceiptDialogProps) {
  const form = useForm<ConfirmReceiptFormData>({
    resolver: zodResolver(confirmReceiptSchema),
    defaultValues: {
      notes: ""
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({ notes: "" })
    }
  }, [open, form])

  const handleSubmit = async (data: ConfirmReceiptFormData) => {
    await onSubmit(data)
    form.reset()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Confirmar Recepción
          </DialogTitle>
          <DialogDescription>
            Confirmar que recibiste el repuesto físicamente
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-green-50 border-green-200">
          <Package className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium text-green-900">
                {itemCode} - {itemName}
              </div>
              <div className="text-sm text-green-700">
                Cantidad: <span className="font-semibold">{quantity}</span> unidades
              </div>
              {warehouseDeliveredAt && (
                <div className="text-sm text-green-700">
                  Entregado: <span className="font-semibold">
                    {formatDate(warehouseDeliveredAt)}
                  </span>
                </div>
              )}
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
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Repuesto recibido en buen estado..."
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
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Recepción
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
