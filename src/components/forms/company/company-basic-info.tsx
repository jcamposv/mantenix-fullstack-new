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
import { CompanyFormData } from "@/schemas/company"

interface CompanyBasicInfoProps {
  control: Control<CompanyFormData>
}

export function CompanyBasicInfo({ control }: CompanyBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Empresa *</FormLabel>
            <FormControl>
              <Input placeholder="Corporación Acme" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="subdomain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subdominio *</FormLabel>
            <FormControl>
              <Input placeholder="acme" {...field} />
            </FormControl>
            <FormDescription>
              Se creará acme.mantenix.com
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}