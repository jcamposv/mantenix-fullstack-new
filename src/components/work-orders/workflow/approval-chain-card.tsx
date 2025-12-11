/**
 * Approval Chain Card Component
 *
 * Displays the approval chain for a work order.
 * Shows approval levels, status, approvers, and comments.
 *
 * Following Next.js Expert standards:
 * - Single Responsibility: Only displays approval chain
 * - Type-safe with explicit interfaces
 * - Client component for interactivity
 * - Under 200 lines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Clock } from 'lucide-react'
import { ApprovalStatusBadge } from '@/components/workflow/approval-status-badge'

interface Approval {
  id: string
  requiredLevel: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  comments: string | null
  decidedAt: string | null
  approver: {
    id: string
    name: string
    email: string
  } | null
  createdAt: string
}

interface ApprovalChainCardProps {
  approvals: Approval[]
}

export function ApprovalChainCard({ approvals }: ApprovalChainCardProps) {
  if (!approvals || approvals.length === 0) {
    return null
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Cadena de Aprobación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  Nivel {approval.requiredLevel}
                </span>
                <ApprovalStatusBadge status={approval.status} />
              </div>
              {approval.approver && (
                <p className="text-xs text-muted-foreground">
                  {approval.approver.name}
                </p>
              )}
              {approval.comments && (
                <p className="text-xs text-muted-foreground mt-1">
                  {approval.comments}
                </p>
              )}
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {approval.decidedAt ? (
                <span>
                  {new Date(approval.decidedAt).toLocaleDateString('es-ES')}
                </span>
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
