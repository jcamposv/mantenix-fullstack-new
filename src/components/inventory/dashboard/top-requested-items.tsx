"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { InventoryDashboardMetrics } from "@/types/inventory.types"
import { cn } from "@/lib/utils"

interface TopRequestedItemsProps {
  items: InventoryDashboardMetrics['topRequestedItems']
  className?: string
}

export function TopRequestedItems({ items, className }: TopRequestedItemsProps) {
  if (items.length === 0) {
    return (
      <Card className={cn("shadow-none", className)}>
        <CardHeader>
          <CardTitle className="text-lg">Items Más Solicitados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No hay datos de solicitudes en los últimos 30 días
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format data for recharts
  const chartData = items.map(item => ({
    name: item.itemName.length > 20 ? `${item.itemName.substring(0, 20)}...` : item.itemName,
    fullName: item.itemName,
    code: item.itemCode,
    solicitudes: item.requestCount
  }))

  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Items Más Solicitados</CardTitle>
        <p className="text-xs text-muted-foreground">Últimos 30 días</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="name" type="category" className="text-xs" width={150} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Item
                          </span>
                          <span className="font-bold text-sm">
                            {data.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {data.code}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Solicitudes
                          </span>
                          <span className="font-bold">
                            {data.solicitudes}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="solicitudes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
