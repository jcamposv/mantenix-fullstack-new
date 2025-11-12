import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Package, User, Clock } from "lucide-react"
import type { InventoryDashboardMetrics } from "@/types/inventory.types"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface RecentActivityProps {
  activities: InventoryDashboardMetrics['recentActivity']
  className?: string
}

const activityConfig = {
  REQUEST_CREATED: {
    icon: Clock,
    color: "text-blue-600 bg-blue-50"
  },
  REQUEST_APPROVED: {
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50"
  },
  REQUEST_REJECTED: {
    icon: XCircle,
    color: "text-red-600 bg-red-50"
  },
  WAREHOUSE_DELIVERED: {
    icon: Package,
    color: "text-purple-600 bg-purple-50"
  },
  TECHNICIAN_RECEIVED: {
    icon: User,
    color: "text-green-600 bg-green-50"
  },
  STOCK_IN: {
    icon: Package,
    color: "text-blue-600 bg-blue-50"
  },
  STOCK_OUT: {
    icon: Package,
    color: "text-amber-600 bg-amber-50"
  }
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Hace un momento'
  if (diffMins < 60) return `Hace ${diffMins} min`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`

  const diffDays = Math.floor(diffHours / 24)
  return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-3">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No hay actividad reciente
              </p>
            </div>
          ) : (
            activities.map((activity) => {
              const config = activityConfig[activity.type]
              const Icon = config.icon

              return (
                <div key={activity.id} className="flex gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
                    config.color
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {activity.request ? (
                      <Link
                        href={`/admin/inventory/requests/${activity.request.id}`}
                        className="text-sm hover:underline"
                      >
                        {activity.description}
                      </Link>
                    ) : (
                      <p className="text-sm">{activity.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
