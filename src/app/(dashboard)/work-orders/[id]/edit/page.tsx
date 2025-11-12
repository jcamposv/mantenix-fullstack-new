"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { WorkOrderForm } from "@/components/work-orders/work-order-form"
import { WorkOrderFormAdvanced } from "@/components/work-orders/work-order-form-advanced"
import { updateWorkOrderSchema } from "@/schemas/work-order"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { CreateWorkOrderData, UpdateWorkOrderData, WorkOrderWithRelations } from "@/types/work-order.types"
import type { WorkOrderTemplateWithRelations } from "@/types/work-order-template.types"
import { FormSkeleton } from "@/components/skeletons"

interface Site {
  id: string
  name: string
}

interface Asset {
  id: string
  name: string
  code: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function EditWorkOrderPage() {
  const router = useRouter()
  const params = useParams()
  const { user: currentUser } = useCurrentUser()
  const [workOrder, setWorkOrder] = useState<WorkOrderWithRelations | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [templates, setTemplates] = useState<WorkOrderTemplateWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<UpdateWorkOrderData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(updateWorkOrderSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      type: "PREVENTIVO",
      priority: "MEDIUM",
      siteId: "",
      assetId: "",
      templateId: "",
      customFieldValues: {},
      scheduledDate: undefined,
      estimatedDuration: undefined,
      estimatedCost: undefined,
      instructions: "",
      safetyNotes: "",
      tools: [],
      materials: []
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch work order, sites, assets, users, and templates in parallel
        const [workOrderRes, sitesRes, assetsRes, usersRes, templatesRes] = await Promise.all([
          fetch(`/api/work-orders/${params.id}`),
          fetch("/api/admin/sites"),
          fetch("/api/admin/assets"),
          fetch("/api/admin/users"),
          fetch("/api/work-order-templates")
        ])

        if (!workOrderRes.ok) {
          const error = await workOrderRes.json()
          throw new Error(error.error || 'Error al cargar la orden de trabajo')
        }

        const workOrderData = await workOrderRes.json()
        const workOrder = workOrderData.workOrder as WorkOrderWithRelations

        // Set work order data
        setWorkOrder(workOrder)

        // Load other data if responses are successful
        if (sitesRes.ok) {
          const sitesData = await sitesRes.json()
          setSites(sitesData.sites || [])
        }

        if (assetsRes.ok) {
          const assetsData = await assetsRes.json()
          setAssets(assetsData.assets || [])
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.users || [])
        }

        if (templatesRes.ok) {
          const templatesData = await templatesRes.json()
          setTemplates(templatesData.templates || [])
        }

        // Set form values with work order data
        form.reset({
          title: workOrder.title || "",
          description: workOrder.description || "",
          type: workOrder.type,
          priority: workOrder.priority || "MEDIUM",
          siteId: workOrder.siteId || "",
          assetId: workOrder.assetId || "",
          templateId: workOrder.templateId || "",
          customFieldValues: (workOrder.customFieldValues || {}) as Record<string, unknown>,
          scheduledDate: workOrder.scheduledDate ? new Date(workOrder.scheduledDate) : undefined,
          estimatedDuration: workOrder.estimatedDuration || undefined,
          estimatedCost: workOrder.estimatedCost || undefined,
          instructions: workOrder.instructions || "",
          safetyNotes: workOrder.safetyNotes || "",
          tools: workOrder.tools || [],
          materials: workOrder.materials || []
        })

      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error(error instanceof Error ? error.message : 'Error al cargar los datos')
        router.push('/work-orders')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, router, form])

  const onSubmit = async (data: UpdateWorkOrderData) => {
    if (!workOrder) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/work-orders/${workOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar la orden de trabajo')
      }

      toast.success('Orden de trabajo actualizada exitosamente')
      router.push(`/work-orders/${workOrder.id}`)
    } catch (error) {
      console.error('Error updating work order:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la orden de trabajo')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-0 max-w-4xl">
        <FormSkeleton fields={8} showTitle={true} showFooter={true} />
      </div>
    )
  }

  if (!workOrder) {
    return null
  }

  return (
    <div className="py-6">
      <div className="mb-6">  
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Editar Orden de Trabajo</h1>
            <p className="text-muted-foreground">{workOrder.number} - {workOrder.title}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <WorkOrderForm
            form={form as unknown as UseFormReturn<CreateWorkOrderData>}
            sites={sites}
            assets={assets}
            templates={templates}
            isEditing={true}
            canChangeTemplate={
              workOrder.status !== "COMPLETED" &&
              !!currentUser?.role &&
              (currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN_EMPRESA" || currentUser.role === "SUPERVISOR")
            }
            initialData={{
              templateId: workOrder.templateId || ""
            }}
          />

          <WorkOrderFormAdvanced
            form={form as unknown as UseFormReturn<CreateWorkOrderData>}
            users={users}
          />

    <div className="flex justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
        </form>
      </Form>
    </div>
  )
}