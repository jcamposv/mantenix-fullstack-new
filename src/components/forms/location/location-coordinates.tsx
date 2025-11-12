import { Control } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Navigation } from "lucide-react"
import { toast } from "sonner"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LocationFormData } from "@/schemas/location"

interface LocationCoordinatesProps {
  control: Control<LocationFormData>
  setValue: (name: keyof LocationFormData, value: number) => void
}

export const LocationCoordinates = ({ control, setValue }: LocationCoordinatesProps) => {
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización")
      return
    }

    toast.info("Obteniendo ubicación actual...")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", position.coords.latitude)
        setValue("longitude", position.coords.longitude)
        toast.success("Ubicación obtenida")
      },
      (error) => {
        console.error("Error getting location:", error)
        toast.error("No se pudo obtener la ubicación")
      }
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Coordenadas GPS *</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<LocationFormData>
          control={control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitud</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="any"
                  placeholder="9.9281"
                  value={(field.value as number) ?? 0}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Coordenada de latitud (-90 a 90)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<LocationFormData>
          control={control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitud</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="any"
                  placeholder="-84.0907"
                  value={(field.value as number) ?? 0}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Coordenada de longitud (-180 a 180)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGetCurrentLocation}
      >
        <Navigation className="w-4 h-4 mr-2" />
        Usar mi ubicación actual
      </Button>
    </div>
  )
}
