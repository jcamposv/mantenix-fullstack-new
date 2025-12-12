import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

interface StockBadgeProps {
  currentStock: number
  minStock: number
  reorderPoint: number
  className?: string
  showIcon?: boolean
}

export function StockBadge({
  currentStock,
  minStock,
  reorderPoint,
  className,
  showIcon = true
}: StockBadgeProps) {
  const getStockStatus = () => {
    if (currentStock === 0) {
      return {
        label: "Sin stock",
        variant: "destructive" as const,
        icon: XCircle,
        className: "bg-red-500 text-white"
      }
    }
    if (currentStock < minStock) {
      return {
        label: "Stock crítico",
        variant: "destructive" as const,
        icon: AlertTriangle,
        className: "bg-red-500 text-white"
      }
    }
    if (currentStock < reorderPoint) {
      return {
        label: "Stock bajo",
        variant: "default" as const,
        icon: AlertTriangle,
        className: "bg-yellow-500 text-white"
      }
    }
    return {
      label: "Stock normal",
      variant: "default" as const,
      icon: CheckCircle2,
      className: "bg-green-500 text-white"
    }
  }

  const status = getStockStatus()
  const Icon = status.icon

  return (
    <Badge
      variant={status.variant}
      className={cn(status.className, className)}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {status.label}
      <span className="ml-1 font-semibold">({currentStock})</span>
    </Badge>
  )
}
