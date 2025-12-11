import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { AssetFormData } from "@/schemas/asset"
import { AssetImageUpload } from "./asset-image-upload"

interface AssetTechnicalInfoProps {
  form: UseFormReturn<AssetFormData>
  clientCompanyId?: string
  assetId?: string
}

export function AssetTechnicalInfo({ form, clientCompanyId = "temp", assetId = "new" }: AssetTechnicalInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="manufacturer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fabricante</FormLabel>
              <FormControl>
                <Input placeholder="Toyota, Caterpillar, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <FormControl>
                <Input placeholder="FD25, 320D, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="serialNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Serie</FormLabel>
            <FormControl>
              <Input placeholder="Número de serie físico del activo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Compra</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedLifespan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vida Útil Estimada (años)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="10"
                  min="0"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value
                    field.onChange(val === "" ? undefined : Number(val))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="operatingHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horas de Operación (Opcional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="12000"
                min="0"
                value={field.value ?? ""}
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(val === "" ? undefined : Number(val))
                }}
              />
            </FormControl>
            <FormDescription>
              Horas actuales del odómetro/medidor. Si no se define, se calculará automáticamente desde la fecha de compra.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <AssetImageUpload
                value={field.value || []}
                onChange={field.onChange}
                clientCompanyId={clientCompanyId}
                assetId={assetId}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}