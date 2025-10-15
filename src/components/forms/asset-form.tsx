"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { assetSchema, type AssetFormData } from "@/schemas/asset"
import { AssetBasicInfo } from "./asset/asset-basic-info"
import { AssetTechnicalInfo } from "./asset/asset-technical-info"
import type { Resolver } from "react-hook-form"

interface Site {
  id: string
  name: string
  clientCompany?: {
    id: string
    name: string
  }
}


interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<AssetFormData>
  clientCompanyId?: string
  assetId?: string
}

export function AssetForm({ onSubmit, onCancel, loading, initialData, clientCompanyId = "temp", assetId = "new" }: AssetFormProps) {
  const [sites, setSites] = useState<Site[]>([])
  const [loadingSites, setLoadingSites] = useState(true)
  const [currentClientCompanyId, setCurrentClientCompanyId] = useState(clientCompanyId)

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      siteId: initialData?.siteId || "",
      images: initialData?.images || [],
      status: initialData?.status || "OPERATIVO",
      manufacturer: initialData?.manufacturer || "",
      model: initialData?.model || "",
      serialNumber: initialData?.serialNumber || "",
      purchaseDate: initialData?.purchaseDate || "",
      estimatedLifespan: initialData?.estimatedLifespan,
      category: initialData?.category || "",
    },
  })

  useEffect(() => {
    fetchSites()
  }, [])

  // Update clientCompanyId when siteId changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "siteId" && value.siteId) {
        const selectedSite = sites.find(site => site.id === value.siteId)
        if (selectedSite?.clientCompany?.id) {
          setCurrentClientCompanyId(selectedSite.clientCompany.id)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, sites])

  const fetchSites = async () => {
    try {
      setLoadingSites(true)
      const response = await fetch("/api/admin/sites")
      if (response.ok) {
        const data = await response.json()
        setSites(data.sites || data.items || data || [])
      }
    } catch (error) {
      console.error("Error fetching sites:", error)
    } finally {
      setLoadingSites(false)
    }
  }


  const handleSubmit = (data: AssetFormData) => {
    // Get the selected site to determine the correct clientCompanyId
    const selectedSite = sites.find(site => site.id === data.siteId)
    const actualClientCompanyId = selectedSite?.clientCompany?.id || clientCompanyId

    // Transform date strings to proper format for API
    const transformedData = {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
      // Pass the actual clientCompanyId for image path correction
      _clientCompanyId: actualClientCompanyId
    }
    onSubmit(transformedData)
  }

  const isLoading = loadingSites || loading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {initialData ? "Editar Activo" : "Crear Nuevo Activo"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetBasicInfo 
                  form={form} 
                  sites={sites}
                  loadingSites={loadingSites}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información Técnica</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetTechnicalInfo 
                  form={form} 
                  clientCompanyId={currentClientCompanyId}
                  assetId={assetId}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : initialData ? "Actualizar Activo" : "Crear Activo"}
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