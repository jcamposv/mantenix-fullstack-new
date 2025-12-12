"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EmailConfigurationForm } from "@/components/forms/email-configuration/email-configuration-form"
import type { EmailConfigurationSubmitData } from "@/schemas/email-configuration"
import { toast } from "sonner"

export default function NewEmailConfigurationPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: EmailConfigurationSubmitData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/email-configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Configuración de email creada exitosamente')
        router.push('/super-admin/email-configurations')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear la configuración')
      }
    } catch (error) {
      console.error('Error creating email configuration:', error)
      toast.error('Error al crear la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <EmailConfigurationForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}
