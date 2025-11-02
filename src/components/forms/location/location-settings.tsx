import { Control } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LocationFormData } from "@/schemas/location"

interface LocationSettingsProps {
  control: Control<LocationFormData>
}

export const LocationSettings = ({ control }: LocationSettingsProps) => {
  return (
    <div className="space-y-4">
      <FormField<LocationFormData>
        control={control}
        name="radiusMeters"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Radio de validación (metros) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="10"
                max="10000"
                placeholder="100"
                value={(field.value as number) ?? 100}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormDescription>
              Los empleados deben estar dentro de este radio para marcar asistencia (10-10000 metros)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField<LocationFormData>
        control={control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Ubicación activa
              </FormLabel>
              <FormDescription>
                Solo las ubicaciones activas permiten marcar asistencia
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={(field.value as boolean) ?? true}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}
