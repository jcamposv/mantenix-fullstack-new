/**
 * Hotspots Editor Page
 *
 * Dedicated page for managing hotspots on an exploded view.
 * Provides interactive canvas for adding and positioning hotspots.
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Package } from "lucide-react"
import { toast } from "sonner"
import { HotspotEditor } from "@/components/exploded-views/hotspot-editor"
import type { AssetExplodedViewWithRelations } from "@/types/exploded-view.types"

export default function HotspotsEditorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [view, setView] = useState<AssetExplodedViewWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchView = async () => {
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

  const handleSave = () => {
    // Navigate back to detail page after saving
    router.push(`/admin/exploded-views/${id}`)
  }

  const handleCancel = () => {
    router.back()
  }

  if (loading || !view) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Hotspots</h1>
            <p className="text-muted-foreground mt-2">
              {view.name} - Configura los puntos interactivos
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open('/admin/exploded-view-components/new', '_blank')}
        >
          <Package className="mr-2 h-4 w-4" />
          Crear Componente
        </Button>
      </div>

      {/* Editor */}
      <HotspotEditor
        viewId={view.id}
        imageUrl={view.imageUrl}
        imageWidth={view.imageWidth}
        imageHeight={view.imageHeight}
        existingHotspots={
          view.hotspots?.map((h) => {
            // Extract x and y from coordinates based on type
            let x = 0
            let y = 0
            
            if ('x' in h.coordinates && 'y' in h.coordinates) {
              // Circle or Rectangle coordinates
              x = h.coordinates.x
              y = h.coordinates.y
            } else if ('points' in h.coordinates && h.coordinates.points.length > 0) {
              // Polygon coordinates - use first point
              x = h.coordinates.points[0].x
              y = h.coordinates.points[0].y
            }
            
            return {
              id: h.id,
              x,
              y,
              componentId: h.componentId,
              customLabel: h.label,
              order: h.order,
            }
          }) || []
        }
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
