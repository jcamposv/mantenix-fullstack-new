/**
 * Work Order Workflow Section Component
 *
 * Main component that composes all workflow cards.
 * Displays approval chain, permits, LOTO, JSA, and RCA.
 *
 * Following Next.js Expert standards:
 * - Component Composition: Delegates to specialized cards
 * - Single Responsibility: Only orchestrates workflow cards
 * - Type-safe with explicit interfaces
 * - Under 200 lines
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'
import { ApprovalActionsCard } from './approval-actions-card'
import { QASignOffCard } from './qa-signoff-card'
import { WorkPermitsCard } from './work-permits-card'
import { LOTOProceduresCard } from './loto-procedures-card'
import { JSACard } from './jsa-card'
import { RCACard } from './rca-card'
import { SafetyDocSuggestions } from './safety-doc-suggestions'
import { DigitalSignatureCard } from './digital-signature-card'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import type { WorkOrderStatus as PrismaWorkOrderStatus } from '@prisma/client'
import type { WorkOrderWithRelations } from '@/types/work-order.types'
import type { PermitStatus, PermitType } from '@/types/work-permit.types'
import type { LOTOStatus } from '@/types/loto-procedure.types'
import type { JSAStatus } from '@/types/job-safety-analysis.types'
import type { RCAStatus, RCAType } from '@/types/root-cause-analysis.types'

interface WorkflowSectionProps {
  workOrder: WorkOrderWithRelations
}

function EmptyWorkflowState() {
  return (
    <Card className="shadow-none border-dashed">
      <CardContent className="py-12 text-center">
        <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-sm font-medium text-muted-foreground">
          No hay documentos de workflow vinculados
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Use las Acciones Rápidas para crear documentos de seguridad o calidad
        </p>
      </CardContent>
    </Card>
  )
}

export function WorkflowSection({ workOrder }: WorkflowSectionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const hasApprovals = workOrder.approvals && workOrder.approvals.length > 0
  const hasWorkPermits = workOrder.workPermits && workOrder.workPermits.length > 0
  const hasLOTO = workOrder.lotoProcedures && workOrder.lotoProcedures.length > 0
  const hasJSA = workOrder.jobSafetyAnalyses && workOrder.jobSafetyAnalyses.length > 0
  const hasRCA = workOrder.rootCauseAnalyses && workOrder.rootCauseAnalyses.length > 0

  const hasAnyWorkflow = hasApprovals || hasWorkPermits || hasLOTO || hasJSA || hasRCA

  // Show suggestions for active work orders, OR completed corrective work without RCA
  const needsRCA = workOrder.type === "CORRECTIVO" && workOrder.status === "COMPLETED" && !hasRCA
  const canShowSuggestions = (workOrder.status !== "COMPLETED" && workOrder.status !== "CANCELLED") || needsRCA

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* QA Sign-off - highest priority, shown at top */}
      {(workOrder.status as PrismaWorkOrderStatus) === "PENDING_QA" && (
        <QASignOffCard workOrder={workOrder} onSuccess={handleSuccess} />
      )}

      {/* Safety Document Suggestions - shown for active work orders */}
      {canShowSuggestions && <SafetyDocSuggestions workOrder={workOrder} />}

      {/* Existing workflow documents */}
      {hasApprovals && session?.user?.id && (
        <ApprovalActionsCard
          workOrderId={workOrder.id}
          approvals={workOrder.approvals!}
          currentUserId={session.user.id}
          onSuccess={handleSuccess}
        />
      )}
      {hasWorkPermits && (
        <WorkPermitsCard
          permits={workOrder.workPermits!.map((p) => ({
            ...p,
            permitType: p.permitType as PermitType,
            status: p.status as PermitStatus,
          }))}
        />
      )}
      {hasLOTO && (
        <LOTOProceduresCard
          procedures={workOrder.lotoProcedures!.map((p) => ({
            ...p,
            status: p.status as LOTOStatus,
          }))}
        />
      )}
      {hasJSA && (
        <JSACard
          analyses={workOrder.jobSafetyAnalyses!.map((a) => ({
            ...a,
            status: a.status as JSAStatus,
          }))}
        />
      )}
      {hasRCA && (
        <RCACard
          analyses={workOrder.rootCauseAnalyses!.map((a) => ({
            ...a,
            analysisType: a.analysisType as RCAType,
            status: a.status as RCAStatus,
          }))}
        />
      )}

      {/* Digital Signatures - ISO compliance audit trail */}
      <DigitalSignatureCard workOrderId={workOrder.id} />

      {/* Empty state if no workflow documents and no suggestions */}
      {!hasAnyWorkflow && !canShowSuggestions && <EmptyWorkflowState />}
    </div>
  )
}
