import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Alert } from "@/components/alerts/alert-detail-types"

export function useAlertDetail(alertId: string) {
  const router = useRouter()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchAlert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertId])

  const fetchAlert = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/alerts/${alertId}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Alerta no encontrada")
          router.push("/alerts")
          return
        }
        throw new Error('Error fetching alert')
      }
      
      const data = await response.json()
      setAlert(data)
    } catch (error) {
      console.error('Error fetching alert:', error)
      toast.error("Error al cargar la alerta")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!alert) return
    
    try {
      setUpdatingStatus(true)
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Error updating status')

      const updatedAlert = await response.json()
      setAlert(updatedAlert)
      toast.success("Estado actualizado correctamente")
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error("Error al actualizar el estado")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const addComment = async (content: string) => {
    if (!alert) return

    const response = await fetch(`/api/alerts/${alert.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })

    if (!response.ok) throw new Error('Error adding comment')

    // Refresh the alert to get updated comments
    await fetchAlert()
    toast.success("Comentario agregado")
  }

  return {
    alert,
    loading,
    updatingStatus,
    updateStatus,
    addComment,
    refetch: fetchAlert
  }
}