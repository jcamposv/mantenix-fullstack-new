"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ArrowLeft, FileText, Wrench, Package } from "lucide-react"
import { toast } from "sonner"
import { workOrderMobileSchema, WorkOrderMobileFormData } from "@/schemas/work-order-mobile"

interface Asset {
  id: string
  name: string
  code: string
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Baja", color: "text-blue-600" },
  { value: "MEDIUM", label: "Media", color: "text-yellow-600" },
  { value: "HIGH", label: "Alta", color: "text-orange-600" },
  { value: "URGENT", label: "Urgente", color: "text-red-600" },
]

const TYPE_OPTIONS = [
  { value: "CORRECTIVO", label: "Correctivo", description: "Reparar falla o problema" },
  { value: "PREVENTIVO", label: "Preventivo", description: "Mantenimiento programado" },
  { value: "REPARACION", label: "Reparación", description: "Reparación general" },
]

function MobileCreateWorkOrderPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedAssetId = searchParams.get('assetId')

  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<WorkOrderMobileFormData>({
    resolver: zodResolver(workOrderMobileSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "CORRECTIVO",
      priority: "MEDIUM",
      assetId: preselectedAssetId || undefined,
    },
  })

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/admin/assets')
      if (response.ok) {
        const data = await response.json()
        const assetsData = data.items || data
        setAssets(assetsData)

        // If preselected asset, find it and set it
        if (preselectedAssetId && assetsData.length > 0) {
          const selectedAsset = assetsData.find((a: Asset) => a.id === preselectedAssetId)
          if (selectedAsset) {
            form.setValue('assetId', selectedAsset.id)
          }
        }
      } else {
        toast.error('Error al cargar los activos')
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
      toast.error('Error al cargar los activos')
    } finally {
      setLoadingAssets(false)
    }
  }

  useEffect(() => {
    fetchAssets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (data: WorkOrderMobileFormData) => {
    try {
      setSubmitting(true)

      const response = await fetch('/api/work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          // Backend auto-asignará a JEFE_MANTENIMIENTO
          // No enviamos assignedUserIds para activar la lógica automática
        }),
      })

      if (response.ok) {
        toast.success('Orden de trabajo creada exitosamente')
        router.push('/mobile/assets')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear la orden de trabajo')
      }
    } catch (error) {
      console.error('Error creating work order:', error)
      toast.error('Error al crear la orden de trabajo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reportar Problema
          </h1>
          <p className="text-xs text-muted-foreground">
            Crear orden de trabajo rápida
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: Falla en motor principal"
                        className="h-12 text-base"
                      />
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
                    <FormLabel>Descripción del Problema *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe qué está fallando, síntomas, ruidos extraños, etc."
                        className="min-h-24 text-base"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tipo y Prioridad */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tipo y Prioridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Trabajo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="py-3">
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
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
                    <FormLabel>Prioridad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className={option.color}>{option.label}</span>
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

          {/* Máquina/Activo */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4" />
                Máquina Afectada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seleccionar Máquina (Opcional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value || undefined)}
                      value={field.value || undefined}
                      disabled={loadingAssets}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder={loadingAssets ? "Cargando..." : "Ninguna (problema general)"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} ({asset.code})
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

          {/* Botón de envío */}
          <div className="space-y-3">
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-base"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creando...
                </>
              ) : (
                <>
                  <Wrench className="w-5 h-5 mr-2" />
                  Crear Orden de Trabajo
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              La orden será asignada al Jefe de Mantenimiento para su revisión y asignación al técnico correspondiente
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default function MobileCreateWorkOrderPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 pb-6">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    }>
      <MobileCreateWorkOrderPageContent />
    </Suspense>
  )
}
