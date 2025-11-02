"use client"

import { useAttendance } from "@/hooks/useAttendance"
import { AttendanceCard } from "@/components/mobile/attendance/attendance-card"
import { LocationStatus } from "@/components/mobile/attendance/location-status"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function MobileAttendancePage() {
  const {
    todayRecord,
    loading,
    checking,
    location,
    locationError,
    geofenceValidation,
    isWithinGeofence,
    checkIn,
    checkOut,
    refreshTodayRecord,
    requestLocation
  } = useAttendance()

  return (
    <div className="space-y-4">
      {/* Información */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="ml-2">
          Recuerda marcar tu entrada al llegar y salida al retirarte
        </AlertDescription>
      </Alert>

      {/* Estado de ubicación */}
      <LocationStatus
        location={location}
        locationError={locationError}
        onRequestLocation={requestLocation}
        loading={checking}
      />

      {/* Card de asistencia */}
      <AttendanceCard
        record={todayRecord}
        loading={loading}
        checking={checking}
        isWithinGeofence={isWithinGeofence}
        geofenceMessage={geofenceValidation?.message}
        onCheckIn={checkIn}
        onCheckOut={checkOut}
        onRefresh={refreshTodayRecord}
      />

      {/* Información adicional */}
      <div className="text-center text-xs text-muted-foreground px-4">
        <p>
          Tu ubicación será verificada para asegurar que estés en las
          instalaciones de la empresa al momento de marcar
        </p>
      </div>
    </div>
  )
}
