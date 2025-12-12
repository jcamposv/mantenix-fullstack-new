"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createJobSafetyAnalysisSchema, type JobSafetyAnalysisFormData } from "@/schemas/job-safety-analysis.schema"

interface JobSafetyAnalysisFormProps {
  onSubmit: (data: JobSafetyAnalysisFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<JobSafetyAnalysisFormData>
  defaultWorkOrderId?: string
}

export function JobSafetyAnalysisForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
  defaultWorkOrderId
}: JobSafetyAnalysisFormProps) {
  const [workOrders, setWorkOrders] = useState<Array<{ id: string; code: string; title: string }>>([])
  const [loadingData, setLoadingData] = useState(true)

  const form = useForm<JobSafetyAnalysisFormData>({
    resolver: zodResolver(createJobSafetyAnalysisSchema),
    defaultValues: {
      workOrderId: defaultWorkOrderId || initialData?.workOrderId || "",
      jobSteps: typeof initialData?.jobSteps === 'string' 
        ? initialData.jobSteps 
        : Array.isArray(initialData?.jobSteps)
        ? JSON.stringify(initialData.jobSteps, null, 2)
        : ""
    }
  })

  useEffect(() => {
    if (!defaultWorkOrderId) {
      fetchWorkOrders()
    } else {
      setLoadingData(false)
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
      setLoadingData(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {initialData ? "Editar Análisis de Seguridad" : "Crear Análisis de Seguridad (JSA)"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!defaultWorkOrderId && (
                <FormField
                  control={form.control}
                  name="workOrderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden de Trabajo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una OT" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workOrders.map((wo) => (
                            <SelectItem key={wo.id} value={wo.id}>
                              {wo.code} - {wo.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="jobSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pasos del Trabajo *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="1. Desenergizar equipo&#10;2. Aplicar LOTO&#10;3. Verificar ausencia de energía&#10;..."
                        className="min-h-[120px]"
                        value={typeof field.value === 'string' ? field.value : Array.isArray(field.value) ? JSON.stringify(field.value, null, 2) : ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? "Guardando..." : initialData ? "Actualizar JSA" : "Crear JSA"}
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
