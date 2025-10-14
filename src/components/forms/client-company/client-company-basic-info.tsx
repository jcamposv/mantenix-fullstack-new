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

interface ClientCompanyBasicInfoProps {
  control: Control<ClientCompanyFormData>
}

export function ClientCompanyBasicInfo({ control }: ClientCompanyBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Empresa *</FormLabel>
            <FormControl>
              <Input placeholder="Empresa ABC S.A." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="companyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cédula Jurídica *</FormLabel>
            <FormControl>
              <Input placeholder="3-101-123456" {...field} />
            </FormControl>
            <FormDescription>
              Número de cédula jurídica o registro mercantil
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}