import type {
  GeolocationCoordinates,
  GeofenceValidationResult,
  CompanyLocationWithRelations
} from "@/types/attendance.types"

/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 * @param lat1 Latitud del punto 1
 * @param lon1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lon2 Longitud del punto 2
 * @returns Distancia en metros
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000 // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c // Distancia en metros
  return Math.round(distance)
}

/**
 * Valida si una coordenada está dentro del geofence de alguna ubicación de la empresa
 * @param coordinates Coordenadas del usuario
 * @param locations Ubicaciones de la empresa
 * @returns Resultado de la validación
 */
export const validateGeofence = (
  coordinates: GeolocationCoordinates,
  locations: CompanyLocationWithRelations[]
): GeofenceValidationResult => {
  if (locations.length === 0) {
    return {
      isWithinGeofence: false,
      distance: 0,
      message: "No hay ubicaciones configuradas para esta empresa"
    }
  }

  const activeLocations = locations.filter((loc) => loc.isActive)

  if (activeLocations.length === 0) {
    return {
      isWithinGeofence: false,
      distance: 0,
      message: "No hay ubicaciones activas configuradas"
    }
  }

  // Calcular distancia a cada ubicación y encontrar la más cercana
  let nearestLocation: CompanyLocationWithRelations | undefined
  let minDistance = Infinity

  for (const location of activeLocations) {
    const distance = calculateDistance(
      coordinates.latitude,
      coordinates.longitude,
      location.latitude,
      location.longitude
    )

    if (distance < minDistance) {
      minDistance = distance
      nearestLocation = location
    }

    // Si está dentro del radio de esta ubicación, retornar inmediatamente
    if (distance <= location.radiusMeters) {
      return {
        isWithinGeofence: true,
        distance,
        nearestLocation: location,
        message: `Dentro del área de ${location.name}`
      }
    }
  }

  // No está dentro de ninguna ubicación
  return {
    isWithinGeofence: false,
    distance: minDistance,
    nearestLocation,
    message: `Debes estar dentro del área de la empresa para marcar asistencia. Estás a ${minDistance}m de ${nearestLocation?.name || "la ubicación más cercana"}`
  }
}

/**
 * Solicita la geolocalización del usuario en el navegador
 * @param options Opciones de geolocalización
 * @returns Promise con las coordenadas
 */
export const requestGeolocation = (
  options?: PositionOptions
): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalización no soportada por el navegador"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        let message = "Error al obtener ubicación"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Permiso de ubicación denegado"
            break
          case error.POSITION_UNAVAILABLE:
            message = "Ubicación no disponible"
            break
          case error.TIMEOUT:
            message = "Tiempo de espera excedido"
            break
        }
        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      }
    )
  })
}

/**
 * Formatea la distancia para mostrar
 * @param meters Distancia en metros
 * @returns String formateado (ej: "150m" o "1.5km")
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}
