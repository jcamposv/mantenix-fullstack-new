"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RootCauseAnalysisForm } from "@/components/workflow/root-cause-analysis-form"
import { toast } from "sonner"

export default function NewRootCauseAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/root-cause-analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Análisis de Causa Raíz creado exitosamente')
        router.push('/quality/root-cause-analyses')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear el RCA')
      }
    } catch (error) {
      console.error('Error creating RCA:', error)
      toast.error('Error al crear el RCA')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <RootCauseAnalysisForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}
