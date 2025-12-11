"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createRootCauseAnalysisSchema, type RootCauseAnalysisFormData, RCA_TYPES, getRCATypeLabel } from "@/schemas/root-cause-analysis.schema"

type WhyFieldName = "why1" | "why2" | "why3" | "why4" | "why5"

interface RootCauseAnalysisFormProps {
  onSubmit: (data: RootCauseAnalysisFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<RootCauseAnalysisFormData>
  defaultWorkOrderId?: string
}

export function RootCauseAnalysisForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
  defaultWorkOrderId
}: RootCauseAnalysisFormProps) {
  const [workOrders, setWorkOrders] = useState<Array<{ id: string; code: string; title: string }>>([])
  const [assets, setAssets] = useState<Array<{ id: string; code: string; name: string }>>([])
  const [loadingData, setLoadingData] = useState(true)

  const form = useForm<RootCauseAnalysisFormData>({
    resolver: zodResolver(createRootCauseAnalysisSchema),
    defaultValues: {
      workOrderId: defaultWorkOrderId || initialData?.workOrderId || "",
      assetId: initialData?.assetId,
      analysisType: initialData?.analysisType || "FIVE_WHY",
      failureMode: initialData?.failureMode || "",
      immediateSymptom: initialData?.immediateSymptom || "",
      why1: initialData?.why1,
      why2: initialData?.why2,
      why3: initialData?.why3,
      why4: initialData?.why4,
      why5: initialData?.why5,
      rootCause: initialData?.rootCause
    }
  })

  const selectedAnalysisType = form.watch("analysisType")

  useEffect(() => {
    Promise.all([
      !defaultWorkOrderId ? fetchWorkOrders() : Promise.resolve(),
      fetchAssets()
    ]).finally(() => setLoadingData(false))
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
    }
  }

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/admin/assets?limit=100")
      if (response.ok) {
        const data = await response.json()
        setAssets(data.items || [])
      }
    } catch (error) {
      console.error("Error fetching assets:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {initialData ? "Editar Análisis de Causa Raíz" : "Crear Análisis de Causa Raíz (RCA)"}
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
                name="assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activo (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un activo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.code} - {asset.name}
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
                name="analysisType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Análisis *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RCA_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {getRCATypeLabel(type)}
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
                name="failureMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modo de Falla *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Motor no arranca" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="immediateSymptom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Síntoma Inmediato *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describa qué se observó inicialmente..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {selectedAnalysisType === "FIVE_WHY" && (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Análisis 5-Why</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([1, 2, 3, 4, 5] as const).map((num) => {
                  const fieldName: WhyFieldName = `why${num}` as WhyFieldName
                  return (
                    <FormField
                      key={num}
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Por qué {num}?</FormLabel>
                        <FormControl>
                          <Textarea placeholder={`Respuesta al por qué ${num}...`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                  )
                })}

                <FormField
                  control={form.control}
                  name="rootCause"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Causa Raíz Identificada</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Conclusión del análisis..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? "Guardando..." : initialData ? "Actualizar RCA" : "Crear RCA"}
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
