import { Badge } from "@/components/ui/badge"
import { getPermitStatusColor, getPermitStatusLabel } from "@/schemas/work-permit.schema"
import type { PermitStatus } from "@/types/work-permit.types"

interface PermitStatusBadgeProps {
  status: PermitStatus
  className?: string
}

export function PermitStatusBadge({ status, className }: PermitStatusBadgeProps) {
  const color = getPermitStatusColor(status)
  const label = getPermitStatusLabel(status)

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
