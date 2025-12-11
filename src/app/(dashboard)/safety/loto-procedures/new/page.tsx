"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LOTOProcedureForm } from "@/components/workflow/loto-procedure-form"
import { toast } from "sonner"

export default function NewLOTOProcedurePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/loto-procedures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Procedimiento LOTO creado exitosamente')
        router.push('/safety/loto-procedures')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear el procedimiento LOTO')
      }
    } catch (error) {
      console.error('Error creating LOTO procedure:', error)
      toast.error('Error al crear el procedimiento LOTO')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <LOTOProcedureForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}
