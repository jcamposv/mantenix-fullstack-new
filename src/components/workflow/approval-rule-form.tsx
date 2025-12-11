"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createApprovalRuleSchema, type ApprovalRuleFormData } from "@/schemas/approval-rule.schema"

interface ApprovalRuleFormProps {
  onSubmit: (data: ApprovalRuleFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<ApprovalRuleFormData>
}

export function ApprovalRuleForm({
  onSubmit,
  onCancel,
  loading,
  initialData
}: ApprovalRuleFormProps) {
  const form = useForm<ApprovalRuleFormData>({
    resolver: zodResolver(createApprovalRuleSchema) as Resolver<ApprovalRuleFormData>,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      minCost: initialData?.minCost,
      maxCost: initialData?.maxCost,
      priority: initialData?.priority,
      type: initialData?.type,
      assetCriticality: initialData?.assetCriticality,
      approvalLevels: initialData?.approvalLevels || 1,
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {initialData ? "Editar Regla de Aprobación" : "Crear Regla de Aprobación"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Aprobación para OT > $10,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descripción de la regla..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approvalLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveles de Aprobación Requeridos *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>
                      Número de aprobaciones necesarias (1-10)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Criterios de Activación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo Mínimo (₡)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo Máximo (₡)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Sin límite"
                          {...field}
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Cualquiera" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Baja</SelectItem>
                        <SelectItem value="MEDIUM">Media</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="CRITICAL">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Dejar vacío para cualquier prioridad</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de OT</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Cualquiera" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                        <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                        <SelectItem value="PREDICTIVO">Predictivo</SelectItem>
                        <SelectItem value="INSPECCION">Inspección</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Dejar vacío para cualquier tipo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assetCriticality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Criticidad del Activo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Cualquiera" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A - Crítico</SelectItem>
                        <SelectItem value="B">B - Importante</SelectItem>
                        <SelectItem value="C">C - Menor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Dejar vacío para cualquier criticidad</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Regla Activa</FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : initialData ? "Actualizar Regla" : "Crear Regla"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
