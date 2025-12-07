"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { WorkOrderForm } from "@/components/work-orders/work-order-form"
import { WorkOrderFormAdvanced } from "@/components/work-orders/work-order-form-advanced"
import { createWorkOrderSchema } from "@/schemas/work-order"
import type { CreateWorkOrderData } from "@/types/work-order.types"
import { useCompanyFeatures } from "@/hooks/useCompanyFeatures"
import { useUsers } from "@/hooks/useUsers"
import { useSites } from "@/hooks/useSites"
import { useAssets } from "@/hooks/useAssets"
import { useWorkOrderTemplates } from "@/hooks/useWorkOrderTemplates"
import { useActivePrefixes } from "@/hooks/useWorkOrderPrefixes"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function NewWorkOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('templateId')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Get company features to determine if external client management is enabled
  const { hasExternalClientMgmt } = useCompanyFeatures()

  // Use all optimized hooks with SWR
  const { users } = useUsers()
  const { sites } = useSites()
  const { assets } = useAssets()
  const { templates } = useWorkOrderTemplates()
  const { prefixes } = useActivePrefixes()

  const form = useForm<CreateWorkOrderData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createWorkOrderSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      type: "PREVENTIVO",
      priority: "MEDIUM",
      siteId: "",
      assetId: "",
      templateId: templateId || "",
      customFieldValues: {},
      instructions: "",
      safetyNotes: "",
      tools: [],
      materials: [],
      assignedUserIds: []
    }
  })

  // Auto-populate title from template if available
  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        if (template.name && !form.getValues("title")) {
          form.setValue("title", template.name)
        }
      }
    }
  }, [templateId, templates, form])

  const handleSubmit = async (data: CreateWorkOrderData): Promise<void> => {
    try {
      setLoading(true)

      const response = await fetch('/api/work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear la orden de trabajo')
      }

      const result = await response.json()
      toast.success(result.message || 'Orden de trabajo creada exitosamente')
      router.push('/work-orders')
    } catch (error) {
      console.error('Error creating work order:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la orden de trabajo')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFromTemplate = async () => {
    const templateId = form.getValues("templateId")
    if (!templateId) {
      toast.error("Selecciona un template primero")
      return
    }

    try {
      setLoading(true)

      const formData = form.getValues()
      const response = await fetch('/api/work-orders/from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          title: formData.title,
          description: formData.description,
          siteId: formData.siteId,
          assetId: formData.assetId,
          scheduledDate: formData.scheduledDate,
          assignedUserIds: formData.assignedUserIds,
          customFieldValues: formData.customFieldValues,
          priority: formData.priority,
          instructions: formData.instructions,
          safetyNotes: formData.safetyNotes,
          tools: formData.tools,
          materials: formData.materials
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear la orden desde template')
      }

      const result = await response.json()
      toast.success(result.message || 'Orden de trabajo creada desde template exitosamente')
      router.push('/work-orders')
    } catch (error) {
      console.error('Error creating work order from template:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la orden desde template')
    } finally {
      setLoading(false)
    }
  }

  const isBasicFormValid = () => {
    const { title, type, siteId, assignedUserIds } = form.getValues()
    // If EXTERNAL_CLIENT_MANAGEMENT is enabled, siteId is required
    // Otherwise, only title, type, and assignedUserIds are required
    if (hasExternalClientMgmt) {
      return title && type && siteId && assignedUserIds?.length > 0
    }
    return title && type && assignedUserIds?.length > 0
  }

  return (
    <div className=" mx-auto py-6">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold">Nueva Orden de Trabajo</h1>
          <p className="text-muted-foreground">
            {templateId 
              ? "Crear orden de trabajo usando template seleccionado"
              : "Crear una nueva orden de trabajo para mantenimiento"
            }
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {templateId ? (
            <>
              <WorkOrderForm
                form={form}
                sites={sites}
                assets={assets}
                templates={templates}
                prefixes={prefixes}
              />

              <WorkOrderFormAdvanced
                form={form}
                users={users}
              />

              <div className="flex justify-between">
                <div className="flex gap-2">
                  {form.getValues("templateId") && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCreateFromTemplate}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Crear desde Template
                    </Button>
                  )}
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Orden de Trabajo
                </Button>
              </div>
            </>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="advanced" disabled={!isBasicFormValid()}>
                  Detalles Avanzados
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <WorkOrderForm
                  form={form}
                  sites={sites}
                  assets={assets}
                  templates={templates}
                  prefixes={prefixes}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("advanced")}
                    disabled={!isBasicFormValid()}
                  >
                    Crear Orden de Trabajo
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <WorkOrderFormAdvanced
                  form={form}
                  users={users}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("basic")}
                  >
                    Volver
                  </Button>
                  
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Orden de Trabajo
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </form>
      </Form>
    </div>
  )
}