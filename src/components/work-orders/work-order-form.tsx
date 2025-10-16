"use client"

import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, LayoutTemplate } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createWorkOrderSchema, workOrderTypeSchema, workOrderPrioritySchema } from "@/schemas/work-order"
import { cn } from "@/lib/utils"
import { TemplateCustomFields } from "./template-custom-fields"
import type { CreateWorkOrderData } from "@/types/work-order.types"
import type { WorkOrderTemplateWithRelations } from "@/types/work-order-template.types"

interface WorkOrderFormProps {
  form: UseFormReturn<CreateWorkOrderData>
  initialData?: Partial<CreateWorkOrderData>
  sites?: Array<{ id: string; name: string }>
  assets?: Array<{ id: string; name: string; code: string }>
  users?: Array<{ id: string; name: string; email: string }>
  templates?: WorkOrderTemplateWithRelations[]
}

export function WorkOrderForm({
  form: externalForm,
  initialData,
  sites = [],
  assets = [],
  templates = []
}: WorkOrderFormProps) {
  const internalForm = useForm<CreateWorkOrderData>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: initialData?.type || "PREVENTIVO",
      priority: initialData?.priority || "MEDIUM",
      siteId: initialData?.siteId || "",
      assetId: initialData?.assetId || "",
      templateId: initialData?.templateId || "",
      customFieldValues: initialData?.customFieldValues || {},
      scheduledDate: initialData?.scheduledDate,
      estimatedDuration: initialData?.estimatedDuration,
      estimatedCost: initialData?.estimatedCost,
      instructions: initialData?.instructions || "",
      safetyNotes: initialData?.safetyNotes || "",
      tools: initialData?.tools || [],
      materials: initialData?.materials || [],
      assignedUserIds: initialData?.assignedUserIds || []
    }
  })

  const form = externalForm || internalForm

  // Find the selected template if templateId is provided
  const selectedTemplateFromId = templates.find(t => t.id === form.watch("templateId"))

  return (
    <div className="space-y-6">
        {/* Template Info Display (if using template) */}
        {selectedTemplateFromId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4" />
                Template Seleccionado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{selectedTemplateFromId.name}</h4>
                  <Badge variant="outline">{selectedTemplateFromId.category || 'Sin categoría'}</Badge>
                </div>
                {selectedTemplateFromId.description && (
                  <p className="text-sm text-muted-foreground">{selectedTemplateFromId.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título de la orden de trabajo" {...field} />
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
                    <Textarea
                      placeholder="Descripción detallada del trabajo a realizar"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workOrderTypeSchema.options.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "PREVENTIVO" && "Preventivo"}
                            {type === "CORRECTIVO" && "Correctivo"}
                            {type === "REPARACION" && "Reparación"}
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select value={field.value || "MEDIUM"} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workOrderPrioritySchema.options.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority === "LOW" && "Baja"}
                            {priority === "MEDIUM" && "Media"}
                            {priority === "HIGH" && "Alta"}
                            {priority === "URGENT" && "Urgente"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location and Asset */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación y Activo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="siteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sede</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar sede..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
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
              name="assetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activo (Opcional)</FormLabel>
                  <Select 
                    value={field.value || "no-asset"} 
                    onValueChange={(value) => {
                      const assetId = value === "no-asset" ? "" : value
                      field.onChange(assetId)
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar activo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no-asset">Sin activo específico</SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex flex-col">
                            <span>{asset.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Código: {asset.code}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Scheduling and Estimates */}
        <Card>
          <CardHeader>
            <CardTitle>Programación y Estimaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha Programada</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración Estimada (horas)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Ej: 2.5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo Estimado</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ej: 1500.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Template Custom Fields */}
        <TemplateCustomFields form={form} template={selectedTemplateFromId || null} />
    </div>
  )
}