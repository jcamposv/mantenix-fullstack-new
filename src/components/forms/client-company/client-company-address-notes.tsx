import { Control } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ClientCompanyFormData } from "@/schemas/client-company"

interface ClientCompanyAddressNotesProps {
  control: Control<ClientCompanyFormData>
}

export function ClientCompanyAddressNotes({ control }: ClientCompanyAddressNotesProps) {
  return (
    <div className="space-y-6">
      {/* Dirección */}
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Calle 123, San José, Costa Rica"
                className="resize-none"
                rows={3}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notas */}
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas (Opcional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Información adicional sobre esta empresa cliente..."
                className="resize-none"
                rows={4}
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Cualquier información adicional o requerimientos especiales para este cliente
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}