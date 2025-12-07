"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { SiteForm } from "@/components/forms/site-form"
import { toast } from "sonner"
import type { SiteFormData } from "@/schemas/site"
import { FormSkeleton } from "@/components/skeletons"
import { useSite } from "@/hooks/useSite"

export default function EditSitePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // Use the new useSite hook with SWR
  const { site, loading: fetchLoading, error } = useSite(id)

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar los datos de la sede')
      router.push('/admin/sites')
    }
  }, [error, router])

  // Transform site data to form format
  const initialData = useMemo<SiteFormData | null>(() => {
    if (!site) return null

    return {
      name: site.name,
      clientCompanyId: site.clientCompany.id,
      address: site.address || "",
      phone: site.phone || "",
      email: site.email || "",
      contactName: site.contactName || "",
      latitude: site.latitude?.toString() || "",
      longitude: site.longitude?.toString() || "",
      timezone: site.timezone || "UTC",
      notes: site.notes || "",
    }
  }, [site])

  const handleSubmit = async (data: SiteFormData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/sites/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Sede actualizada exitosamente')
        router.push('/admin/sites')
      } else {
        const error = await response.json()
        console.error('Error updating site:', error)
        toast.error(error.error || 'Error al actualizar la sede')
      }
    } catch (error) {
      console.error('Error updating site:', error)
      toast.error('Error al actualizar la sede')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (fetchLoading) {
    return (
      <div className="container mx-auto py-0">
        <FormSkeleton fields={7} showTitle={true} showFooter={true} />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-0">
        <div className="text-center">
          <p className="text-muted-foreground">No se pudieron cargar los datos de la sede.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-0">
      <SiteForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData}
      />
    </div>
  )
}