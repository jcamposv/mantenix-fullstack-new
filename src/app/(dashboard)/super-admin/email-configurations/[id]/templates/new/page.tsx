"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { EmailTemplateForm } from "@/components/forms/email-template/email-template-form"
import type { EmailTemplateSubmitData } from "@/schemas/email-template"
import { toast } from "sonner"

export default function NewEmailTemplatePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const configId = params.id as string

  const handleSubmit = async (data: EmailTemplateSubmitData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Template de email creado exitosamente')
        router.push(`/super-admin/email-configurations/${configId}/templates`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear el template')
      }
    } catch (error) {
      console.error('Error creating email template:', error)
      toast.error('Error al crear el template')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <EmailTemplateForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        emailConfigurationId={configId}
      />
    </div>
  )
}
