/**
 * Component Basic Info Form Fields
 *
 * Basic information fields for creating/editing exploded view components.
 */

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import type { ComponentFormData } from "@/schemas/exploded-view-form"
import { AssetImageUpload } from "../asset/asset-image-upload"
import { useSession } from "@/lib/auth-client"

interface InventoryItem {
  id: string
  name: string
  code: string
}

interface ComponentBasicInfoProps {
  form: UseFormReturn<ComponentFormData>
  inventoryItems: InventoryItem[]
  loadingInventory: boolean
}

export function ComponentBasicInfo({
  form,
  inventoryItems,
  loadingInventory,
}: ComponentBasicInfoProps) {
  const { data: session } = useSession()
  const clientCompanyId = (session?.user as { clientCompanyId?: string })?.clientCompanyId || "temp"

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Componente</FormLabel>
              <FormControl>
                <Input placeholder="Rodamiento, Válvula, Sello, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="partNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Parte (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="PN-12345, REF-ABC, etc."
                  {...field}
                  value={field.value || ""}
                />
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
            <FormLabel>Descripción (Opcional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descripción detallada del componente, función, características..."
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="manufacturer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fabricante (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="SKF, Bosch, Parker, etc."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inventoryItemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vincular con Inventario (Opcional)</FormLabel>
              <Select
                onValueChange={(value) => {
                  // Convert "none" to null for the form
                  field.onChange(value === "none" ? null : value)
                }}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin vincular" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Sin vincular</SelectItem>
                  {loadingInventory ? (
                    <SelectItem value="loading" disabled>
                      Cargando items...
                    </SelectItem>
                  ) : (
                    inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.code}</div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                Vincular este componente con un item del inventario
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="manualUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Manual (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://ejemplo.com/manual.pdf"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                URL al manual del componente
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="installationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Guía de Instalación (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://ejemplo.com/instalacion.pdf"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                URL a la guía de instalación
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <AssetImageUpload
                value={field.value ? [field.value] : []}
                onChange={(images) => field.onChange(images[0] || null)}
                clientCompanyId={clientCompanyId}
                assetId="components"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
