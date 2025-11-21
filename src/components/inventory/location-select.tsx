"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LOCATION_TYPE_OPTIONS } from "@/schemas/inventory"
import { Warehouse, Truck, Building2 } from "lucide-react"

export type LocationType = "WAREHOUSE" | "VEHICLE" | "SITE"

interface LocationSelectProps {
  locationTypeValue?: LocationType
  locationIdValue?: string
  onLocationTypeChange: (value: LocationType) => void
  onLocationIdChange: (value: string) => void
  locationTypeLabel?: string
  locationIdLabel?: string
  locationTypePlaceholder?: string
  locationIdPlaceholder?: string
  disabled?: boolean
  className?: string
}

export function LocationSelect({
  locationTypeValue,
  locationIdValue,
  onLocationTypeChange,
  onLocationIdChange,
  locationTypeLabel = "Tipo de ubicación",
  locationIdLabel = "Ubicación",
  locationTypePlaceholder = "Selecciona el tipo",
  locationIdPlaceholder = "Selecciona la ubicación",
  disabled,
  className
}: LocationSelectProps) {
  const [locations, setLocations] = React.useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (locationTypeValue) {
      fetchLocations(locationTypeValue)
    } else {
      setLocations([])
      onLocationIdChange("")
    }
  }, [locationTypeValue])

  const fetchLocations = async (type: LocationType) => {
    try {
      setLoading(true)
      let endpoint = ""

      switch (type) {
        case "WAREHOUSE":
          // Use companies from the corporate group as warehouses/bodegas
          endpoint = "/api/admin/companies"
          break
        case "VEHICLE":
          // TODO: Implement vehicle API
          endpoint = "/api/admin/vehicles"
          break
        case "SITE":
          endpoint = "/api/admin/sites"
          break
      }

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        // Use standardized items property
        const items = data.items || []
        setLocations(items)
      } else {
        setLocations([])
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type?: LocationType) => {
    switch (type) {
      case "WAREHOUSE":
        return <Warehouse className="h-4 w-4" />
      case "VEHICLE":
        return <Truck className="h-4 w-4" />
      case "SITE":
        return <Building2 className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="locationType">{locationTypeLabel}</Label>
          <Select
            value={locationTypeValue}
            onValueChange={(value) => onLocationTypeChange(value as LocationType)}
            disabled={disabled}
          >
            <SelectTrigger id="locationType">
              <SelectValue placeholder={locationTypePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {LOCATION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {getIcon(option.value as LocationType)}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locationId">{locationIdLabel}</Label>
          <Select
            value={locationIdValue}
            onValueChange={onLocationIdChange}
            disabled={disabled || !locationTypeValue || loading}
          >
            <SelectTrigger id="locationId">
              <SelectValue placeholder={loading ? "Cargando..." : locationIdPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {locations.length === 0 && !loading ? (
                <SelectItem value="no-data" disabled>
                  No hay ubicaciones disponibles
                </SelectItem>
              ) : (
                locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
