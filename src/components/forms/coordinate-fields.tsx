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
import { ClientCompanyFormData } from "@/schemas/client-company"

interface CoordinateFieldsProps {
  control: Control<ClientCompanyFormData>
}

export function CoordinateFields({ control }: CoordinateFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Coordenadas de Ubicación (Opcional)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField<ClientCompanyFormData>
          control={control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitud</FormLabel>
              <FormControl>
                <Input 
                  placeholder="9.9345" 
                  type="number"
                  step="any"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Coordenada GPS de latitud (grados decimales)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField<ClientCompanyFormData>
          control={control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitud</FormLabel>
              <FormControl>
                <Input 
                  placeholder="-84.0907" 
                  type="number"
                  step="any"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Coordenada GPS de longitud (grados decimales)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}