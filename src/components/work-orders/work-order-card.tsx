import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Calendar, Building, User, Clock } from "lucide-react"
import { WorkOrderStatusBadge } from "./work-order-status-badge"
import { WorkOrderPriorityBadge } from "./work-order-priority-badge"
import { WorkOrderTypeBadge } from "./work-order-type-badge"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface WorkOrderCardProps {
  workOrder: WorkOrderWithRelations
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  className?: string
}

export function WorkOrderCard({ workOrder, onView, onEdit, className }: WorkOrderCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">{workOrder.number}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {workOrder.title}
            </p>
          </div>
          <div className="flex gap-1">
            <WorkOrderStatusBadge status={workOrder.status} />
            <WorkOrderPriorityBadge priority={workOrder.priority} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <WorkOrderTypeBadge type={workOrder.type} showIcon />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {workOrder.site && (
            <div className="flex items-center">
              <Building className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="truncate">{workOrder.site.name}</span>
            </div>
          )}
          
          {workOrder.scheduledDate && (
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
              <span>{new Date(workOrder.scheduledDate).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <User className="mr-1 h-3 w-3 text-muted-foreground" />
            <span>{workOrder._count?.assignments || workOrder.assignments?.length || 0} asignado(s)</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
            <span>{new Date(workOrder.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(workOrder.id)}
              className="flex-1"
            >
              <Eye className="mr-1 h-3 w-3" />
              Ver
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(workOrder.id)}
              className="flex-1"
            >
              <Edit className="mr-1 h-3 w-3" />
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}