import { Badge } from "@/components/ui/badge"
import { getRCATypeLabel } from "@/schemas/root-cause-analysis.schema"
import type { RCAType } from "@/types/root-cause-analysis.types"

interface RCATypeBadgeProps {
  analysisType: RCAType
  className?: string
}

export function RCATypeBadge({ analysisType, className }: RCATypeBadgeProps) {
  const label = getRCATypeLabel(analysisType)

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}
