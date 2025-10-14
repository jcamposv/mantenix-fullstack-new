"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { SiteForm } from "@/components/forms/site-form"
import { toast } from "sonner"

export default function EditSitePage() {
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    fetchSite()
  }, [id])

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/admin/sites/${id}`)
      if (response.ok) {
        const data = await response.json()
        setInitialData({
          name: data.name,
          clientCompanyId: data.clientCompany.id,
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          contactName: data.contactName || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          timezone: data.timezone || "UTC",
          notes: data.notes || "",
        })
      } else {
        const error = await response.json()
        console.error('Error fetching site:', error)
        toast.error(error.error || 'Error al cargar los datos de la sede')
        router.push('/admin/sites')
      }
    } catch (error) {
      console.error('Error fetching site:', error)
      toast.error('Error al cargar los datos de la sede')
      router.push('/admin/sites')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando datos de la sede...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-muted-foreground">No se pudieron cargar los datos de la sede.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <SiteForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData}
      />
    </div>
  )
}