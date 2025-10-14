"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { clientCompanySchema, ClientCompanyFormData, ClientCompanySubmitData } from "@/schemas/client-company"
import { LogoUpload } from "../logo-upload"
import { CoordinateFields } from "../coordinate-fields"
import { ClientCompanyBasicInfo } from "./client-company-basic-info"
import { ClientCompanyContactInfo } from "./client-company-contact-info"
import { ClientCompanyAddressNotes } from "./client-company-address-notes"

interface ClientCompanyFormProps {
  onSubmit: (data: ClientCompanySubmitData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<ClientCompanySubmitData>
  mode?: "create" | "edit"
}

export function ClientCompanyForm({ 
  onSubmit, 
  onCancel, 
  loading, 
  initialData,
  mode = "create" 
}: ClientCompanyFormProps) {
  const { user: currentUser } = useCurrentUser()
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo ?? null)

  const form = useForm<ClientCompanyFormData>({
    resolver: zodResolver(clientCompanySchema),
    defaultValues: {
      name: initialData?.name || "",
      companyId: initialData?.companyId || "",
      logo: initialData?.logo || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      contactName: initialData?.contactName || "",
      latitude: initialData?.latitude !== undefined ? String(initialData.latitude) : "",
      longitude: initialData?.longitude !== undefined ? String(initialData.longitude) : "",
      notes: initialData?.notes || "",
    },
  })

  const handleLogoChange = (url: string) => {
    form.setValue('logo', url)
    setLogoPreview(url)
  }

  const handleLogoRemove = () => {
    form.setValue('logo', '')
    setLogoPreview(null)
  }

  const handleSubmit = (data: ClientCompanyFormData) => {
    // Transform string coordinates to numbers
    const submitData: ClientCompanySubmitData = {
      ...data,
      latitude: data.latitude && data.latitude !== "" ? Number(data.latitude) : undefined,
      longitude: data.longitude && data.longitude !== "" ? Number(data.longitude) : undefined,
    }
    onSubmit(submitData)
  }

  return (
    <Card className="w-full shadow-none border-none mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Editar Empresa Cliente" : "Crear Nueva Empresa Cliente"}
        </CardTitle>
        {currentUser?.role === "ADMIN_EMPRESA" && (
          <p className="text-sm text-muted-foreground">
            Esta empresa cliente será creada bajo su organización: {currentUser.company?.name}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Información Básica */}
            <ClientCompanyBasicInfo control={form.control} />

            {/* Logo Upload */}
            <LogoUpload 
              value={logoPreview ?? undefined} 
              onChange={handleLogoChange}
              onRemove={handleLogoRemove}
            />

            {/* Información de Contacto */}
            <ClientCompanyContactInfo control={form.control} />

            {/* Coordenadas */}
            <CoordinateFields control={form.control} />

            {/* Dirección y Notas */}
            <ClientCompanyAddressNotes control={form.control} />

            {/* Acciones */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (mode === "edit" ? "Actualizando..." : "Creando...")
                  : (mode === "edit" ? "Actualizar Empresa Cliente" : "Crear Empresa Cliente")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}