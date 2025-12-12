"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { JobSafetyAnalysisForm } from "@/components/workflow/job-safety-analysis-form"
import { toast } from "sonner"

export default function NewJobSafetyAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/job-safety-analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Análisis de Seguridad (JSA) creado exitosamente')
        router.push('/safety/job-safety-analyses')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear el JSA')
      }
    } catch (error) {
      console.error('Error creating JSA:', error)
      toast.error('Error al crear el JSA')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <JobSafetyAnalysisForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}
