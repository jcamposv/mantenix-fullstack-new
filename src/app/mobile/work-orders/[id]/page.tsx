"use client"

import { useParams, useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { WorkOrderHeader } from "@/components/forms/mobile/work-order-complete/work-order-header"
import { WorkOrderActions } from "@/components/forms/mobile/work-order-complete/work-order-actions"
import { WorkOrderCompleteForm } from "@/components/forms/mobile/work-order-complete/work-order-complete-form"
import { WorkOrderReadonlyView } from "@/components/forms/mobile/work-order-complete/work-order-readonly-view"
import { WorkOrderInventoryRequestsMobile } from "@/components/forms/mobile/work-order-inventory-requests"
import { useWorkOrderManagement } from "@/hooks/use-work-order-management"
import type { CustomFieldsConfig } from "@/schemas/work-order-template"

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
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando orden de trabajo...</p>
        </div>
      </div>
    )
  }

  if (error || !workOrder) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-destructive">{error || 'Orden de trabajo no encontrada'}</p>
        </div>
      </div>
    )
  }

  const isCompleted = ['COMPLETED', 'CANCELLED'].includes(workOrder.status)

  return (
    <div className="space-y-4">
      <WorkOrderHeader 
        workOrder={workOrder}
        currentUser={currentUser as unknown as { role: string } | null}
        onBack={() => router.back()}
        onAssetCreated={fetchWorkOrder}
      />

      <Card>
        <CardContent>
          <WorkOrderActions
            status={workOrder.status}
            onStartWork={handleStartWork}
            onToggleForm={() => setShowForm(!showForm)}
            showForm={showForm}
            isUpdating={updating}
          />
        </CardContent>
      </Card>

      {/* Inventory Requests */}
      <WorkOrderInventoryRequestsMobile workOrderId={workOrderId} />

      {/* Custom Fields Form */}
      {showForm && workOrder.template?.customFields && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Formulario de Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkOrderCompleteForm
              customFields={workOrder.template.customFields as { fields: NonNullable<CustomFieldsConfig['fields']> }}
              workOrderId={workOrderId}
              initialValues={initialFormValues}
              onSubmit={handleCompleteWork}
              onCancel={handleCancelWork}
              isSubmitting={updating}
            />
          </CardContent>
        </Card>
      )}

      {/* Read-only view for completed work orders */}
      {isCompleted && (
        <WorkOrderReadonlyView
          customFields={workOrder.template?.customFields as { fields: NonNullable<CustomFieldsConfig['fields']> }}
          workOrderId={workOrderId}
          customFieldValues={workOrder.customFieldValues as Record<string, unknown>}
          completionNotes={workOrder.completionNotes ?? undefined}
        />
      )}
    </div>
  )
}