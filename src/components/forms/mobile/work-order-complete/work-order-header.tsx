"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { WorkOrderTypeBadge } from "@/components/work-orders/work-order-type-badge"
import { AddAssetForm } from "@/components/mobile/add-asset-form"
import { 
  ArrowLeft, 
  Calendar, 
  Building, 
  User, 
  Clock,
  FileText,
  Settings
} from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

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

  return (
    <>
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        {isSupervisor && workOrder.siteId && !workOrder.assetId && (
          <AddAssetForm 
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{workOrder.number}</CardTitle>
            <div className="flex gap-2">
              <WorkOrderStatusBadge status={workOrder.status} />
              <WorkOrderPriorityBadge priority={workOrder.priority} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{workOrder.title}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <WorkOrderTypeBadge type={workOrder.type} showIcon />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            {workOrder.site && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{workOrder.site.name}</span>
              </div>
            )}
            
            {workOrder.scheduledDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(workOrder.scheduledDate).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{workOrder._count?.assignments || 0} asignado(s)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(workOrder.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {workOrder.description && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Descripción</span>
                </div>
                <p className="text-sm text-muted-foreground">{workOrder.description}</p>
              </div>
            </>
          )}

          {workOrder.asset && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm mb-2">Activo/Máquina</h4>
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium">{workOrder.asset.name}</p>
                  {workOrder.asset.model && (
                    <p className="text-sm text-muted-foreground">
                      {workOrder.asset.manufacturer} - {workOrder.asset.model}
                    </p>
                  )}
                  {workOrder.asset.location && (
                    <p className="text-sm text-muted-foreground">
                      Ubicación: {workOrder.asset.location}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {workOrder.assignments && workOrder.assignments.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm mb-2">Técnicos Asignados</h4>
                <div className="space-y-1">
                  {workOrder.assignments.map((assignment, index) => (
                    <Badge key={index} variant="secondary" className="mr-1">
                      {assignment.user?.name || 'Usuario'}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}