import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, XCircle, AlertCircle } from "lucide-react"
import type { LowStockAlert } from "@/types/inventory.types"
import { cn } from "@/lib/utils"

interface LowStockAlertsProps {
  alerts: LowStockAlert[]
  className?: string
}

const alertConfig = {
  OUT_OF_STOCK: {
    icon: XCircle,
    label: "Sin Stock",
    badgeClass: "bg-red-100 text-red-700 hover:bg-red-100",
    rowClass: "bg-red-50/50"
  },
  BELOW_MIN: {
    icon: AlertTriangle,
    label: "Crítico",
    badgeClass: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    rowClass: "bg-amber-50/50"
  },
  BELOW_REORDER: {
    icon: AlertCircle,
    label: "Bajo",
    badgeClass: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    rowClass: "bg-yellow-50/50"
  }
}

export function LowStockAlerts({ alerts, className }: LowStockAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card className={cn("shadow-none", className)}>
        <CardHeader>
          <CardTitle className="text-lg">Alertas de Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No hay alertas de stock
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Todos los items tienen stock suficiente
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Alertas de Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((alert, index) => {
            const config = alertConfig[alert.alertType]
            const Icon = config.icon

            return (
              <div
                key={`${alert.inventoryItem.id}-${index}`}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  config.rowClass
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {alert.inventoryItem.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.inventoryItem.code}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {alert.currentStock}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Mín: {alert.inventoryItem.minStock}
                    </p>
                  </div>
                  <Badge variant="outline" className={config.badgeClass}>
                    {config.label}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
