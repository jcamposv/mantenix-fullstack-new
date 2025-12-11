"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CAPActionForm } from "@/components/workflow/cap-action-form"
import { toast } from "sonner"

export default function NewCAPActionPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cap-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Acción CAPA creada exitosamente')
        router.push('/quality/cap-actions')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear la acción CAPA')
      }
    } catch (error) {
      console.error('Error creating CAP action:', error)
      toast.error('Error al crear la acción CAPA')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <CAPActionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}
