"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera, Upload, X, AlertCircle, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { alertSchema, AlertFormData, alertTypes, alertPriorities } from "@/schemas/alert"
import { useUserSites } from "@/hooks/useUserSites"

export default function CreateAlertPage() {
  const [images, setImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { sites, loading: sitesLoading, error: sitesError, needsSiteSelection, currentUserSiteId } = useUserSites()

  // Crear schema dinámico basado en si necesita selección de sede
  const dynamicSchema = React.useMemo(() => {
    return needsSiteSelection 
      ? alertSchema.extend({
          siteId: z.string().min(1, "Debe seleccionar una sede")
        })
      : alertSchema
  }, [needsSiteSelection])

  const form = useForm<AlertFormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      title: "",
      description: "",
      type: undefined,
      priority: undefined,
      location: "",
      equipmentId: "",
      estimatedResolutionTime: undefined,
      images: [],
      siteId: currentUserSiteId || undefined,
    },
  })

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', 'alert-image')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (response.ok) {
        const result = await response.json()
        const newImages = [...images, result.url]
        setImages(newImages)
        form.setValue('images', newImages)
        toast.success('Imagen subida exitosamente')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    form.setValue('images', newImages)
  }

  const handleSubmit = async (data: AlertFormData) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          images,
          // Solo incluir siteId si el usuario necesita selección (admin roles)
          // Para otros roles, el API usará automáticamente la sede del usuario
          ...(needsSiteSelection ? { siteId: data.siteId } : {})
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Alerta creada exitosamente')
        router.push(`/mobile/alerts/${result.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear la alerta')
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      toast.error('Error al crear la alerta')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 -mx-4 px-4 py-3 border-b bg-background sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-semibold">Crear Alerta</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Información básica */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selección de Sede (solo para ciertos roles) */}
            {needsSiteSelection && (
              <FormField
                control={form.control}
                name="siteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sede *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={sitesLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={sitesLoading ? "Cargando sedes..." : "Selecciona la sede"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sites.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{site.name}</span>
                              <span className="text-xs text-muted-foreground">{site.clientCompany.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {sitesError && <p className="text-sm text-destructive">{sitesError}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Aire acondicionado no enfría"
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe detalladamente el problema..."
                      maxLength={2000}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground text-right">
                    {field.value?.length || 0}/2000
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de alerta */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Problema *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de problema" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {alertTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prioridad */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la prioridad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {alertPriorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex flex-col">
                            <span className={`font-medium ${priority.color}`}>{priority.label}</span>
                            <span className="text-xs text-muted-foreground">{priority.description}</span>
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

        {/* Detalles adicionales */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Detalles Adicionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ubicación */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación Específica</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Sala de máquinas, Oficina 201"
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ID del equipo */}
            <FormField
              control={form.control}
              name="equipmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID/Código del Equipo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: AC-001, BOMBA-15"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tiempo estimado */}
            <FormField
              control={form.control}
              name="estimatedResolutionTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempo Estimado de Resolución (minutos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="60"
                      min="1"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Imágenes */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Imágenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botones de carga */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploadingImage}
                className="h-12 py-3 flex flex-col items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
              >
                <Camera className="w-5 h-5" />
                <span className="text-xs">Tomar Foto</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="h-12 py-3 flex flex-col items-center justify-center gap-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs">Subir Imagen</span>
              </Button>
            </div>

            {uploadingImage && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Subiendo imagen...</span>
              </div>
            )}

            {/* Preview de imágenes */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image}
                      alt={`Imagen ${index + 1}`}
                      width={200}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg border"
                      unoptimized
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Inputs de archivo ocultos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Botón de envío normal */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || uploadingImage}
            className="w-full h-12 text-base font-semibold shadow-lg transition-all duration-200"
            size="lg"
          >
            {form.formState.isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando Alerta...
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 mr-2" />
                Crear Alerta
              </>
            )}
          </Button>
        </div>
        </form>
      </Form>
    </div>
  )
}