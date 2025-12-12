import { Badge } from "@/components/ui/badge"
import { getActionTypeLabel } from "@/schemas/cap-action.schema"
import type { ActionType } from "@/types/cap-action.types"

interface ActionTypeBadgeProps {
  actionType: ActionType
  className?: string
}

export function ActionTypeBadge({ actionType, className }: ActionTypeBadgeProps) {
  const label = getActionTypeLabel(actionType)

  const variant = (() => {
    switch (actionType) {
      case 'CORRECTIVE':
        return 'outline'
      case 'PREVENTIVE':
        return 'secondary'
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
