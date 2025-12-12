"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import type { AttendanceRecordBasic } from "@/types/attendance.types"

interface AttendanceReportsTableProps {
  records: AttendanceRecordBasic[]
}

const getStatusConfig = (status: string | null) => {
  switch (status) {
    case "ON_TIME":
      return { label: "A Tiempo", className: "bg-success/10 text-success border-success/20" }
    case "LATE":
      return { label: "Tarde", className: "bg-warning/10 text-warning border-warning/20" }
    case "ABSENT":
      return { label: "Ausente", className: "bg-destructive/10 text-destructive border-destructive/20" }
    case "JUSTIFIED":
      return { label: "Justificado", className: "bg-info/10 text-info border-info/20" }
    case "EARLY_DEPARTURE":
      return { label: "Salida Temprana", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" }
    default:
      return { label: "Sin registro", className: "" }
  }
}

export const AttendanceReportsTable = ({ records }: AttendanceReportsTableProps) => {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Detalle de Registros</CardTitle>
        <CardDescription>
          Registros diarios del mes seleccionado
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros de asistencia para este mes</p>
            </div>
          ) : (
            records.map((record) => {
              const statusConfig = getStatusConfig(record.status)
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">
                        {new Date(record.checkInAt).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <Badge variant="outline" className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {new Date(record.checkInAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {record.checkOutAt && (
                        <>
                          <span>→</span>
                          <span>
                            {new Date(record.checkOutAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </>
                      )}
                      {record.lateMinutes && record.lateMinutes > 0 && (
                        <span className="text-warning font-medium">
                          {(() => {
                            const hours = Math.floor(record.lateMinutes / 60)
                            const minutes = record.lateMinutes % 60
                            if (hours > 0) {
                              return `+${hours}h ${minutes}m tarde`
                            }
                            return `+${minutes}m tarde`
                          })()}
                        </span>
                      )}
                      {record.earlyDepartureMinutes && record.earlyDepartureMinutes > 0 && (
                        <span className="text-orange-500 font-medium">
                          {(() => {
                            const hours = Math.floor(record.earlyDepartureMinutes / 60)
                            const minutes = record.earlyDepartureMinutes % 60
                            if (hours > 0) {
                              return `-${hours}h ${minutes}m temprano`
                            }
                            return `-${minutes}m temprano`
                          })()}
                        </span>
                      )}
                    </div>
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
