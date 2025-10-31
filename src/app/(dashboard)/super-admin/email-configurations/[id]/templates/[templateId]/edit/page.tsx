"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { EmailTemplateForm } from "@/components/forms/email-template/email-template-form"
import type { EmailTemplateSubmitData } from "@/schemas/email-template"
import { toast } from "sonner"
import { FormSkeleton } from "@/components/skeletons"

export default function EditEmailTemplatePage() {
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<EmailTemplateSubmitData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const router = useRouter()
  const params = useParams()
  const configId = params.id as string
  const templateId = params.templateId as string

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/admin/email-templates/${templateId}`)
        if (response.ok) {
          const data = await response.json()
          setInitialData(data)
        } else {
          toast.error('No se pudo cargar el template')
          router.push(`/super-admin/email-configurations/${configId}/templates`)
        }
      } catch (error) {
        console.error('Error fetching email template:', error)
        toast.error('Error al cargar el template')
        router.push(`/super-admin/email-configurations/${configId}/templates`)
      } finally {
        setLoadingData(false)
      }
    }

    fetchTemplate()
  }, [templateId, configId, router])

  const handleSubmit = async (data: EmailTemplateSubmitData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Template actualizado exitosamente')
        router.push(`/super-admin/email-configurations/${configId}/templates`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar el template')
      }
    } catch (error) {
      console.error('Error updating email template:', error)
      toast.error('Error al actualizar el template')
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
        <FormSkeleton fields={4} showTitle={true} showFooter={true} />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <EmailTemplateForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData ?? undefined}
        emailConfigurationId={configId}
        mode="edit"
      />
    </div>
  )
}
