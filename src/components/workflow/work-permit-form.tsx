"use client"

import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createWorkPermitSchema, type WorkPermitFormData } from "@/schemas/work-permit.schema"
import { WorkPermitBasicInfo } from "./work-permit/work-permit-basic-info"
import { WorkPermitSafetyInfo } from "./work-permit/work-permit-safety-info"

interface WorkPermitFormProps {
  onSubmit: (data: WorkPermitFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<WorkPermitFormData>
  defaultWorkOrderId?: string
}

export function WorkPermitForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
  defaultWorkOrderId
}: WorkPermitFormProps) {
  const [workOrders, setWorkOrders] = useState<Array<{ id: string; code: string; title: string }>>([])
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(true)

  const form = useForm<WorkPermitFormData>({
    resolver: zodResolver(createWorkPermitSchema) as Resolver<WorkPermitFormData>,
    defaultValues: {
      workOrderId: defaultWorkOrderId || initialData?.workOrderId || "",
      permitType: initialData?.permitType || "GENERAL",
      validFrom: initialData?.validFrom || new Date(),
      validUntil: initialData?.validUntil || new Date(),
      location: initialData?.location || "",
      hazards: initialData?.hazards || [],
      precautions: initialData?.precautions || [],
      ppe: initialData?.ppe || [],
      emergencyContact: initialData?.emergencyContact || ""
    }
  })

  // Watch form arrays
  const watchedHazards = form.watch("hazards") || []
  const watchedPrecautions = form.watch("precautions") || []
  const watchedPPE = form.watch("ppe") || []

  // Handlers for array updates
  const handleHazardsChange = (value: string[]) => {
    form.setValue("hazards", value, { shouldValidate: true })
  }

  const handlePrecautionsChange = (value: string[]) => {
    form.setValue("precautions", value, { shouldValidate: true })
  }

  const handlePPEChange = (value: string[]) => {
    form.setValue("ppe", value, { shouldValidate: true })
  }

  useEffect(() => {
    if (!defaultWorkOrderId) {
      fetchWorkOrders()
    } else {
      setLoadingWorkOrders(false)
    }
  }, [defaultWorkOrderId])

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch("/api/work-orders?limit=100")
      if (response.ok) {
        const data = await response.json()
        setWorkOrders(data.items || [])
      }
    } catch (error) {
      console.error("Error fetching work orders:", error)
    } finally {
      setLoadingWorkOrders(false)
    }
  }

  const isLoading = loadingWorkOrders || loading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {initialData ? "Editar Permiso de Trabajo" : "Crear Permiso de Trabajo"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkPermitBasicInfo
                form={form}
                workOrders={workOrders}
                loadingWorkOrders={loadingWorkOrders}
                defaultWorkOrderId={defaultWorkOrderId}
              />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Análisis de Riesgos</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkPermitSafetyInfo
                form={form}
                hazards={watchedHazards}
                setHazards={handleHazardsChange}
                precautions={watchedPrecautions}
                setPrecautions={handlePrecautionsChange}
                ppe={watchedPPE}
                setPPE={handlePPEChange}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : initialData ? "Actualizar Permiso" : "Crear Permiso"}
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
