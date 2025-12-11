/**
 * Approval Dialog Component
 *
 * Dialog for approving or rejecting work orders with comments.
 * Part of WORKFLOW_GAPS feature.
 *
 * Following Next.js Expert standards:
 * - Client component with form handling
 * - React Hook Form + Zod validation
 * - Type-safe
 * - Under 200 lines
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle2, XCircle } from 'lucide-react'

const approvalSchema = z.object({
  comments: z.string().min(10, 'Los comentarios deben tener al menos 10 caracteres'),
})

type ApprovalFormData = z.infer<typeof approvalSchema>

interface ApprovalDialogProps {
  open: boolean
  onClose: () => void
  approvalId: string
  action: 'approve' | 'reject'
}

export function ApprovalDialog({
  open,
  onClose,
  approvalId,
  action,
}: ApprovalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
  })

  const onSubmit = async (data: ApprovalFormData) => {
    setIsSubmitting(true)

    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject'
      const response = await fetch(`/api/work-order-approvals/${approvalId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: data.comments,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al procesar la aprobación')
      }

      toast.success(
        action === 'approve'
          ? 'Orden de trabajo aprobada exitosamente'
          : 'Orden de trabajo rechazada'
      )

      reset()
      onClose()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al procesar la aprobación'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'approve' ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Aprobar Orden de Trabajo
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Rechazar Orden de Trabajo
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {action === 'approve'
              ? 'Agregue comentarios sobre la aprobación. Esta acción permitirá continuar con la orden de trabajo.'
              : 'Indique el motivo del rechazo. La orden de trabajo no podrá continuar hasta que se corrijan los problemas.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comments">
              {action === 'approve' ? 'Comentarios' : 'Motivo del Rechazo'}
            </Label>
            <Textarea
              id="comments"
              {...register('comments')}
              placeholder={
                action === 'approve'
                  ? 'Agregue cualquier comentario o condición...'
                  : 'Describa por qué se rechaza esta orden de trabajo...'
              }
              rows={4}
            />
            {errors.comments && (
              <p className="text-sm text-destructive">{errors.comments.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={action === 'approve' ? 'default' : 'destructive'}
              disabled={isSubmitting}
              className="gap-2"
            >
              {action === 'approve' ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Aprobar
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
