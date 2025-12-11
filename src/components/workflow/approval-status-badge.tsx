import { Badge } from "@/components/ui/badge"
import { getApprovalStatusColor, getApprovalStatusLabel } from "@/schemas/work-order-approval.schema"
import type { ApprovalStatus } from "@/types/work-order-approval.types"

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus
  className?: string
}

export function ApprovalStatusBadge({ status, className }: ApprovalStatusBadgeProps) {
  const color = getApprovalStatusColor(status)
  const label = getApprovalStatusLabel(status)

  const variant = (() => {
    switch (color) {
      case 'green':
        return 'default'
      case 'yellow':
        return 'outline'
      case 'red':
        return 'destructive'
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
