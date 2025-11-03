"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Eye, Clock, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface CriticalOrder {
  id: string
  number: string
  title: string
  priority: "HIGH" | "URGENT"
  status: string
  scheduledDate: Date
  site?: {
    name: string
  }
  daysOverdue?: number
}

interface CriticalOrdersProps {
  orders: CriticalOrder[]
  loading?: boolean
}

export function CriticalOrders({ orders, loading = false }: CriticalOrdersProps) {
  const router = useRouter()

  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Órdenes Críticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card className="shadow-none border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Órdenes Críticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-success/10 mb-3">
              <AlertTriangle className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-semibold text-success mb-1">Sin Órdenes Críticas</h3>
            <p className="text-sm text-muted-foreground">
              Todas las órdenes están dentro de los plazos establecidos
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "destructive"
      case "HIGH": return "default"
      default: return "secondary"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "URGENT": return "Urgente"
      case "HIGH": return "Alta"
      case "MEDIUM": return "Media"
      case "LOW": return "Baja"
      default: return priority
    }
  }

  return (
    <Card className="shadow-none border-2 border-destructive/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Órdenes Críticas
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Requieren atención inmediata
            </p>
          </div>
          <Badge variant="destructive" className="animate-pulse">
            {orders.length} {orders.length === 1 ? 'Orden' : 'Órdenes'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 rounded-lg border-2 border-destructive/10 bg-destructive/5 hover:bg-destructive/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getPriorityColor(order.priority)} className="font-mono">
                    {order.number}
                  </Badge>
                  <Badge variant="outline" className="bg-background">
                    {getPriorityLabel(order.priority)}
                  </Badge>
                  {order.daysOverdue && order.daysOverdue > 0 && (
                    <Badge variant="destructive">
                      <Clock className="h-3 w-3 mr-1" />
                      {order.daysOverdue} {order.daysOverdue === 1 ? 'día' : 'días'} vencida
                    </Badge>
                  )}
                </div>

                <h4 className="font-medium mb-1 truncate">{order.title}</h4>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {order.site && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.site.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Programada: {formatDistanceToNow(order.scheduledDate, {
                      addSuffix: true,
                      locale: es
                    })}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/client/work-orders/${order.id}`)}
                className="ml-4"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </Button>
            </div>
          ))}
        </div>

        {orders.length > 5 && (
          <div className="mt-4 pt-4 border-t text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/client/work-orders/list?filter=critical")}
            >
              Ver Todas las Órdenes Críticas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
