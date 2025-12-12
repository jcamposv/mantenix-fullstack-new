"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, LogIn, LogOut, RefreshCw } from "lucide-react"
import type { AttendanceRecordWithRelations } from "@/types/attendance.types"

interface AttendanceCardProps {
  record: AttendanceRecordWithRelations | null
  loading: boolean
  checking: boolean
  isWithinGeofence: boolean
  geofenceMessage?: string
  onCheckIn: () => void
  onCheckOut: () => void
  onRefresh: () => void
}

const statusConfig = {
  ON_TIME: {
    label: "A Tiempo",
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50"
  },
  LATE: {
    label: "Tarde",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50"
  },
  ABSENT: {
    label: "Ausente",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50"
  },
  JUSTIFIED: {
    label: "Justificado",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50"
  },
  EARLY_DEPARTURE: {
    label: "Salida Temprana",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50"
  }
}

const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  })
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export const AttendanceCard = ({
  record,
  loading,
  checking,
  isWithinGeofence,
  geofenceMessage,
  onCheckIn,
  onCheckOut,
  onRefresh
}: AttendanceCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Asistencia de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-12 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasCheckedIn = !!record
  const hasCheckedOut = !!record?.checkOutAt
  const status = record?.status || "ABSENT"
  const config = statusConfig[status as keyof typeof statusConfig]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Asistencia de Hoy
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={checking}
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado actual */}
        {hasCheckedIn && (
          <div className={`p-4 rounded-lg ${config.bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Estado
              </span>
              <Badge className={config.color}>
                {config.label}
              </Badge>
            </div>

            {/* Hora de entrada */}
            <div className="flex items-center gap-2 mb-2">
              <LogIn className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Entrada: <strong>{formatTime(record.checkInAt)}</strong>
              </span>
            </div>

            {/* Hora de salida */}
            {hasCheckedOut && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Salida: <strong>{formatTime(record.checkOutAt!)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Duración: <strong>{formatDuration(record.workDurationMinutes || 0)}</strong>
                  </span>
                </div>
              </>
            )}

            {/* Minutos tarde */}
            {record.lateMinutes && record.lateMinutes > 0 && (
              <div className="mt-2 pt-2 border-t border-yellow-200">
                <span className="text-sm text-yellow-700">
                  Llegaste {(() => {
                    const hours = Math.floor(record.lateMinutes / 60)
                    const minutes = record.lateMinutes % 60
                    if (hours > 0) {
                      return `${hours}h ${minutes}m`
                    }
                    return `${minutes} minuto${minutes > 1 ? "s" : ""}`
                  })()} tarde
                </span>
              </div>
            )}

            {/* Ubicación */}
            {record.location && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {record.location.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Sin registro */}
        {!hasCheckedIn && (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No has marcado entrada hoy</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-2">
          {!hasCheckedIn && (
            <>
              <Button
                onClick={onCheckIn}
                disabled={checking || !isWithinGeofence}
                className="w-full"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                {checking ? "Marcando..." : "Marcar Entrada"}
              </Button>
              {!isWithinGeofence && geofenceMessage && (
                <div className="text-center text-sm text-red-600 p-2 bg-red-50 rounded-lg">
                  {geofenceMessage}
                </div>
              )}
            </>
          )}

          {hasCheckedIn && !hasCheckedOut && (
            <Button
              onClick={onCheckOut}
              disabled={checking}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <LogOut className="w-5 h-5 mr-2" />
              {checking ? "Marcando..." : "Marcar Salida"}
            </Button>
          )}

          {hasCheckedOut && (
            <div className="text-center py-2 text-sm text-muted-foreground">
              ✓ Registro completado por hoy
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
