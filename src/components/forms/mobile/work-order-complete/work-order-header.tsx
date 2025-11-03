"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { WorkOrderTypeBadge } from "@/components/work-orders/work-order-type-badge"
import { AddAssetModal } from "@/components/forms/mobile/add-asset-modal"
import { UserAvatar } from "@/components/common/user-avatar"
import {
  ArrowLeft,
  Calendar,
  Building,
  Clock,
  Settings,
  Wrench,
  MapPin,
  Users
} from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import { cn } from "@/lib/utils"

interface WorkOrderHeaderProps {
  workOrder: WorkOrderWithRelations
  currentUser: { role: string } | null
  onBack: () => void
  onAssetCreated: () => void
}

export function WorkOrderHeader({
  workOrder,
  currentUser,
  onBack,
  onAssetCreated
}: WorkOrderHeaderProps) {
  const isSupervisor = currentUser?.role === 'SUPERVISOR'

  // Calcular días restantes
  const getDaysRemaining = () => {
    if (!workOrder.scheduledDate) return null
    const today = new Date()
    const scheduled = new Date(workOrder.scheduledDate)
    const diffTime = scheduled.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div className="space-y-3">
      {/* Navegación compacta */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        {isSupervisor && workOrder.siteId && !workOrder.assetId && (
          <AddAssetModal
            siteId={workOrder.siteId}
            onAssetCreated={onAssetCreated}
            trigger={
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Agregar Máquina
              </Button>
            }
          />
        )}
      </div>

      {/* Header principal compacto */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4 space-y-3">
          {/* Título y número */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                {workOrder.number}
              </span>
              <div className="flex items-center gap-1.5">
                <WorkOrderStatusBadge status={workOrder.status} />
                <WorkOrderPriorityBadge priority={workOrder.priority} />
              </div>
            </div>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              {workOrder.title}
            </h1>
          </div>

          {/* Tipo de trabajo */}
          <div className="flex items-center gap-2">
            <WorkOrderTypeBadge type={workOrder.type} showIcon />
          </div>

          {/* Grid de info crítica - 2 columnas */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            {/* Sede */}
            {workOrder.site && (
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Sede</p>
                  <p className="text-sm font-medium truncate">{workOrder.site.name}</p>
                </div>
              </div>
            )}

            {/* Fecha programada con indicador de urgencia */}
            {workOrder.scheduledDate ? (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Programada</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium">
                      {new Date(workOrder.scheduledDate).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </p>
                    {daysRemaining !== null && (
                      <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded-full",
                        daysRemaining < 0 ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                        daysRemaining === 0 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" :
                        daysRemaining === 1 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" :
                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d vencido` :
                         daysRemaining === 0 ? 'Hoy' :
                         daysRemaining === 1 ? 'Mañana' :
                         `${daysRemaining}d`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Creada</p>
                  <p className="text-sm font-medium">
                    {new Date(workOrder.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Técnicos asignados */}
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Técnicos</p>
                <p className="text-sm font-medium">
                  {workOrder._count?.assignments || 0} asignado{workOrder._count?.assignments !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Activo/Máquina */}
            {workOrder.asset && (
              <div className="flex items-start gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Activo</p>
                  <p className="text-sm font-medium truncate">{workOrder.asset.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Descripción (si existe) - collapsible */}
          {workOrder.description && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Descripción</p>
              <p className="text-sm text-foreground line-clamp-2 leading-snug">
                {workOrder.description}
              </p>
            </div>
          )}

          {/* Activo detallado (solo si existe y tiene info adicional) */}
          {workOrder.asset && (workOrder.asset.model || workOrder.asset.location) && (
            <div className="pt-2 border-t">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Detalles del Activo</span>
                </div>
                <p className="text-sm font-medium">{workOrder.asset.name}</p>
                {workOrder.asset.model && (
                  <p className="text-xs text-muted-foreground">
                    {workOrder.asset.manufacturer} - {workOrder.asset.model}
                  </p>
                )}
                {workOrder.asset.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {workOrder.asset.location}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Técnicos asignados (lista detallada) */}
          {workOrder.assignments && workOrder.assignments.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">Equipo Asignado</p>
              <div className="space-y-2">
                {workOrder.assignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-2">
                    <UserAvatar
                      name={assignment.user?.name || "Usuario"}
                      image={assignment.user?.image}
                      size="xs"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {assignment.user?.name || 'Usuario'}
                      </p>
                    </div>
                  </div>
                ))}
                {workOrder.assignments.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{workOrder.assignments.length - 3} más
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
