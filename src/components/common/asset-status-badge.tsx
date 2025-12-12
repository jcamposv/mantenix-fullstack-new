import { Badge } from "@/components/ui/badge"
import { CheckCircle, Wrench, XCircle, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type AssetStatus = "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"

interface StatusConfig {
  variant: "success" | "warning" | "destructive"
  label: string
  icon: LucideIcon
}

const STATUS_CONFIG: Record<AssetStatus, StatusConfig> = {
  OPERATIVO: {
    variant: "success",
    label: "Operativo",
    icon: CheckCircle,
  },
  EN_MANTENIMIENTO: {
    variant: "warning",
    label: "En Mantenimiento",
    icon: Wrench,
  },
  FUERA_DE_SERVICIO: {
    variant: "destructive",
    label: "Fuera de Servicio",
    icon: XCircle,
  },
} as const

interface AssetStatusBadgeProps {
  status: AssetStatus | string
  className?: string
  showIcon?: boolean
}

export function AssetStatusBadge({
  status,
  className,
  showIcon = true
}: AssetStatusBadgeProps) {
  const config = STATUS_CONFIG[status as AssetStatus]

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    )
  }

  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn("gap-1", className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

export const getAssetStatusVariant = (status: string) => {
  return STATUS_CONFIG[status as AssetStatus]?.variant || "outline"
}

export const getAssetStatusLabel = (status: string) => {
  return STATUS_CONFIG[status as AssetStatus]?.label || status
}

export const getAssetStatusIcon = (status: string) => {
  return STATUS_CONFIG[status as AssetStatus]?.icon
}
