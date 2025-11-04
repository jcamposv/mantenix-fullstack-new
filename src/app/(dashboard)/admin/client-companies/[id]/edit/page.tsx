"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ClientCompanyForm } from "@/components/forms/client-company/client-company-form"
import { toast } from "sonner"
import { FormSkeleton } from "@/components/skeletons"

export default function EditClientCompanyPage() {
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    fetchClientCompany()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchClientCompany = async () => {
    try {
      const response = await fetch(`/api/admin/client-companies/${id}`)
      if (response.ok) {
        const data = await response.json()
        setInitialData(data)
      } else {
        const error = await response.json()
        console.error('Error fetching client company:', error)
        toast.error(error.error || 'Error al cargar los datos de la empresa cliente')
        router.push('/admin/client-companies')
      }
    } catch (error) {
      console.error('Error fetching client company:', error)
      toast.error('Error al cargar los datos de la empresa cliente')
      router.push('/admin/client-companies')
    } finally {
      setIsLoading(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/client-companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Empresa cliente actualizada exitosamente')
        router.push('/admin/client-companies')
      } else {
        const error = await response.json()
        console.error('Error updating client company:', error)
        toast.error(error.error || 'Error al actualizar la empresa cliente')
      }
    } catch (error) {
      console.error('Error updating client company:', error)
      toast.error('Error al actualizar la empresa cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-0">
        <FormSkeleton fields={6} showTitle={true} showFooter={true} />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-0">
        <div className="text-center">
          <p className="text-muted-foreground">No se pudieron cargar los datos de la empresa cliente.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-0">
      <ClientCompanyForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData}
      />
    </div>
  )
}