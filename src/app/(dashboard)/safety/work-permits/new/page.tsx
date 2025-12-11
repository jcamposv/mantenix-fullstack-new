"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { WorkPermitForm } from "@/components/workflow/work-permit-form"
import { toast } from "sonner"

export default function NewWorkPermitPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/work-permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Permiso de trabajo creado exitosamente')
        router.push('/safety/work-permits')
      } else {
        const error = await response.json()
        console.error('Error creating work permit:', error)
        toast.error(error.error || 'Error al crear el permiso de trabajo')
      }
    } catch (error) {
      console.error('Error creating work permit:', error)
      toast.error('Error al crear el permiso de trabajo')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <WorkPermitForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}
