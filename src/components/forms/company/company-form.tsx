"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { companySchema, CompanyFormData, CompanySubmitData } from "@/schemas/company"
import { LogoUpload } from "../logo-upload"
import { CompanyBasicInfo } from "./company-basic-info"
import { CompanyTierSelection } from "./company-tier-selection"
import { CompanyColorCustomization } from "./company-color-customization"

interface CompanyFormProps {
  onSubmit: (data: CompanySubmitData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<CompanyFormData>
  mode?: "create" | "edit"
}

export function CompanyForm({ 
  onSubmit, 
  onCancel, 
  loading,
  initialData,
  mode = "create"
}: CompanyFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null)

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || "",
      subdomain: initialData?.subdomain || "",
      tier: initialData?.tier || "STARTER",
      planId: initialData?.planId || "",
      primaryColor: initialData?.primaryColor || "#3b82f6",
      secondaryColor: initialData?.secondaryColor || "#64748b",
      backgroundColor: initialData?.backgroundColor || "#ffffff",
      mfaEnforced: initialData?.mfaEnforced || false,
      logo: initialData?.logo || "",
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

  const handleSubmit = (data: CompanyFormData) => {
    onSubmit(data)
  }

  return (
    <Card className="w-full mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Editar Empresa" : "Crear Nueva Empresa"}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Información Básica */}
            <CompanyBasicInfo control={form.control} />

            {/* Selección de Plan */}
            <CompanyTierSelection control={form.control} />

            {/* Logo Upload */}
            <LogoUpload 
              value={logoPreview ?? undefined} 
              onChange={handleLogoChange}
              onRemove={handleLogoRemove}
            />

            {/* Personalización de Colores */}
            <CompanyColorCustomization control={form.control} />

            {/* Acciones */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (mode === "edit" ? "Actualizando..." : "Creando...")
                  : (mode === "edit" ? "Actualizar Empresa" : "Crear Empresa")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}