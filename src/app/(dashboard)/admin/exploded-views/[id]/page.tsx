/**
 * Exploded View Detail Page
 *
 * Displays detailed information about an exploded view including hotspots.
 * Follows pattern from inventory items detail page.
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2, Image as ImageIcon, Settings } from "lucide-react"
import { toast } from "sonner"
import type { AssetExplodedViewWithRelations } from "@/types/exploded-view.types"
import { ExplodedViewViewer } from "@/components/exploded-views/exploded-view-viewer"

export default function ExplodedViewDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [view, setView] = useState<AssetExplodedViewWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchViewData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchViewData = async () => {
    try {
      const response = await fetch(`/api/exploded-views/${id}`)
      if (!response.ok) throw new Error('Error al cargar la vista explosionada')

      const data = await response.json()
      setView(data)
    } catch (error) {
      console.error('Error fetching view:', error)
      toast.error('Error al cargar la vista explosionada')
      router.push('/admin/exploded-views')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!view) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{view.name}</h2>
              <Badge variant={view.isActive ? "default" : "secondary"}>
                {view.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            {view.asset && (
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <ImageIcon className="h-4 w-4" />
                {view.asset.name} ({view.asset.code})
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/exploded-views/${id}/hotspots`)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Editar Hotspots
          </Button>
          <Button onClick={() => router.push(`/admin/exploded-views/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Vista
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="w-full shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Orden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{view.order}</div>
            <p className="text-xs text-muted-foreground mt-1">Posición en lista</p>
          </CardContent>
        </Card>

        <Card className="w-full shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hotspots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{view._count?.hotspots || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Puntos interactivos</p>
          </CardContent>
        </Card>

        <Card className="w-full shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dimensiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{view.imageWidth} × {view.imageHeight}</div>
            <p className="text-xs text-muted-foreground mt-1">Píxeles</p>
          </CardContent>
        </Card>
      </div>

      {/* Basic Info Card */}
      <Card className="w-full shadow-none">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {view.description && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Descripción</div>
              <div className="mt-1">{view.description}</div>
            </div>
          )}
          {view.asset && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">Activo Asociado</div>
              <div className="mt-1">
                <div className="font-medium">{view.asset.name}</div>
                <div className="text-sm text-muted-foreground">{view.asset.code}</div>
              </div>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-muted-foreground">Estado</div>
            <div className="mt-1">
              <Badge variant={view.isActive ? "default" : "secondary"}>
                {view.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Viewer */}
      <ExplodedViewViewer view={view} />
    </div>
  )
}
