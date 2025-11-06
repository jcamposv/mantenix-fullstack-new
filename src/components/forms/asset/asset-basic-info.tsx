import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { AssetFormData, ASSET_STATUS_OPTIONS, ASSET_CATEGORY_OPTIONS } from "@/schemas/asset"

interface Site {
  id: string
  name: string
  clientCompany?: {
    name: string
  }
}

interface AssetBasicInfoProps {
  form: UseFormReturn<AssetFormData>
  sites: Site[]
  loadingSites: boolean
  hasExternalClientMgmt?: boolean
}

export function AssetBasicInfo({ form, sites, loadingSites, hasExternalClientMgmt = false }: AssetBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Activo</FormLabel>
              <FormControl>
                <Input placeholder="Compresor A-12, Montacargas 01, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código del Activo</FormLabel>
              <FormControl>
                <Input placeholder="ACT-001, MC-01, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descripción detallada del activo, uso, características técnicas..." 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasExternalClientMgmt && (
          <FormField
            control={form.control}
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
                        No hay sedes disponibles
                      </SelectItem>
                    ) : (
                      sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          <div>
                            <div className="font-medium">{site.name}</div>
                            {site.clientCompany && (
                              <div className="text-sm text-muted-foreground">
                                {site.clientCompany.name}
                              </div>
                            )}
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
        )}

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input placeholder="Planta 2 - Zona Norte, Oficina 201, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ASSET_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ASSET_CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}