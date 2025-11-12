"use client"

import { useParams, useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { WorkOrderHeader } from "@/components/forms/mobile/work-order-complete/work-order-header"
import { WorkOrderCompleteForm } from "@/components/forms/mobile/work-order-complete/work-order-complete-form"
import { WorkOrderReadonlyView } from "@/components/forms/mobile/work-order-complete/work-order-readonly-view"
import { WorkOrderInventoryRequestsMobile } from "@/components/forms/mobile/work-order-inventory-requests"
import { TimeTrackerCard, TimeSummaryCard } from "@/components/work-orders/time-tracking"
import { useWorkOrderManagement } from "@/hooks/use-work-order-management"
import type { CustomFieldsConfig } from "@/schemas/work-order-template"
import { cn } from "@/lib/utils"

export default function MobileWorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const workOrderId = params.id as string
  const currentUser = session?.user

  const {
    workOrder,
    loading,
    error,
    updating,
    showForm,
    initialFormValues,
    setShowForm,
    fetchWorkOrder,
    handleStartWork,
    handleCompleteWork,
    handleCancelWork
  } = useWorkOrderManagement(workOrderId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando orden de trabajo...</p>
        </div>
      </div>
    )
  }

  if (error || !workOrder) {
    return (
      <div className="space-y-4 p-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
              <p className="text-destructive font-medium">{error || 'Orden de trabajo no encontrada'}</p>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="mt-4"
              >
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isCompleted = ['COMPLETED', 'CANCELLED'].includes(workOrder.status)
  const isInProgress = workOrder.status === 'IN_PROGRESS'
  const isAssigned = workOrder.status === 'ASSIGNED'
  const hasCustomFields = !!workOrder.template?.customFields

  // Calculate completion progress
  const getCompletionProgress = () => {
    const steps = {
      started: isInProgress || isCompleted,
      formFilled: isCompleted || (initialFormValues && Object.keys(initialFormValues).length > 0),
      completed: isCompleted
    }
    const completed = Object.values(steps).filter(Boolean).length
    const total = Object.keys(steps).length
    return { completed, total, percentage: (completed / total) * 100 }
  }

  const progress = getCompletionProgress()

  return (
    <div className="space-y-4 pb-6">
      {/* Header with back navigation and quick info */}
      <WorkOrderHeader
        workOrder={workOrder}
        currentUser={currentUser as unknown as { role: string } | null}
        onBack={() => router.back()}
        onAssetCreated={fetchWorkOrder}
      />

      {/* Progress Indicator - Show only for active work orders */}
      {!isCompleted && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Progreso del Trabajo</span>
                <span className="text-sm font-bold text-primary">{progress.completed}/{progress.total}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                <div className={cn("flex items-center gap-1", progress.completed >= 1 && "text-primary font-medium")}>
                  {progress.completed >= 1 ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-current" />
                  )}
                  Iniciado
                </div>
                <div className={cn("flex items-center gap-1", progress.completed >= 2 && "text-primary font-medium")}>
                  {progress.completed >= 2 ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-current" />
                  )}
                  Formulario
                </div>
                <div className={cn("flex items-center gap-1", progress.completed >= 3 && "text-primary font-medium")}>
                  {progress.completed >= 3 ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-current" />
                  )}
                  Completado
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Action Card - Time Tracker with prominent CTA */}
      {(isInProgress || isAssigned) && (
        <div className="space-y-4">
          <TimeTrackerCard
            workOrderId={workOrderId}
            workOrderStatus={workOrder.status}
            onActionComplete={fetchWorkOrder}
            onStartWork={handleStartWork}
            disabled={updating}
          />
        </div>
      )}

      {/* Time Summary - Show for COMPLETED status */}
      {isCompleted && (
        <TimeSummaryCard workOrderId={workOrderId} />
      )}

      {/* Work Details Section - Collapsible when not the primary focus */}
      {isInProgress && hasCustomFields && (
        <Card className={cn(
          "transition-all",
          showForm && "ring-2 ring-primary/20"
        )}>
          <CardHeader
            className="cursor-pointer select-none active:bg-accent/50 transition-colors"
            onClick={() => setShowForm(!showForm)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className={cn(
                  "h-5 w-5",
                  showForm ? "text-primary" : "text-muted-foreground"
                )} />
                <CardTitle className="text-base">
                  Formulario de Trabajo
                  {!showForm && initialFormValues && Object.keys(initialFormValues).length > 0 && (
                    <span className="ml-2 text-xs font-normal text-primary">(En progreso)</span>
                  )}
                </CardTitle>
              </div>
              {showForm ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {showForm && (
            <CardContent className="pt-0">
              <WorkOrderCompleteForm
                customFields={workOrder.template.customFields as { fields: NonNullable<CustomFieldsConfig['fields']> }}
                workOrderId={workOrderId}
                initialValues={initialFormValues}
                onSubmit={handleCompleteWork}
                onCancel={handleCancelWork}
                isSubmitting={updating}
              />
            </CardContent>
          )}
        </Card>
      )}

      {/* Supporting Information Section */}
      <div className="space-y-4">
        {/* Inventory Requests */}
        <WorkOrderInventoryRequestsMobile workOrderId={workOrderId} />

        {/* Read-only view for completed work orders */}
        {isCompleted && workOrder.template?.customFields && (
          <WorkOrderReadonlyView
            customFields={workOrder.template.customFields as { fields: NonNullable<CustomFieldsConfig['fields']> }}
            workOrderId={workOrderId}
            customFieldValues={workOrder.customFieldValues as Record<string, unknown>}
            completionNotes={workOrder.completionNotes ?? undefined}
          />
        )}
      </div>
    </div>
  )
}