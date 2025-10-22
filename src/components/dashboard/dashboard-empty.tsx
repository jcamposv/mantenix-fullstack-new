"use client"

import { BarChart3, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardEmptyProps {
  onCreateWorkOrder?: () => void
  className?: string
}

export function DashboardEmpty({ onCreateWorkOrder, className }: DashboardEmptyProps) {
  return (
    <div className={className}>
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-5 w-5" />
            Sin datos para mostrar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            No hay órdenes de trabajo
          </h3>
          
          <p className="text-muted-foreground mb-6 max-w-sm">
            Crea tu primera orden de trabajo para comenzar a ver estadísticas y métricas en este dashboard.
          </p>
          
          {onCreateWorkOrder && (
            <Button onClick={onCreateWorkOrder} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear primera orden
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}