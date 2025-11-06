import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Control } from "react-hook-form"
import { AdminUserFormData, EXTERNAL_ROLES } from "@/schemas/admin-user"

interface ClientCompany {
  id: string
  name: string
  companyId: string
  email: string
  contactName: string
}

interface Site {
  id: string
  name: string
  address: string | null
  contactName: string | null
  _count: {
    siteUsers: number
  }
}

interface AdminUserExternalProps {
  control: Control<AdminUserFormData>
  isExternalUser: boolean
  selectedClientCompanyId: string | undefined
  selectedRole: string | undefined
  clientCompanies: ClientCompany[]
  sites: Site[]
  loadingClientCompanies: boolean
  loadingSites: boolean
  hasExternalClientMgmt?: boolean
}

export function AdminUserExternal({
  control,
  isExternalUser,
  selectedClientCompanyId,
  selectedRole,
  clientCompanies,
  sites,
  loadingClientCompanies,
  loadingSites,
  hasExternalClientMgmt = false
}: AdminUserExternalProps) {
  // Don't render anything if external client management is not enabled
  if (!hasExternalClientMgmt) {
    return null
  }

  // Check if selected role requires site assignment
  const roleRequiresSite = EXTERNAL_ROLES.find(role => role.value === selectedRole)?.requiresSite || false
  return (
    <>
      {/* External User Checkbox */}
      <FormField
        control={control}
        name="isExternalUser"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Usuario Externo
              </FormLabel>
              <FormDescription>
                Marque esta opción si el usuario pertenece a una de sus empresas cliente y tendrá acceso limitado solo a datos específicos del cliente.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {/* Client Company Selection (conditional) */}
      {isExternalUser && (
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
                    clientCompanies.map((clientCompany) => (
                      <SelectItem key={clientCompany.id} value={clientCompany.id}>
                        <div>
                          <div className="font-medium">{clientCompany.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Contacto: {clientCompany.contactName} • {clientCompany.email}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Este usuario solo tendrá acceso a datos relacionados con la empresa cliente seleccionada
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Site Selection (conditional) - only show if role requires site */}
      {isExternalUser && selectedClientCompanyId && roleRequiresSite && (
        <FormField
          control={control}
          name="siteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sede</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una sede" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingSites ? (
                    <SelectItem value="loading" disabled>
                      Cargando sedes...
                    </SelectItem>
                  ) : sites.length === 0 ? (
                    <SelectItem value="no-sites" disabled>
                      No hay sedes disponibles para esta empresa cliente
                    </SelectItem>
                  ) : (
                    sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        <div>
                          <div className="font-medium">{site.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {site.address && `${site.address} • `}
                            {site._count.siteUsers} usuarios asignados
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Este usuario solo tendrá acceso a datos y equipos de la sede seleccionada
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  )
}