"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Wrench, Users, Clock, DollarSign, FileText, Shield, RefreshCw } from "lucide-react"
import { UserAvatar } from "@/components/common/user-avatar"
import { TechnicianDetailModal } from "./technician-detail-modal"
import { WorkOrderStatusBadge } from "./work-order-status-badge"
import { WorkOrderPriorityBadge } from "./work-order-priority-badge"
import { WorkOrderTypeBadge } from "./work-order-type-badge"
import { AssetStatusBadge } from "@/components/common/asset-status-badge"
import { ChangeAssetStatusDialog } from "@/components/common/change-asset-status-dialog"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import type { WorkOrderWithRelations, WorkOrderAssignmentWithUser } from "@/types/work-order.types"
import type { ChangeAssetStatusData } from "@/schemas/asset-status"

type AssetStatus = "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"

interface WorkOrderConsolidatedInfoProps {
  workOrder: WorkOrderWithRelations
}

export function WorkOrderConsolidatedInfo({ workOrder }: WorkOrderConsolidatedInfoProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<WorkOrderAssignmentWithUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [changeStatusDialogOpen, setChangeStatusDialogOpen] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [currentAssetStatus, setCurrentAssetStatus] = useState<AssetStatus | undefined>(workOrder.asset?.status as AssetStatus | undefined)
  const { data: session } = useSession()

  // Check if user can change asset status
  const userRole = (session?.user as { role?: string })?.role
  const canChangeStatus = Boolean(userRole && [
    "OPERARIO",
    "TECNICO",
    "SUPERVISOR",
    "JEFE_MANTENIMIENTO",
    "ADMIN_EMPRESA",
    "ADMIN_GRUPO",
    "SUPER_ADMIN"
  ].includes(userRole))

  const handleTechnicianClick = (assignment: WorkOrderAssignmentWithUser) => {
    setSelectedAssignment(assignment)
    setModalOpen(true)
  }

  const handleChangeStatus = async (data: ChangeAssetStatusData) => {
    if (!workOrder.asset) return

    try {
      setIsChangingStatus(true)
      const response = await fetch('/api/assets/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Estado del activo actualizado exitosamente')
        setChangeStatusDialogOpen(false)
        // Update local state
        setCurrentAssetStatus(data.status)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al cambiar el estado del activo')
      }
    } catch (error) {
      console.error('Error changing asset status:', error)
      toast.error('Error al cambiar el estado del activo')
    } finally {
      setIsChangingStatus(false)
    }
  }

  const hasInstructions = workOrder.instructions || workOrder.safetyNotes

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Información General</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</span>
              <WorkOrderStatusBadge status={workOrder.status} />
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prioridad</span>
              <WorkOrderPriorityBadge priority={workOrder.priority} showIcon />
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</span>
              <WorkOrderTypeBadge type={workOrder.type} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Main 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1: Details */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detalles</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descripción</label>
                <p className="text-sm mt-1">
                  {workOrder.description || "Sin descripción"}
                </p>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background">
                  <Building className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sede</p>
                  <p className="text-sm font-medium mt-0.5">
                    {workOrder.site?.name || "N/A"}
                  </p>
                </div>
              </div>

              {workOrder.asset && (
                <div className="pt-2 border-t space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Activo</p>
                      <p className="text-sm font-medium mt-0.5">
                        {workOrder.asset.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {workOrder.asset.code}
                      </p>
                      {currentAssetStatus && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Estado</p>
                          <AssetStatusBadge status={currentAssetStatus} />
                        </div>
                      )}
                    </div>
                  </div>
                  {canChangeStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChangeStatusDialogOpen(true)}
                      className="w-full"
                    >
                      <RefreshCw className="mr-2 h-3.5 w-3.5" />
                      Cambiar Estado
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Schedule & Estimations */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Programación</h3>

            <div className="space-y-3">
              {workOrder.scheduledDate ? (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha Programada</p>
                    <p className="text-sm font-medium mt-0.5">
                      {new Date(workOrder.scheduledDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Sin programación</div>
              )}

              {workOrder.estimatedDuration && (
                <div className="flex items-start gap-3 pt-2 border-t">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duración Estimada</p>
                    <p className="text-sm font-medium mt-0.5">
                      {workOrder.estimatedDuration} {workOrder.estimatedDuration === 1 ? 'hora' : 'horas'}
                    </p>
                  </div>
                </div>
              )}

              {workOrder.estimatedCost && (
                <div className="flex items-start gap-3 pt-2 border-t">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Costo Estimado</p>
                    <p className="text-sm font-medium mt-0.5">
                      ${workOrder.estimatedCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Technicians */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Técnicos {workOrder.assignments && workOrder.assignments.length > 0 && `(${workOrder.assignments.length})`}
              </h3>
            </div>
            {workOrder.assignments && workOrder.assignments.length > 0 ? (
              <div className="space-y-2">
                {workOrder.assignments.map((assignment) => (
                  <button
                    key={assignment.id}
                    onClick={() => handleTechnicianClick(assignment)}
                    className="w-full flex items-center gap-3 bg-background hover:bg-accent rounded-lg p-3 transition-colors text-left border"
                  >
                    <UserAvatar
                      name={assignment.user?.name || "Usuario"}
                      image={assignment.user?.image}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {assignment.user?.name || "Usuario"}
                      </p>
                      {assignment.user?.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {assignment.user.email}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Sin técnicos asignados</div>
            )}
          </div>
        </div>

        {/* Instructions & Safety - Full Width Below */}
        {hasInstructions && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workOrder.instructions && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instrucciones</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {workOrder.instructions}
                  </p>
                </div>
              </div>
            )}

            {workOrder.safetyNotes && (
              <div className="space-y-3 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900/30">
                    <Shield className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  </div>
                  <h3 className="text-xs font-semibold text-amber-900 dark:text-amber-400 uppercase tracking-wider">Seguridad</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                    {workOrder.safetyNotes}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Technician Detail Modal */}
      <TechnicianDetailModal
        assignment={selectedAssignment}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Change Asset Status Dialog */}
      {workOrder.asset && (
        <ChangeAssetStatusDialog
          open={changeStatusDialogOpen}
          onOpenChange={setChangeStatusDialogOpen}
          onSubmit={handleChangeStatus}
          assetId={workOrder.asset.id}
          assetName={workOrder.asset.name}
          currentStatus={currentAssetStatus || "OPERATIVO"}
          isLoading={isChangingStatus}
        />
      )}
    </Card>
  )
}
