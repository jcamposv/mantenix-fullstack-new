"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { createLOTOProcedureSchema, type LOTOProcedureFormData } from "@/schemas/loto-procedure.schema"

interface LOTOProcedureFormProps {
  onSubmit: (data: LOTOProcedureFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<LOTOProcedureFormData>
  defaultWorkOrderId?: string
}

export function LOTOProcedureForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
  defaultWorkOrderId
}: LOTOProcedureFormProps) {
  const [workOrders, setWorkOrders] = useState<Array<{ id: string; code: string; title: string }>>([])
  const [assets, setAssets] = useState<Array<{ id: string; code: string; name: string }>>([])
  const [loadingData, setLoadingData] = useState(true)

  const form = useForm<LOTOProcedureFormData>({
    resolver: zodResolver(createLOTOProcedureSchema),
    defaultValues: {
      workOrderId: defaultWorkOrderId || initialData?.workOrderId || "",
      assetId: initialData?.assetId || "",
      isolationPoints: initialData?.isolationPoints || [],
      energySources: initialData?.energySources || [],
      lockSerialNumbers: initialData?.lockSerialNumbers || [],
      tagNumbers: initialData?.tagNumbers || []
    }
  })

  // Watch form arrays
  const watchedIsolationPoints = form.watch("isolationPoints") || []
  const watchedEnergySources = form.watch("energySources") || []
  const watchedLockSerials = form.watch("lockSerialNumbers") || []
  const watchedTagNumbers = form.watch("tagNumbers") || []

  // Input states for array fields
  const [isolationPointInput, setIsolationPointInput] = useState("")
  const [energySourceInput, setEnergySourceInput] = useState("")
  const [lockSerialInput, setLockSerialInput] = useState("")
  const [tagNumberInput, setTagNumberInput] = useState("")

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

  const addToArray = (fieldName: keyof Pick<LOTOProcedureFormData, "isolationPoints" | "energySources" | "lockSerialNumbers" | "tagNumbers">, value: string, currentArray: string[]) => {
    if (value.trim()) {
      form.setValue(fieldName, [...currentArray, value.trim()], { shouldValidate: true })
    }
  }

  const removeFromArray = (fieldName: keyof Pick<LOTOProcedureFormData, "isolationPoints" | "energySources" | "lockSerialNumbers" | "tagNumbers">, index: number, currentArray: string[]) => {
    form.setValue(fieldName, currentArray.filter((_, i) => i !== index), { shouldValidate: true })
  }

  const renderArrayInput = (
    fieldName: keyof Pick<LOTOProcedureFormData, "isolationPoints" | "energySources" | "lockSerialNumbers" | "tagNumbers">,
    label: string,
    items: string[],
    placeholder: string,
    inputValue: string,
    setInputValue: (value: string) => void,
    description?: string,
    required?: boolean
  ) => {
    return (
      <FormField
        control={form.control}
        name={fieldName}
        render={() => (
          <FormItem>
            <FormLabel>{label} {required && "*"}</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addToArray(fieldName, inputValue, items)
                    setInputValue("")
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  addToArray(fieldName, inputValue, items)
                  setInputValue("")
                }}
              >
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {items.map((item, index) => (
                <Badge key={index} variant="secondary">
                  {item}
                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeFromArray(fieldName, index, items)} />
                </Badge>
              ))}
            </div>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {initialData ? "Editar Procedimiento LOTO" : "Crear Procedimiento LOTO"}
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
                    <FormLabel>Activo *</FormLabel>
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

              {renderArrayInput(
                "isolationPoints",
                "Puntos de Aislamiento",
                watchedIsolationPoints,
                "Ej: Válvula principal sector A",
                isolationPointInput,
                setIsolationPointInput,
                "Especifique cada punto donde se aislará el equipo",
                true
              )}

              {renderArrayInput(
                "energySources",
                "Fuentes de Energía",
                watchedEnergySources,
                "Ej: Eléctrica 480V, Hidráulica, Neumática",
                energySourceInput,
                setEnergySourceInput,
                "Liste todas las fuentes de energía a aislar",
                true
              )}

              {renderArrayInput(
                "lockSerialNumbers",
                "Números de Serie de Candados",
                watchedLockSerials,
                "Ej: LOCK-001, LOCK-002",
                lockSerialInput,
                setLockSerialInput
              )}

              {renderArrayInput(
                "tagNumbers",
                "Números de Etiquetas",
                watchedTagNumbers,
                "Ej: TAG-001, TAG-002",
                tagNumberInput,
                setTagNumberInput
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear Procedimiento"}
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
