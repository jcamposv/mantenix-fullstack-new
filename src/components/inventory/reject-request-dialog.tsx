"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { rejectRequestSchema, type RejectRequestFormData } from "@/schemas/inventory"
import { Loader2 } from "lucide-react"

interface RejectRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RejectRequestFormData) => Promise<void>
  isLoading?: boolean
}

export function RejectRequestDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false
}: RejectRequestDialogProps) {
  const form = useForm<RejectRequestFormData>({
    resolver: zodResolver(rejectRequestSchema) as Resolver<RejectRequestFormData>,
    defaultValues: {
      notes: "",
    },
  })

  const handleSubmit = async (data: RejectRequestFormData) => {
    await onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar Solicitud</DialogTitle>
          <DialogDescription>
            Proporciona un motivo para el rechazo de la solicitud
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del Rechazo *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      {...field}
                      placeholder="Explica por qué se rechaza esta solicitud..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Rechazar Solicitud
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
