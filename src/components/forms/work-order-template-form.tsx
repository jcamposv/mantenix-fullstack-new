"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { 
  workOrderTemplateSchema, 
  type WorkOrderTemplateFormData
} from "@/schemas/work-order-template"
import { TemplateBasicInfo } from "./work-order-template/template-basic-info"
import { TemplateEstimations } from "./work-order-template/template-estimations"
import { TemplateInstructions } from "./work-order-template/template-instructions"
import { TemplateResources } from "./work-order-template/template-resources"
import { TemplateCustomFields } from "./work-order-template/template-custom-fields"

interface WorkOrderTemplateFormProps {
  onSubmit: (data: WorkOrderTemplateFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<WorkOrderTemplateFormData>
  mode?: "create" | "edit"
}

export function WorkOrderTemplateForm({ 
  onSubmit, 
  onCancel, 
  loading, 
  initialData,
  mode = "create"
}: WorkOrderTemplateFormProps) {
  const form = useForm<WorkOrderTemplateFormData>({
    resolver: zodResolver(workOrderTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || null,
      category: initialData?.category || null,
      status: initialData?.status || "ACTIVE",
      estimatedDuration: initialData?.estimatedDuration || null,
      estimatedCost: initialData?.estimatedCost || null,
      instructions: initialData?.instructions || null,
      safetyNotes: initialData?.safetyNotes || null,
      tools: initialData?.tools || [],
      materials: initialData?.materials || [],
      customFields: initialData?.customFields || null
    }
  })

  const handleSubmit = (data: WorkOrderTemplateFormData) => {
    // Clean up custom fields if empty
    const processedData = {
      ...data,
      customFields: data.customFields && data.customFields.fields?.length ? data.customFields : null
    }
    onSubmit(processedData)
  }

  const title = mode === "create" ? "Crear Template de Orden de Trabajo" : "Editar Template de Orden de Trabajo"
  const submitLabel = mode === "create" ? "Crear Template" : "Guardar Cambios"

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            {mode === "create" 
              ? "Configure un template para estandarizar órdenes de trabajo"
              : "Modifique la configuración del template"
            }
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TemplateBasicInfo form={form} />
            </CardContent>
          </Card>

          {/* Estimaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Estimaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TemplateEstimations form={form} />
            </CardContent>
          </Card>


          {/* Instrucciones y Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle>Instrucciones y Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TemplateInstructions form={form} />
            </CardContent>
          </Card>

          {/* Herramientas y Materiales */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos Necesarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TemplateResources form={form} />
            </CardContent>
          </Card>

          {/* Campos Personalizados */}
          <Card>
            <CardHeader>
              <CardTitle>Campos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateCustomFields form={form} />
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardContent className="pt-6">
              <Separator className="mb-6" />
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitLabel}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}