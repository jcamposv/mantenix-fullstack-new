import { Control } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LocationFormData } from "@/schemas/location"

interface LocationBasicInfoProps {
  control: Control<LocationFormData>
}

export const LocationBasicInfo = ({ control }: LocationBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <FormField<LocationFormData>
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre *</FormLabel>
            <FormControl>
              <Input
                placeholder="Oficina Central"
                value={(field.value as string) ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormDescription>
              Nombre descriptivo de la ubicación
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField<LocationFormData>
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección</FormLabel>
            <FormControl>
              <Input
                placeholder="San José, Costa Rica"
                value={(field.value as string) ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormDescription>
              Dirección física de la ubicación (opcional)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
