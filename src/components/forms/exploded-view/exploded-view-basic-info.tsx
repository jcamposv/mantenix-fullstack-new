/**
 * Exploded View Basic Info Form Fields
 *
 * Basic information fields for creating/editing exploded views.
 * Following Next.js Expert standards and project form patterns.
 */

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import { explodedViewFormSchema } from "@/schemas/exploded-view-form"

interface Asset {
  id: string
  name: string
  code: string
}

type ExplodedViewFormDataInferred = z.infer<typeof explodedViewFormSchema>

interface ExplodedViewBasicInfoProps {
  form: UseFormReturn<ExplodedViewFormDataInferred>
  assets: Asset[]
  loadingAssets: boolean
}

export function ExplodedViewBasicInfo({ form, assets, loadingAssets }: ExplodedViewBasicInfoProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="assetId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Activo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un activo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {loadingAssets ? (
                  <SelectItem value="loading" disabled>
                    Cargando activos...
                  </SelectItem>
                ) : assets.length === 0 ? (
                  <SelectItem value="no-assets" disabled>
                    No hay activos disponibles
                  </SelectItem>
                ) : (
                  assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">{asset.code}</div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              Activo al que pertenece esta vista explosionada
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Vista</FormLabel>
            <FormControl>
              <Input placeholder="Vista frontal, Vista trasera, Vista lateral..." {...field} />
            </FormControl>
            <FormDescription>
              Nombre descriptivo para identificar esta vista del activo
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción (Opcional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descripción de lo que muestra esta vista, componentes visibles, etc."
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
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL de la Imagen</FormLabel>
            <FormControl>
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                {...field}
              />
            </FormControl>
            <FormDescription>
              URL de la imagen de la vista explosionada (debe estar subida previamente)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="imageWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ancho (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1920"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageHeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alto (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1080"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Orden de visualización
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
