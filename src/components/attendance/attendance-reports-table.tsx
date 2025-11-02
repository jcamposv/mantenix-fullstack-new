"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import type { AttendanceRecordBasic } from "@/types/attendance.types"

interface AttendanceReportsTableProps {
  records: AttendanceRecordBasic[]
}

const getStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "ON_TIME":
      return "default"
    case "LATE":
      return "secondary"
    case "ABSENT":
      return "destructive"
    default:
      return "outline"
  }
}

const getStatusLabel = (status: string | null) => {
  switch (status) {
    case "ON_TIME":
      return "A Tiempo"
    case "LATE":
      return "Tarde"
    case "ABSENT":
      return "Ausente"
    default:
      return "Sin registro"
  }
}

export const AttendanceReportsTable = ({ records }: AttendanceReportsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Registros</CardTitle>
        <CardDescription>
          Registros diarios del mes seleccionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros de asistencia para este mes</p>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {new Date(record.checkInAt).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Entrada: {new Date(record.checkInAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {record.checkOutAt && (
                        <> • Salida: {new Date(record.checkOutAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</>
                      )}
                    </p>
                    {record.lateMinutes && record.lateMinutes > 0 && (
                      <p className="text-xs text-yellow-600">
                        {(() => {
                          const hours = Math.floor(record.lateMinutes / 60)
                          const minutes = record.lateMinutes % 60
                          if (hours > 0) {
                            return `${hours}h ${minutes}m de retraso`
                          }
                          return `${minutes} minuto${minutes > 1 ? 's' : ''} de retraso`
                        })()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(record.status)}>
                  {getStatusLabel(record.status)}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
