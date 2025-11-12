/**
 * Complete Work Dialog Component
 *
 * Dialog for adding completion notes before completing work
 */

"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CompleteWorkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (notes?: string) => void
  isLoading?: boolean
}

export function CompleteWorkDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: CompleteWorkDialogProps) {
  const [notes, setNotes] = useState("")

  const handleConfirm = () => {
    onConfirm(notes || undefined)
    // Reset form
    setNotes("")
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset form
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Completar Trabajo</DialogTitle>
          <DialogDescription>
            Agrega notas finales sobre el trabajo realizado (opcional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="completion-notes">Notas de Completación</Label>
            <Textarea
              id="completion-notes"
              placeholder="Describe el trabajo realizado, resultados, observaciones..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {notes.length}/500
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">¿Estás seguro?</p>
            <p className="text-muted-foreground text-xs">
              Al completar el trabajo, se finalizará el tracking de tiempo y no
              podrás reanudar esta sesión.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Completando..." : "Completar Trabajo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
