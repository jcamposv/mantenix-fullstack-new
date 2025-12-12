/**
 * Dismiss Alert Dialog Component
 *
 * Modal dialog for dismissing maintenance alerts with required reason.
 * Following project patterns (similar to RejectRequestDialog).
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

const dismissAlertSchema = z.object({
  reason: z.string().min(10, 'La razón debe tener al menos 10 caracteres'),
})

type DismissAlertFormData = z.infer<typeof dismissAlertSchema>

interface DismissAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: DismissAlertFormData) => Promise<void>
  isLoading?: boolean
  alertMessage?: string
}

export function DismissAlertDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  alertMessage,
}: DismissAlertDialogProps) {
  const form = useForm<DismissAlertFormData>({
    resolver: zodResolver(dismissAlertSchema) as Resolver<DismissAlertFormData>,
    defaultValues: {
      reason: '',
    },
  })

  const handleSubmit = async (data: DismissAlertFormData) => {
    await onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dismissar Alerta</DialogTitle>
          <DialogDescription>
            Proporciona una razón para dismissar esta alerta. Este registro quedará en el
            histórico.
          </DialogDescription>
        </DialogHeader>

        {alertMessage && (
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-sm">{alertMessage}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón del Dismissal *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      {...field}
                      placeholder="Ej: Falso positivo - componente ya fue reemplazado fuera del sistema"
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
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Dismissar Alerta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
