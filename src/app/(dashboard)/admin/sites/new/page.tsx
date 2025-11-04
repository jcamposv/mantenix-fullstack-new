"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteForm } from "@/components/forms/site-form"
import { toast } from "sonner"

export default function NewSitePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Sede creada exitosamente')
        router.push('/admin/sites')
      } else {
        const error = await response.json()
        console.error('Error creating site:', error)
        toast.error(error.error || 'Error al crear la sede')
      }
    } catch (error) {
      console.error('Error creating site:', error)
      toast.error('Error al crear la sede')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <SiteForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}