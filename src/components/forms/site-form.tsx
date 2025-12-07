"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { siteSchema, type SiteFormData } from "@/schemas/site"
import { SiteBasicInfo } from "./site/site-basic-info"
import { SiteContactInfo } from "./site/site-contact-info"
import { SiteLocationInfo } from "./site/site-location-info"
import { useClientCompanies } from "@/hooks/useClientCompanies"

interface SiteFormProps {
  onSubmit: (data: SiteFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<SiteFormData>
}

export function SiteForm({ onSubmit, onCancel, loading, initialData }: SiteFormProps) {
  // Use centralized useClientCompanies hook with SWR
  const { clientCompanies, loading: loadingClientCompanies } = useClientCompanies()

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: initialData?.name || "",
      clientCompanyId: initialData?.clientCompanyId || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      contactName: initialData?.contactName || "",
      latitude: initialData?.latitude || "",
      longitude: initialData?.longitude || "",
      timezone: initialData?.timezone || "UTC",
      notes: initialData?.notes || "",
    },
  })

  const handleSubmit = (data: SiteFormData) => {
    onSubmit(data)
  }

  return (
    <Card className="w-full shadow-none border-none mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Sede" : "Crear Nueva Sede"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <SiteBasicInfo 
              control={form.control} 
              clientCompanies={clientCompanies}
              loadingClientCompanies={loadingClientCompanies}
            />
            
            <SiteContactInfo control={form.control} />
            
            <SiteLocationInfo control={form.control} />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (initialData ? "Actualizando..." : "Creando...")
                  : (initialData ? "Actualizar Sede" : "Crear Sede")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}