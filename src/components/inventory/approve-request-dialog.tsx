"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle, MapPin, Warehouse, Truck, Building2 } from "lucide-react"
import { useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Simplified schema - location selection is now automatic
const approveRequestSchema = z.object({
  approvedQuantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  notes: z.string().optional(),
})

type ApproveRequestFormData = z.infer<typeof approveRequestSchema>

interface ApproveRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ApproveRequestFormData) => Promise<void>
  defaultQuantity: number
  sourceLocationName?: string
  sourceLocationType?: string
  destinationLocationName?: string
  destinationLocationType?: string
  isLoading?: boolean
}

export function ApproveRequestDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultQuantity,
  sourceLocationName,
  sourceLocationType,
  destinationLocationName,
  destinationLocationType,
  isLoading = false
}: ApproveRequestDialogProps) {
  const form = useForm<ApproveRequestFormData>({
    resolver: zodResolver(approveRequestSchema),
    defaultValues: {
      approvedQuantity: defaultQuantity,
      notes: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.setValue('approvedQuantity', defaultQuantity)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultQuantity])

  const handleSubmit = async (data: ApproveRequestFormData) => {
    await onSubmit(data)
    form.reset()
  }

  const getLocationIcon = () => {
    switch (sourceLocationType) {
      case "WAREHOUSE":
        return <Warehouse className="h-4 w-4 text-blue-600" />
      case "VEHICLE":
        return <Truck className="h-4 w-4 text-orange-600" />
      case "SITE":
        return <Building2 className="h-4 w-4 text-green-600" />
      default:
        return <MapPin className="h-4 w-4 text-gray-600" />
    }
  }

  const getLocationTypeLabel = () => {
    switch (sourceLocationType) {
      case "WAREHOUSE":
        return "Bodega"
      case "VEHICLE":
        return "Vehículo"
      case "SITE":
        return "Sede"
      default:
        return "Ubicación"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprobar Solicitud</DialogTitle>
          <DialogDescription>
            Revisa el origen y destino de la transferencia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Source Location */}
          {sourceLocationName ? (
            <Alert className="border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                {getLocationIcon()}
                <div className="flex-1">
                  <div className="font-medium text-sm text-blue-900">
                    Origen (Desde)
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    {sourceLocationName}
                  </div>
                  <div className="text-xs text-blue-600 mt-0.5">
                    {getLocationTypeLabel()}
                  </div>
                </div>
              </div>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Origen:</strong> Se seleccionará automáticamente la ubicación con más stock disponible
              </AlertDescription>
            </Alert>
          )}

          {/* Destination Location */}
          {destinationLocationName && (
            <Alert className="border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                {destinationLocationType === 'WAREHOUSE' && <Warehouse className="h-4 w-4 text-green-600" />}
                {destinationLocationType === 'SITE' && <Building2 className="h-4 w-4 text-green-600" />}
                {destinationLocationType === 'VEHICLE' && <Truck className="h-4 w-4 text-green-600" />}
                {!destinationLocationType && <MapPin className="h-4 w-4 text-green-600" />}
                <div className="flex-1">
                  <div className="font-medium text-sm text-green-900">
                    Destino (Hacia)
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    {destinationLocationName}
                  </div>
                  <div className="text-xs text-green-600 mt-0.5">
                    {destinationLocationType === 'WAREHOUSE' && 'Bodega'}
                    {destinationLocationType === 'SITE' && 'Sede'}
                    {destinationLocationType === 'VEHICLE' && 'Vehículo'}
                  </div>
                </div>
              </div>
            </Alert>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="approvedQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad Aprobada *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Comentarios adicionales..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aprobar Solicitud
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
