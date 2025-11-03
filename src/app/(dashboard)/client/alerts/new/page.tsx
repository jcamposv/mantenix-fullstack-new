"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { ClientAlertForm } from "@/components/client/alert-form"
import type { AlertFormData } from "@/schemas/alert"

export default function NewClientAlertPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workOrderId = searchParams.get("workOrderId")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: AlertFormData) => {
    try {
      setLoading(true)

      const response = await fetch("/api/client/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear la alerta")
      }

      const result = await response.json()
      toast.success("Alerta creada exitosamente")
      router.push(`/client/alerts/${result.id}`)
    } catch (error) {
      console.error("Error creating alert:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear la alerta")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Alerta</h1>
        <p className="text-muted-foreground">
          Reporta un problema o incidencia que requiera atención
        </p>
      </div>

      <ClientAlertForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        workOrderId={workOrderId || undefined}
        loading={loading}
      />
    </div>
  )
}
