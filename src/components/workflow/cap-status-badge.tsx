import { Badge } from "@/components/ui/badge"
import { getCAPStatusColor, getCAPStatusLabel } from "@/schemas/cap-action.schema"
import type { CAPStatus } from "@/types/cap-action.types"

interface CAPStatusBadgeProps {
  status: CAPStatus
  className?: string
}

export function CAPStatusBadge({ status, className }: CAPStatusBadgeProps) {
  const color = getCAPStatusColor(status)
  const label = getCAPStatusLabel(status)

  const variant = (() => {
    switch (color) {
      case 'green':
        return 'default'
      case 'yellow':
        return 'outline'
      case 'red':
        return 'destructive'
      case 'blue':
        return 'secondary'
      case 'orange':
        return 'outline'
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
