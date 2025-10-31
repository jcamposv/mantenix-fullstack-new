"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { EmailConfigurationForm } from "@/components/forms/email-configuration/email-configuration-form"
import type { EmailConfigurationSubmitData } from "@/schemas/email-configuration"
import { toast } from "sonner"
import { FormSkeleton } from "@/components/skeletons"

export default function EditEmailConfigurationPage() {
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<EmailConfigurationSubmitData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const router = useRouter()
  const params = useParams()
  const configId = params.id as string

  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const response = await fetch(`/api/admin/email-configurations/${configId}`)
        if (response.ok) {
          const data = await response.json()
          setInitialData(data)
        } else {
          toast.error('No se pudo cargar la configuración')
          router.push('/super-admin/email-configurations')
        }
      } catch (error) {
        console.error('Error fetching email configuration:', error)
        toast.error('Error al cargar la configuración')
        router.push('/super-admin/email-configurations')
      } finally {
        setLoadingData(false)
      }
    }

    fetchConfiguration()
  }, [configId, router])

  const handleSubmit = async (data: EmailConfigurationSubmitData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/email-configurations/${configId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Configuración actualizada exitosamente')
        router.push('/super-admin/email-configurations')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar la configuración')
      }
    } catch (error) {
      console.error('Error updating email configuration:', error)
      toast.error('Error al actualizar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (loadingData) {
    return (
      <div className="container mx-auto py-6">
        <FormSkeleton fields={6} showTitle={true} showFooter={true} />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <EmailConfigurationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData ?? undefined}
        mode="edit"
      />
    </div>
  )
}
