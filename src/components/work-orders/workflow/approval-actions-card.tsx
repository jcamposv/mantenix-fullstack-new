/**
 * Approval Actions Card Component
 *
 * Displays approval/reject buttons for pending work order approvals.
 * Only shows for users with permission to approve.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Type-safe
 * - Under 200 lines
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { ApprovalStatusBadge } from "@/components/workflow/approval-status-badge"

interface Approval {
  id: string
  level: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  comments: string | null
  approvedAt: string | null
  rejectedAt: string | null
  approvedByUser: {
    id: string
    name: string
  } | null
}

interface ApprovalActionsCardProps {
  workOrderId: string
  approvals: Approval[]
  currentUserId: string
  onSuccess?: () => void
}

export function ApprovalActionsCard({
  approvals,
  onSuccess
}: ApprovalActionsCardProps) {
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!approvals || approvals.length === 0) {
    return null
  }

  // Find the current pending approval (lowest level pending)
  const currentPendingApproval = approvals
    .filter((a) => a.status === "PENDING")
    .sort((a, b) => a.level - b.level)[0]

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (!currentPendingApproval) {
      toast.error("No hay aprobaciones pendientes")
      return
    }

    if (action === "REJECT" && !comments.trim()) {
      toast.error("Debe proporcionar comentarios al rechazar")
      return
    }

    setIsSubmitting(true)
    try {
      const endpoint =
        action === "APPROVE"
          ? `/api/work-order-approvals/${currentPendingApproval.id}/approve`
          : `/api/work-order-approvals/${currentPendingApproval.id}/reject`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al procesar la acción")
      }

      toast.success(
        action === "APPROVE"
          ? "Orden de trabajo aprobada exitosamente"
          : "Orden de trabajo rechazada"
      )

      setComments("")
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al procesar")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Cadena de Aprobación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Approval Chain */}
        <div className="space-y-3">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">Nivel {approval.level}</span>
                  <ApprovalStatusBadge status={approval.status} />
                </div>
                {approval.approvedByUser && (
                  <p className="text-xs text-muted-foreground">
                    {approval.approvedByUser.name}
                  </p>
                )}
                {approval.comments && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {approval.comments}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {approval.approvedAt && (
                  <span>
                    {new Date(approval.approvedAt).toLocaleDateString("es-ES")}
                  </span>
                )}
                {approval.rejectedAt && (
                  <span>
                    {new Date(approval.rejectedAt).toLocaleDateString("es-ES")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions for current pending approval */}
        {currentPendingApproval && (
          <div className="space-y-3 pt-3 border-t">
            <div className="space-y-2">
              <Label htmlFor="comments">
                Comentarios {currentPendingApproval ? "(Opcional al aprobar, requerido al rechazar)" : ""}
              </Label>
              <Textarea
                id="comments"
                placeholder="Agregue comentarios sobre su decisión..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleAction("APPROVE")}
                disabled={isSubmitting}
                className="flex-1"
                variant="default"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Aprobar Nivel {currentPendingApproval.level}
              </Button>
              <Button
                onClick={() => handleAction("REJECT")}
                disabled={isSubmitting}
                className="flex-1"
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar
              </Button>
            </div>
          </div>
        )}

        {!currentPendingApproval && (
          <p className="text-sm text-muted-foreground text-center pt-3 border-t">
            Todas las aprobaciones han sido procesadas
          </p>
        )}
      </CardContent>
    </Card>
  )
}
