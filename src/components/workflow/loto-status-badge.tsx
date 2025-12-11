import { Badge } from "@/components/ui/badge"
import { getLOTOStatusColor, getLOTOStatusLabel } from "@/schemas/loto-procedure.schema"
import type { LOTOStatus } from "@/types/loto-procedure.types"

interface LOTOStatusBadgeProps {
  status: LOTOStatus
  className?: string
}

export function LOTOStatusBadge({ status, className }: LOTOStatusBadgeProps) {
  const color = getLOTOStatusColor(status)
  const label = getLOTOStatusLabel(status)

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
