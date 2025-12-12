import { Badge } from "@/components/ui/badge"
import { getRCAStatusColor, getRCAStatusLabel } from "@/schemas/root-cause-analysis.schema"
import type { RCAStatus } from "@/types/root-cause-analysis.types"

interface RCAStatusBadgeProps {
  status: RCAStatus
  className?: string
}

export function RCAStatusBadge({ status, className }: RCAStatusBadgeProps) {
  const color = getRCAStatusColor(status)
  const label = getRCAStatusLabel(status)

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
