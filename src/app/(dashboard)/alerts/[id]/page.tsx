"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertHeader } from "@/components/alerts/alert-header"
import { AlertStatusSelector } from "@/components/alerts/alert-status-selector"
import { AlertDetailsCard } from "@/components/alerts/alert-details-card"
import { AlertPeopleCard } from "@/components/alerts/alert-people-card"
import { AlertCommentsSection } from "@/components/alerts/alert-comments-section"
import { useAlertDetail } from "@/components/hooks/use-alert-detail"

interface AlertDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AlertDetailPage({ params }: AlertDetailPageProps) {
  const [alertId, setAlertId] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setAlertId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  const { alert, loading, updatingStatus, updateStatus, addComment } = useAlertDetail(alertId || "")

  if (!alertId || loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-40 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Alerta no encontrada</h1>
          <p className="text-gray-600 mt-2">La alerta que buscas no existe o ha sido eliminada.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <AlertHeader alert={alert} />
        
        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Control */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de la Alerta</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertStatusSelector
                  currentStatus={alert.status}
                  onStatusChange={updateStatus}
                  disabled={updatingStatus}
                />
              </CardContent>
            </Card>

            {/* Comments */}
            <AlertCommentsSection
              comments={alert.comments}
              onAddComment={addComment}
              loading={loading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AlertDetailsCard alert={alert} />
            <AlertPeopleCard alert={alert} />
          </div>
        </div>
      </div>
    </div>
  )
}