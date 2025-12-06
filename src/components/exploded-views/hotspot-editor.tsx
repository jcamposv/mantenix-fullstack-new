/**
 * Hotspot Editor Component
 *
 * Interactive editor for managing hotspots on exploded view images.
 * Allows adding, editing, positioning, and deleting hotspots.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { SignedImage } from '@/components/signed-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  Plus,
  Trash2,
  Save,
  X,
  Move,
  MapPinned,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import type { ExplodedViewComponentWithRelations } from '@/types/exploded-view.types'

interface HotspotData {
  id?: string
  x: number
  y: number
  componentId: string
  customLabel?: string | null
  order: number
}

interface HotspotEditorProps {
  viewId: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  existingHotspots?: HotspotData[]
  onSave?: () => void
  onCancel?: () => void
}

/**
 * Hotspot Editor with drag-and-drop positioning
 */
export function HotspotEditor({
  viewId,
  imageUrl,
  imageWidth,
  imageHeight,
  existingHotspots = [],
  onSave,
  onCancel,
}: HotspotEditorProps) {
  const [hotspots, setHotspots] = useState<HotspotData[]>(existingHotspots)
  const [selectedHotspotIndex, setSelectedHotspotIndex] = useState<number | null>(null)
  const [components, setComponents] = useState<ExplodedViewComponentWithRelations[]>([])
  const [loadingComponents, setLoadingComponents] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hotspotToDelete, setHotspotToDelete] = useState<number | null>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Fetch available components
  useEffect(() => {
    fetchComponents()
  }, [])

  // Calculate scale based on container size
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        // Scale down if image is larger than container
        if (imageWidth > containerWidth) {
          setScale(containerWidth / imageWidth)
        } else {
          setScale(1)
        }
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [imageWidth])

  const fetchComponents = async () => {
    try {
      setLoadingComponents(true)
      const response = await fetch('/api/exploded-view-components?limit=1000&isActive=true')
      if (response.ok) {
        const data = await response.json()
        setComponents(data.items || [])
        toast.success(`${data.items?.length || 0} componentes cargados`)
      }
    } catch (error) {
      console.error('Error fetching components:', error)
      toast.error('Error al cargar los componentes')
    } finally {
      setLoadingComponents(false)
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingIndex !== null) return // Don't add if dragging

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    // Create new hotspot at clicked position
    const newHotspot: HotspotData = {
      x,
      y,
      componentId: components[0]?.id || '',
      customLabel: null,
      order: hotspots.length + 1,
    }

    setHotspots([...hotspots, newHotspot])
    setSelectedHotspotIndex(hotspots.length)
    toast.success('Hotspot agregado. Selecciona un componente.')
  }

  const handleHotspotMouseDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggingIndex(index)
    setSelectedHotspotIndex(index)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingIndex === null || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(imageWidth, (e.clientX - rect.left) / scale))
    const y = Math.max(0, Math.min(imageHeight, (e.clientY - rect.top) / scale))

    const updatedHotspots = [...hotspots]
    updatedHotspots[draggingIndex] = {
      ...updatedHotspots[draggingIndex],
      x,
      y,
    }
    setHotspots(updatedHotspots)
  }

  const handleMouseUp = () => {
    setDraggingIndex(null)
  }

  const updateHotspot = (index: number, updates: Partial<HotspotData>) => {
    const updatedHotspots = [...hotspots]
    updatedHotspots[index] = { ...updatedHotspots[index], ...updates }
    setHotspots(updatedHotspots)
  }

  const handleDeleteClick = (index: number) => {
    setHotspotToDelete(index)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (hotspotToDelete !== null) {
      const updatedHotspots = hotspots.filter((_, i) => i !== hotspotToDelete)
      // Reorder remaining hotspots
      updatedHotspots.forEach((h, i) => {
        h.order = i + 1
      })
      setHotspots(updatedHotspots)
      setSelectedHotspotIndex(null)
      setHotspotToDelete(null)
      setDeleteDialogOpen(false)
      toast.success('Hotspot eliminado')
    }
  }

  const handleSave = async () => {
    // Validate all hotspots have components
    const invalidHotspots = hotspots.filter(h => !h.componentId)
    if (invalidHotspots.length > 0) {
      toast.error('Todos los hotspots deben tener un componente asignado')
      return
    }

    try {
      setSaving(true)

      // Delete existing hotspots
      const deletePromises = existingHotspots
        .filter(existing => existing.id)
        .map(existing =>
          fetch(`/api/exploded-views/hotspots/${existing.id}`, {
            method: 'DELETE',
          })
        )

      await Promise.all(deletePromises)

      // Create new hotspots
      const createPromises = hotspots.map(hotspot =>
        fetch(`/api/exploded-views/${viewId}/hotspots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            componentId: hotspot.componentId,
            label: hotspot.customLabel || `Hotspot ${hotspot.order}`,
            coordinates: {
              x: hotspot.x,
              y: hotspot.y,
              radius: 12, // Default radius for circle hotspots
            },
            type: 'circle',
            order: hotspot.order,
          }),
        })
      )

      const responses = await Promise.all(createPromises)
      const allSuccess = responses.every(r => r.ok)

      if (allSuccess) {
        toast.success('Hotspots guardados exitosamente')
        onSave?.()
      } else {
        throw new Error('Error al guardar algunos hotspots')
      }
    } catch (error) {
      console.error('Error saving hotspots:', error)
      toast.error('Error al guardar los hotspots')
    } finally {
      setSaving(false)
    }
  }

  const scaledWidth = imageWidth * scale
  const scaledHeight = imageHeight * scale
  const selectedHotspot = selectedHotspotIndex !== null ? hotspots[selectedHotspotIndex] : null
  const selectedComponent = components.find(c => c.id === selectedHotspot?.componentId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Editor Canvas */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Editor de Hotspots</CardTitle>
            <CardDescription>
              Haz clic en la imagen para agregar hotspots. Arrastra para moverlos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref={containerRef}
              className="relative border rounded-lg overflow-hidden bg-muted/20 cursor-crosshair w-full"
              style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Image */}
              <SignedImage
                src={imageUrl}
                alt="Exploded view"
                width={imageWidth}
                height={imageHeight}
                className="w-full h-full object-contain pointer-events-none"
                onLoad={() => setImageLoaded(true)}
                draggable={false}
              />

              {/* Hotspots */}
              {imageLoaded && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${imageWidth} ${imageHeight}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {hotspots.map((hotspot, index) => {
                    const isSelected = selectedHotspotIndex === index
                    const isDragging = draggingIndex === index

                    return (
                      <g key={index}>
                        {/* Hotspot Circle */}
                        <circle
                          cx={hotspot.x}
                          cy={hotspot.y}
                          r={isSelected || isDragging ? 18 : 14}
                          fill={isSelected ? '#3b82f6' : isDragging ? '#60a5fa' : '#ef4444'}
                          opacity={0.9}
                          className="pointer-events-auto cursor-move transition-all"
                          onMouseDown={(e) => handleHotspotMouseDown(index, e as unknown as React.MouseEvent)}
                          style={{
                            filter: isSelected || isDragging
                              ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))'
                              : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                          }}
                        />

                        {/* Order Number */}
                        <text
                          x={hotspot.x}
                          y={hotspot.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize={isSelected || isDragging ? '16' : '14'}
                          fontWeight="bold"
                          className="pointer-events-none select-none"
                        >
                          {hotspot.order}
                        </text>

                        {/* Drag Icon on Selected */}
                        {isSelected && (
                          <g transform={`translate(${hotspot.x}, ${hotspot.y - 35})`}>
                            <rect
                              x="-20"
                              y="-10"
                              width="40"
                              height="20"
                              fill="rgba(0, 0, 0, 0.8)"
                              rx="4"
                            />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize="10"
                              fontWeight="500"
                            >
                              Arrastrar
                            </text>
                          </g>
                        )}
                      </g>
                    )
                  })}
                </svg>
              )}

              {/* Loading State */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Haz clic en la imagen para agregar un hotspot</span>
              </div>
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4" />
                <span>Arrastra los hotspots para reposicionarlos</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4" />
                <span>Selecciona un hotspot para editar sus propiedades</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || hotspots.length === 0}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Hotspots
          </Button>
        </div>
      </div>

      {/* Hotspot Properties Panel */}
      <div className="space-y-4">
        {/* Selected Hotspot Editor */}
        {selectedHotspot && selectedHotspotIndex !== null ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Hotspot #{selectedHotspot.order}
              </CardTitle>
              <CardDescription>
                Configura las propiedades del hotspot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Component Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Componente *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fetchComponents}
                    disabled={loadingComponents}
                    className="h-6 px-2"
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingComponents ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <Select
                  value={selectedHotspot.componentId}
                  onValueChange={(value) =>
                    updateHotspot(selectedHotspotIndex, { componentId: value })
                  }
                  disabled={loadingComponents}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un componente" />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((component) => (
                      <SelectItem key={component.id} value={component.id}>
                        <div>
                          <div className="font-medium">{component.name}</div>
                          {component.partNumber && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {component.partNumber}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedComponent && (
                  <div className="text-xs text-muted-foreground">
                    {selectedComponent.manufacturer && (
                      <span>Fabricante: {selectedComponent.manufacturer}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Custom Label */}
              <div className="space-y-2">
                <Label>Etiqueta Personalizada</Label>
                <Input
                  placeholder="Ej: Motor principal"
                  value={selectedHotspot.customLabel || ''}
                  onChange={(e) =>
                    updateHotspot(selectedHotspotIndex, {
                      customLabel: e.target.value || null,
                    })
                  }
                />
              </div>

              {/* Position */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Posición X</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedHotspot.x)}
                    onChange={(e) =>
                      updateHotspot(selectedHotspotIndex, {
                        x: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Posición Y</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedHotspot.y)}
                    onChange={(e) =>
                      updateHotspot(selectedHotspotIndex, {
                        y: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Delete Button */}
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => handleDeleteClick(selectedHotspotIndex)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Hotspot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <MapPinned className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecciona o agrega un hotspot para editar sus propiedades</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hotspots List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Lista de Hotspots ({hotspots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hotspots.length > 0 ? (
              <div className="space-y-2">
                {hotspots.map((hotspot, index) => {
                  const component = components.find(c => c.id === hotspot.componentId)
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedHotspotIndex(index)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selectedHotspotIndex === index
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold shrink-0">
                        {hotspot.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {component?.name || 'Sin componente'}
                        </div>
                        {component?.partNumber && (
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {component.partNumber}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4 text-sm">
                No hay hotspots. Haz clic en la imagen para agregar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="¿Eliminar hotspot?"
        description="¿Estás seguro de eliminar este hotspot? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
