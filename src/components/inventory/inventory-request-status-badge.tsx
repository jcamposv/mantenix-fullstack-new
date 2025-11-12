import { Badge } from "@/components/ui/badge"
import type { InventoryRequestStatus } from "@/types/inventory.types"

interface InventoryRequestStatusBadgeProps {
  status: InventoryRequestStatus
  className?: string
}

const STATUS_CONFIG: Record<
  InventoryRequestStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  PENDING: {
    label: "Pendiente",
    variant: "outline",
    className: "border-amber-500 text-amber-700 bg-amber-50"
  },
  APPROVED: {
    label: "Aprobado",
    variant: "default",
    className: "bg-blue-500 hover:bg-blue-600"
  },
  IN_TRANSIT: {
    label: "En Tránsito",
    variant: "secondary",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-200"
  },
  RECEIVED_AT_DESTINATION: {
    label: "Recibido en Destino",
    variant: "secondary",
    className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
  },
  READY_FOR_PICKUP: {
    label: "Listo para Entrega",
    variant: "secondary",
    className: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
  },
  DELIVERED: {
    label: "Entregado",
    variant: "default",
    className: "bg-green-500 hover:bg-green-600"
  },
  REJECTED: {
    label: "Rechazado",
    variant: "destructive"
  },
  CANCELLED: {
    label: "Cancelado",
    variant: "secondary",
    className: "bg-gray-400 hover:bg-gray-500"
  }
}

export function InventoryRequestStatusBadge({
  status,
  className
}: InventoryRequestStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge
      variant={config.variant}
      className={config.className ? `${config.className} ${className || ''}` : className}
    >
      {config.label}
    </Badge>
  )
}
