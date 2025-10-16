import { Badge } from "@/components/ui/badge"
import { getWorkOrderStatusColor, getWorkOrderStatusLabel } from "@/schemas/work-order"
import type { WorkOrderStatus } from "@/types/work-order.types"

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatus
  className?: string
}

export function WorkOrderStatusBadge({ status, className }: WorkOrderStatusBadgeProps) {
  const color = getWorkOrderStatusColor(status)
  const label = getWorkOrderStatusLabel(status)

  const variant = (() => {
    switch (color) {
      case 'green':
        return 'default'
      case 'blue':
        return 'secondary'
      case 'yellow':
        return 'outline'
      case 'red':
        return 'destructive'
      case 'gray':
      default:
        return 'secondary'
    }
  })() as "default" | "secondary" | "destructive" | "outline"

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}