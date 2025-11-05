"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { approveRequestSchema, type ApproveRequestFormData } from "@/schemas/inventory"
import { Loader2 } from "lucide-react"
import { LocationSelect } from "./location-select"
import { useEffect } from "react"

interface ApproveRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ApproveRequestFormData) => Promise<void>
  defaultQuantity: number
  isLoading?: boolean
}

export function ApproveRequestDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultQuantity,
  isLoading = false
}: ApproveRequestDialogProps) {
  const form = useForm<ApproveRequestFormData>({
    resolver: zodResolver(approveRequestSchema) as Resolver<ApproveRequestFormData>,
    defaultValues: {
      approvedQuantity: defaultQuantity,
      fromLocationId: "",
      fromLocationType: "WAREHOUSE",
      notes: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.setValue('approvedQuantity', defaultQuantity)
    }
  }, [open, defaultQuantity])

  const handleSubmit = async (data: ApproveRequestFormData) => {
    await onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprobar Solicitud</DialogTitle>
          <DialogDescription>
            Aprueba la solicitud y especifica la ubicación de donde se tomará el inventario
          </DialogDescription>
        </DialogHeader>
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

            <LocationSelect
              locationTypeValue={form.watch('fromLocationType')}
              locationIdValue={form.watch('fromLocationId')}
              onLocationTypeChange={(value) => form.setValue('fromLocationType', value)}
              onLocationIdChange={(value) => form.setValue('fromLocationId', value)}
              locationTypeLabel="Tipo de ubicación origen *"
              locationIdLabel="Ubicación origen *"
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
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
