import { Badge } from "@/components/ui/badge"
import { getPermitTypeLabel } from "@/schemas/work-permit.schema"
import type { PermitType } from "@/types/work-permit.types"

interface PermitTypeBadgeProps {
  permitType: PermitType
  className?: string
}

export function PermitTypeBadge({ permitType, className }: PermitTypeBadgeProps) {
  const label = getPermitTypeLabel(permitType)

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
