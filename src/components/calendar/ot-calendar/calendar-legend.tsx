"use client"

import { JSX } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getEventTypeLabel, getEventTypeColor } from "@/schemas/calendar.schema"
import type { CalendarEventType } from "@/types/calendar.types"

/**
 * CalendarLegend Component
 * Displays a legend of all event types with their corresponding colors
 * Helps users understand the calendar color coding
 */
export function CalendarLegend(): JSX.Element {
  const eventTypes: CalendarEventType[] = [
    "PREVENTIVE_SCHEDULE",
    "PREVENTIVE_WO",
    "CORRECTIVE_WO",
    "REPAIR_WO",
    "INSPECTION",
    "PLANNED_SHUTDOWN",
    "METER_BASED_TRIGGER",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Leyenda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {eventTypes.map((type) => {
            const colors = getEventTypeColor(type)
            const label = getEventTypeLabel(type)

            return (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border flex-shrink-0"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                  }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="text-xs font-medium mb-2">Estados de Órdenes:</div>
          <div className="grid grid-cols-2 gap-2">
            <StatusBadge status="DRAFT" label="Borrador" color="#94A3B8" />
            <StatusBadge status="ASSIGNED" label="Asignada" color="#3B82F6" />
            <StatusBadge status="IN_PROGRESS" label="En Progreso" color="#F59E0B" />
            <StatusBadge status="COMPLETED" label="Completada" color="#10B981" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * StatusBadge Component
 * Small helper component for status legend
 */
function StatusBadge({
  status,
  label,
  color,
}: {
  status: string
  label: string
  color: string
}): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
