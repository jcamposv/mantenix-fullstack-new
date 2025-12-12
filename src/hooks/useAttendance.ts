"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { requestGeolocation } from "@/lib/geolocation"
import type { AttendanceRecordWithRelations } from "@/types/attendance.types"
import type { GeolocationCoordinates } from "@/types/attendance.types"

interface GeofenceValidation {
  isValid: boolean
  message: string
  distance: number | null
  nearestLocation: {
    id: string
    name: string
    radiusMeters: number
  } | null
}

interface UseAttendanceReturn {
  todayRecord: AttendanceRecordWithRelations | null
  loading: boolean
  checking: boolean
  location: GeolocationCoordinates | null
  locationError: string | null
  geofenceValidation: GeofenceValidation | null
  isWithinGeofence: boolean
  checkIn: () => Promise<void>
  checkOut: () => Promise<void>
  refreshTodayRecord: () => Promise<void>
  requestLocation: () => Promise<GeolocationCoordinates>
  validateCurrentLocation: () => Promise<void>
}

export const useAttendance = (): UseAttendanceReturn => {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecordWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [geofenceValidation, setGeofenceValidation] = useState<GeofenceValidation | null>(null)

  const fetchTodayRecord = useCallback(async () => {
    try {
      const response = await fetch("/api/attendance/today")

      if (response.ok) {
        const data = await response.json()
        setTodayRecord(data.id ? data : null) // Si tiene ID, es un registro válido
      } else {
        const error = await response.json()
        console.error("Error fetching today record:", error)
      }
    } catch (error) {
      console.error("Error fetching today record:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const validateCurrentLocation = useCallback(async () => {
    if (!location) {
      setGeofenceValidation(null)
      return
    }

    try {
      const response = await fetch("/api/attendance/validate-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude
        })
      })

      if (response.ok) {
        const validation = await response.json()
        setGeofenceValidation(validation)
      }
    } catch (error) {
      console.error("Error validating location:", error)
    }
  }, [location])

  const requestLocation = useCallback(async () => {
    setLocationError(null)
    setGeofenceValidation(null)
    try {
      const coords = await requestGeolocation()
      setLocation(coords)

      // Validate geofence immediately
      const response = await fetch("/api/attendance/validate-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude
        })
      })

      if (response.ok) {
        const validation = await response.json()
        setGeofenceValidation(validation)
      }

      return coords
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al obtener ubicación"
      setLocationError(message)
      toast.error(message)
      throw error
    }
  }, [])

  const checkIn = useCallback(async () => {
    try {
      setChecking(true)

      // Solicitar ubicación
      const coords = await requestLocation()

      // Obtener información del dispositivo
      const deviceInfo = navigator.userAgent

      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          deviceInfo
        })
      })

      if (response.ok) {
        const record = await response.json()
        setTodayRecord(record)

        if (record.status === "ON_TIME") {
          toast.success("¡Entrada marcada a tiempo!")
        } else if (record.status === "LATE") {
          const hours = Math.floor((record.lateMinutes || 0) / 60)
          const minutes = (record.lateMinutes || 0) % 60
          const timeText = hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes} minutos`
          toast.warning(`Entrada marcada con ${timeText} de retraso`)
        } else {
          toast.success("Entrada marcada exitosamente")
        }
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al marcar entrada")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al marcar entrada"
      toast.error(message)
    } finally {
      setChecking(false)
    }
  }, [requestLocation])

  const checkOut = useCallback(async () => {
    if (!todayRecord) {
      toast.error("No hay registro de entrada para marcar salida")
      return
    }

    try {
      setChecking(true)

      // Solicitar ubicación
      const coords = await requestLocation()

      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          attendanceId: todayRecord.id,
          latitude: coords.latitude,
          longitude: coords.longitude
        })
      })

      if (response.ok) {
        const record = await response.json()
        setTodayRecord(record)

        const hours = Math.floor((record.workDurationMinutes || 0) / 60)
        const minutes = (record.workDurationMinutes || 0) % 60

        toast.success(`¡Salida marcada! Trabajaste ${hours}h ${minutes}m`)
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al marcar salida")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al marcar salida"
      toast.error(message)
    } finally {
      setChecking(false)
    }
  }, [todayRecord, requestLocation])

  const refreshTodayRecord = useCallback(async () => {
    setLoading(true)
    await fetchTodayRecord()
  }, [fetchTodayRecord])

  useEffect(() => {
    fetchTodayRecord()
  }, [fetchTodayRecord])

  return {
    todayRecord,
    loading,
    checking,
    location,
    locationError,
    geofenceValidation,
    isWithinGeofence: geofenceValidation?.isValid ?? false,
    checkIn,
    checkOut,
    refreshTodayRecord,
    requestLocation,
    validateCurrentLocation
  }
}
