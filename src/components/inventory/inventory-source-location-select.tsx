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
import { Warehouse, Truck, Building2, Package } from "lucide-react"

interface StockLocation {
  locationId: string
  locationType: "WAREHOUSE" | "VEHICLE" | "SITE"
  locationName: string
  availableQuantity: number
}

interface InventorySourceLocationSelectProps {
  inventoryItemId: string
  locationTypeValue?: string
  locationIdValue?: string
  onLocationTypeChange: (value: string) => void
  onLocationIdChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function InventorySourceLocationSelect({
  inventoryItemId,
  locationTypeValue,
  locationIdValue,
  onLocationTypeChange,
  onLocationIdChange,
  disabled,
  className
}: InventorySourceLocationSelectProps) {
  const [stockLocations, setStockLocations] = React.useState<StockLocation[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (inventoryItemId) {
      fetchStockLocations()
    } else {
      setStockLocations([])
      onLocationIdChange("")
      onLocationTypeChange("")
    }
  }, [inventoryItemId])

  const fetchStockLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/inventory/items/${inventoryItemId}/stock-locations`)

      if (response.ok) {
        const data = await response.json()
        setStockLocations(data.locations || [])

        // Auto-select if only one location with stock
        if (data.locations?.length === 1) {
          const location = data.locations[0]
          onLocationTypeChange(location.locationType)
          onLocationIdChange(location.locationId)
        }
      } else {
        setStockLocations([])
      }
    } catch (error) {
      console.error("Error fetching stock locations:", error)
      setStockLocations([])
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "WAREHOUSE":
        return <Warehouse className="h-4 w-4" />
      case "VEHICLE":
        return <Truck className="h-4 w-4" />
      case "SITE":
        return <Building2 className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "WAREHOUSE":
        return "Bodega"
      case "VEHICLE":
        return "Vehículo"
      case "SITE":
        return "Sede"
      default:
        return type
    }
  }

  const selectedLocation = stockLocations.find(
    loc => loc.locationId === locationIdValue && loc.locationType === locationTypeValue
  )

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor="sourceLocation">
          Ubicación Origen *
          {!inventoryItemId && (
            <span className="text-xs text-muted-foreground ml-2">
              (Selecciona primero un repuesto)
            </span>
          )}
        </Label>
        <Select
          value={locationIdValue && locationTypeValue ? `${locationTypeValue}:${locationIdValue}` : ""}
          onValueChange={(value) => {
            const [type, id] = value.split(":")
            onLocationTypeChange(type)
            onLocationIdChange(id)
          }}
          disabled={disabled || !inventoryItemId || loading}
        >
          <SelectTrigger id="sourceLocation">
            <SelectValue
              placeholder={
                loading
                  ? "Cargando ubicaciones..."
                  : !inventoryItemId
                    ? "Selecciona un repuesto primero"
                    : stockLocations.length === 0
                      ? "No hay stock disponible"
                      : "Selecciona ubicación"
              }
            >
              {selectedLocation && (
                <div className="flex items-center gap-2">
                  {getIcon(selectedLocation.locationType)}
                  <span>{selectedLocation.locationName}</span>
                  <span className="text-xs text-green-600">
                    ({selectedLocation.availableQuantity} disp.)
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {stockLocations.length === 0 && !loading ? (
              <SelectItem value="no-stock" disabled>
                No hay stock disponible en ninguna ubicación
              </SelectItem>
            ) : (
              stockLocations.map((location) => (
                <SelectItem
                  key={`${location.locationType}:${location.locationId}`}
                  value={`${location.locationType}:${location.locationId}`}
                >
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-2">
                      {getIcon(location.locationType)}
                      <div>
                        <div className="font-medium">{location.locationName}</div>
                        <div className="text-xs text-muted-foreground">
                          {getTypeLabel(location.locationType)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      {location.availableQuantity} disp.
                    </div>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {stockLocations.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Mostrando solo ubicaciones con stock disponible
          </p>
        )}
      </div>
    </div>
  )
}
