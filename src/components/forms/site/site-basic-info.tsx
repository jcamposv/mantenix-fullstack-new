import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Control } from "react-hook-form"
import { SiteFormData } from "@/schemas/site"

interface ClientCompany {
  id: string
  name: string
  companyId: string
  contactName: string | null
}

interface SiteBasicInfoProps {
  control: Control<SiteFormData>
  clientCompanies: ClientCompany[]
  loadingClientCompanies: boolean
}

export function SiteBasicInfo({ control, clientCompanies, loadingClientCompanies }: SiteBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Sede</FormLabel>
            <FormControl>
              <Input placeholder="Oficina Principal, Fábrica 1, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="clientCompanyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Empresa Cliente</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una empresa cliente" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {loadingClientCompanies ? (
                  <SelectItem value="loading" disabled>
                    Cargando empresas cliente...
                  </SelectItem>
                ) : clientCompanies.length === 0 ? (
                  <SelectItem value="no-companies" disabled>
                    No hay empresas cliente disponibles
                  </SelectItem>
                ) : (
                  clientCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {company.companyId}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}