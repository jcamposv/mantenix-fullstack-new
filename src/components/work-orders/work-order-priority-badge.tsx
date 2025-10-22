import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { getWorkOrderPriorityColor, getWorkOrderPriorityLabel } from "@/schemas/work-order"
import type { WorkOrderPriority } from "@/types/work-order.types"

interface WorkOrderPriorityBadgeProps {
  priority: WorkOrderPriority
  showIcon?: boolean
  className?: string
}

export function WorkOrderPriorityBadge({ priority, showIcon = false, className }: WorkOrderPriorityBadgeProps) {
  const color = getWorkOrderPriorityColor(priority)
  const label = getWorkOrderPriorityLabel(priority)

  const variant = (() => {
    switch (color) {
      case 'red':
        return 'destructive'
      case 'orange':
        return 'default'
      case 'blue':
        return 'secondary'
      case 'gray':
      default:
        return 'outline'
    }
  })() as "default" | "secondary" | "destructive" | "outline"

  return (
    <Badge variant={variant} className={className}>
      {showIcon && priority === 'URGENT' && (
        <AlertCircle className="mr-1 h-3 w-3" />
      )}
      {label}
    </Badge>
  )
}