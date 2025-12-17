"use client"

import { useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle, FileText, ChevronDown } from "lucide-react"
import { WorkOrderHeader } from "@/components/forms/mobile/work-order-complete/work-order-header"
import { WorkOrderCompleteForm } from "@/components/forms/mobile/work-order-complete/work-order-complete-form"
import { WorkOrderReadonlyView } from "@/components/forms/mobile/work-order-complete/work-order-readonly-view"
import { WorkOrderInventoryRequestsMobile } from "@/components/forms/mobile/work-order-inventory-requests"
import { TimeTrackerCard, TimeSummaryCard } from "@/components/work-orders/time-tracking"
import { SafetyDocumentsCard } from "@/components/mobile/safety-documents/safety-documents-card"
import { SafetyBriefingDialog } from "@/components/workflow/safety-briefing-dialog"
import { OfflineStatusBanner } from "@/components/mobile/offline-status-banner"
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
    isOffline,
    isStale,
    setShowForm,
    fetchWorkOrder,
    handleStartWork,
    handleCompleteWork,
    handleCancelWork
  } = useWorkOrderManagement(workOrderId)

  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    if (isOffline) return
    setRefreshing(true)
    try {
      await fetchWorkOrder()
    } finally {
      setRefreshing(false)
    }
  }, [fetchWorkOrder, isOffline])

  const [showSafetyBriefing, setShowSafetyBriefing] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const scrollToForm = () => {
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

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
        <Card className="shadow-none border-destructive">
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
      {/* Offline/Stale status banner */}
      <OfflineStatusBanner
        isOffline={isOffline}
        isStale={isStale}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        className="-mx-4 -mt-4 mb-4"
      />

      {/* Header with back navigation and quick info */}
      <WorkOrderHeader
        workOrder={workOrder}
        currentUser={currentUser as unknown as { role: string } | null}
        onBack={() => router.back()}
        onAssetCreated={fetchWorkOrder}
      />

      {/* Progress Indicator - Show only for active work orders */}
      {!isCompleted && (
        <Card className="shadow-none bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
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
            hasCustomFields={hasCustomFields && isInProgress}
            onCompleteClick={scrollToForm}
          />
        </div>
      )}

      {/* Time Summary - Show for COMPLETED status */}
      {isCompleted && (
        <TimeSummaryCard workOrderId={workOrderId} />
      )}

      {/* Safety Documents - ISO Compliance */}
      <SafetyDocumentsCard
        workOrder={workOrder}
        onConfirmClick={() => setShowSafetyBriefing(true)}
        onRefresh={fetchWorkOrder}
      />

      {/* Work Details Section - Always visible during work */}
      {isInProgress && hasCustomFields && (
        <div ref={formRef} className="scroll-mt-4">
          <Card className={cn(
            "shadow-none transition-all",
            showForm ? "ring-2 ring-primary/20 border-primary/30" : "border-border"
          )}>
            <CardHeader
              className={cn(
                "transition-colors",
                !showForm && "cursor-pointer select-none active:bg-accent/50"
              )}
              onClick={() => !showForm && setShowForm(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    showForm ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Formulario de Trabajo
                    </CardTitle>
                    {!showForm && initialFormValues && Object.keys(initialFormValues).length > 0 && (
                      <p className="text-xs text-primary font-medium mt-0.5">
                        Datos guardados - Toca para continuar
                      </p>
                    )}
                    {!showForm && (!initialFormValues || Object.keys(initialFormValues).length === 0) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Toca para completar
                      </p>
                    )}
                  </div>
                </div>
                {!showForm && (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {showForm && workOrder.template?.customFields && (
              <CardContent className="pt-0 space-y-4">
                <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
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
        </div>
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

      {/* Safety Briefing Dialog - ISO 45001 Compliance */}
      <SafetyBriefingDialog
        workOrder={workOrder}
        open={showSafetyBriefing}
        onOpenChange={setShowSafetyBriefing}
        onSuccess={() => {
          fetchWorkOrder() // Refresh work order data
          // SWR will auto-revalidate the safety briefing check
        }}
      />
    </div>
  )
}