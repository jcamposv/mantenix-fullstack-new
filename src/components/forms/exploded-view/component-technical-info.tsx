/**
 * Component Technical Info Form Fields
 * ISO 14224 hierarchy and technical specifications
 */

import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import type { ComponentFormData } from "@/schemas/exploded-view-form"

interface ExplodedViewComponent {
  id: string
  name: string
  partNumber: string | null
  hierarchyLevel: number
}

interface ComponentTechnicalInfoProps {
  form: UseFormReturn<ComponentFormData>
  components: ExplodedViewComponent[]
  loadingComponents: boolean
}

export function ComponentTechnicalInfo({
  form,
  components,
  loadingComponents,
}: ComponentTechnicalInfoProps) {
  return (
    <div className="space-y-4">
      {/* Hierarchy Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-medium">Jerarquía ISO 14224</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hierarchyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel Jerárquico</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString() || "4"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione nivel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="4">Nivel 4 - Sistema</SelectItem>
                    <SelectItem value="5">Nivel 5 - Subsistema</SelectItem>
                    <SelectItem value="6">Nivel 6 - Componente</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  4 = Sistema, 5 = Subsistema, 6 = Componente
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentComponentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Componente Padre (Opcional)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin componente padre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Sin componente padre</SelectItem>
                    {loadingComponents ? (
                      <SelectItem value="loading" disabled>Cargando...</SelectItem>
                    ) : (
                      components.map((component) => (
                        <SelectItem key={component.id} value={component.id}>
                          {component.name} (Nivel {component.hierarchyLevel})
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
      </div>

      {/* Criticality Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-medium">Criticidad</h3>

        <FormField
          control={form.control}
          name="criticality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel de Criticidad (Opcional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="No definida" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No definida</SelectItem>
                  <SelectItem value="A">A - Crítico (Paro total)</SelectItem>
                  <SelectItem value="B">B - Importante (Degradación)</SelectItem>
                  <SelectItem value="C">C - Menor (No afecta)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Technical Data Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-medium">Datos Técnicos de Mantenimiento</h3>

        <FormField
          control={form.control}
          name="lifeExpectancy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vida Útil Esperada (horas) - Opcional</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="8000"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value ? parseInt(value) : null)
                  }}
                />
              </FormControl>
              <FormDescription>
                Horas de operación esperadas antes de reemplazo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mtbf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MTBF (horas) - Opcional</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5000"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value ? parseInt(value) : null)
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Mean Time Between Failures
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mttr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MTTR (horas) - Opcional</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="2"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value ? parseInt(value) : null)
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Mean Time To Repair
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
