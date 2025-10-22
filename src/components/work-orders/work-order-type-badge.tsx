import { Badge } from "@/components/ui/badge"
import { Wrench, AlertTriangle, Settings } from "lucide-react"
import { getWorkOrderTypeLabel } from "@/schemas/work-order"
import type { WorkOrderType } from "@/types/work-order.types"

interface WorkOrderTypeBadgeProps {
  type: WorkOrderType
  showIcon?: boolean
  className?: string
}

export function WorkOrderTypeBadge({ type, showIcon = false, className }: WorkOrderTypeBadgeProps) {
  const label = getWorkOrderTypeLabel(type)

  const getIcon = () => {
    switch (type) {
      case 'PREVENTIVO':
        return <Settings className="mr-1 h-3 w-3" />
      case 'CORRECTIVO':
        return <AlertTriangle className="mr-1 h-3 w-3" />
      case 'REPARACION':
        return <Wrench className="mr-1 h-3 w-3" />
      default:
        return null
    }
  }

  const getVariant = () => {
    switch (type) {
      case 'PREVENTIVO':
        return 'default'
      case 'CORRECTIVO':
        return 'secondary'
      case 'REPARACION':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <Badge variant={getVariant() as "default" | "secondary" | "destructive" | "outline"} className={className}>
      {showIcon && getIcon()}
      {label}
    </Badge>
  )
}