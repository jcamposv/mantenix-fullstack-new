"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { createPlanSchema, type CreatePlanInput } from "@/app/api/schemas/subscription-schemas"
import { AVAILABLE_FEATURES } from "@/types/attendance.types"

interface SubscriptionPlanFormProps {
  onSubmit: (data: CreatePlanInput) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<CreatePlanInput>
  mode?: "create" | "edit"
}

export function SubscriptionPlanForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
  mode = "create"
}: SubscriptionPlanFormProps) {
  const form = useForm({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: initialData?.name || "",
      tier: initialData?.tier || "STARTER",
      description: initialData?.description || "",
      monthlyPrice: initialData?.monthlyPrice || 0,
      annualPrice: initialData?.annualPrice || 0,
      maxUsers: initialData?.maxUsers || 5,
      maxCompanies: initialData?.maxCompanies || 1,
      maxWarehouses: initialData?.maxWarehouses || 1,
      maxWorkOrdersPerMonth: initialData?.maxWorkOrdersPerMonth || 50,
      maxInventoryItems: initialData?.maxInventoryItems || 100,
      maxStorageGB: initialData?.maxStorageGB || 5,
      features: initialData?.features || [],
      overageUserPrice: initialData?.overageUserPrice || 15,
      overageStoragePrice: initialData?.overageStoragePrice || 0.5,
      overageWorkOrderPrice: initialData?.overageWorkOrderPrice || 1,
      isActive: initialData?.isActive ?? true,
    },
  })

  return (
    <Card className="w-full shadow-none">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Crear Plan de Subscripción" : "Editar Plan de Subscripción"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información Básica</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Plan</FormLabel>
                      <FormControl>
                        <Input placeholder="Plan Starter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STARTER">Starter</SelectItem>
                          <SelectItem value="BUSINESS">Business</SelectItem>
                          <SelectItem value="CORPORATE">Corporate</SelectItem>
                          <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                        </SelectContent>
                      </Select>
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
                        placeholder="Descripción del plan..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Precios</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="monthlyPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Mensual (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="199" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annualPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Anual (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="1990" {...field} />
                      </FormControl>
                      <FormDescription>
                        Descuento anual recomendado: ~16%
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Limits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Límites</h3>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="maxUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máx. Usuarios</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxCompanies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máx. Compañías</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxWarehouses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máx. Bodegas</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxWorkOrdersPerMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máx. Órdenes/Mes</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxInventoryItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máx. Items Inventario</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxStorageGB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máx. Almacenamiento (GB)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Overage Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Precios por Exceso</h3>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="overageUserPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio por Usuario Extra (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overageStoragePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio por GB Extra (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overageWorkOrderPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio por Orden Extra (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Features Incluidos</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona los módulos y características que incluye este plan
              </p>

              <FormField
                control={form.control}
                name="features"
                render={() => (
                  <FormItem>
                    <div className="grid gap-3 md:grid-cols-2">
                      {Object.values(AVAILABLE_FEATURES).map((feature) => (
                        <FormField
                          key={feature.module}
                          control={form.control}
                          name="features"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={feature.module}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(feature.module)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), feature.module])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: string) => value !== feature.module
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    {feature.name}
                                  </FormLabel>
                                  <FormDescription className="text-xs">
                                    {feature.description}
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Plan Activo</FormLabel>
                    <FormDescription>
                      El plan estará disponible para nuevas subscripciones
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Crear Plan" : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
