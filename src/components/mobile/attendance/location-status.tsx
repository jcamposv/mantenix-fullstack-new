"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Navigation, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { GeolocationCoordinates } from "@/types/attendance.types"

interface LocationStatusProps {
  location: GeolocationCoordinates | null
  locationError: string | null
  onRequestLocation: () => void
  loading?: boolean
}

export const LocationStatus = ({
  location,
  locationError,
  onRequestLocation,
  loading = false
}: LocationStatusProps) => {
  // Si hay error de ubicación
  if (locationError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          {locationError}
        </AlertDescription>
      </Alert>
    )
  }

  // Si tiene ubicación
  if (location) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Ubicación obtenida
              </p>
              <p className="text-xs text-green-700 mt-1">
                Lat: {location.latitude.toFixed(6)},
                Lng: {location.longitude.toFixed(6)}
              </p>
              {location.accuracy && (
                <p className="text-xs text-green-600 mt-1">
                  Precisión: ±{Math.round(location.accuracy)}m
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Solicitar ubicación
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Ubicación requerida
            </p>
            <p className="text-xs text-blue-700 mb-3">
              Necesitamos tu ubicación para verificar que estás en la oficina
            </p>
            <Button
              onClick={onRequestLocation}
              disabled={loading}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {loading ? "Obteniendo..." : "Obtener Ubicación"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
