import { Badge } from "@/components/ui/badge"
import { getJSAStatusColor, getJSAStatusLabel } from "@/schemas/job-safety-analysis.schema"
import type { JSAStatus } from "@/types/job-safety-analysis.types"

interface JSAStatusBadgeProps {
  status: JSAStatus
  className?: string
}

export function JSAStatusBadge({ status, className }: JSAStatusBadgeProps) {
  const color = getJSAStatusColor(status)
  const label = getJSAStatusLabel(status)

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
