/**
 * Exploded View Viewer Component
 *
 * Interactive SVG-based viewer for exploded views with clickable hotspots.
 * Displays component information when hotspots are clicked.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'
import type { AssetExplodedViewWithRelations, ExplodedViewHotspotWithComponent } from '@/types/exploded-view.types'
import Link from 'next/link'

interface ExplodedViewViewerProps {
  view: AssetExplodedViewWithRelations
  className?: string
}

/**
 * Exploded View Viewer with interactive hotspots
 */
export function ExplodedViewViewer({ view, className = '' }: ExplodedViewViewerProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<ExplodedViewHotspotWithComponent | null>(null)
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Calculate scale based on container size
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const imageWidth = view.imageWidth
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
  }, [view.imageWidth])

  const handleHotspotClick = (hotspot: ExplodedViewHotspotWithComponent) => {
    setSelectedHotspot(hotspot)
  }

  // Helper function to extract x and y from coordinates
  const getHotspotPosition = (hotspot: ExplodedViewHotspotWithComponent): { x: number; y: number } => {
    if ('x' in hotspot.coordinates && 'y' in hotspot.coordinates) {
      // Circle or Rectangle coordinates
      return { x: hotspot.coordinates.x, y: hotspot.coordinates.y }
    } else if ('points' in hotspot.coordinates && hotspot.coordinates.points.length > 0) {
      // Polygon coordinates - use first point
      return { x: hotspot.coordinates.points[0].x, y: hotspot.coordinates.points[0].y }
    }
    return { x: 0, y: 0 }
  }

  const scaledWidth = view.imageWidth * scale
  const scaledHeight = view.imageHeight * scale

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Viewer Container */}
      <div ref={containerRef} className="relative border rounded-lg overflow-hidden bg-muted/20">
        {/* Image */}
        <div
          className="relative"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          <Image
            src={view.imageUrl}
            alt={view.name}
            width={view.imageWidth}
            height={view.imageHeight}
            className="absolute inset-0 w-full h-full object-contain"
            onLoad={() => setImageLoaded(true)}
            unoptimized
          />

          {/* SVG Overlay with Hotspots */}
          {imageLoaded && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${view.imageWidth} ${view.imageHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {view.hotspots?.map((hotspot) => {
                const isHovered = hoveredHotspot === hotspot.id
                const isSelected = selectedHotspot?.id === hotspot.id
                const position = getHotspotPosition(hotspot)

                return (
                  <g key={hotspot.id}>
                    {/* Hotspot Circle */}
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={isHovered || isSelected ? 16 : 12}
                      fill={isSelected ? '#3b82f6' : isHovered ? '#60a5fa' : '#ef4444'}
                      opacity={0.8}
                      className="pointer-events-auto cursor-pointer transition-all duration-200"
                      onClick={() => handleHotspotClick(hotspot)}
                      onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                      onMouseLeave={() => setHoveredHotspot(null)}
                      style={{
                        filter: isHovered || isSelected
                          ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
                          : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                      }}
                    />

                    {/* Hotspot Number */}
                    <text
                      x={position.x}
                      y={position.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={isHovered || isSelected ? '14' : '12'}
                      fontWeight="bold"
                      className="pointer-events-auto cursor-pointer select-none"
                      onClick={() => handleHotspotClick(hotspot)}
                      onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                      onMouseLeave={() => setHoveredHotspot(null)}
                    >
                      {hotspot.order}
                    </text>

                    {/* Hover Label */}
                    {isHovered && hotspot.component && (
                      <g>
                        <rect
                          x={position.x + 20}
                          y={position.y - 12}
                          width={hotspot.component.name.length * 8 + 16}
                          height={24}
                          fill="rgba(0, 0, 0, 0.9)"
                          rx={4}
                          className="pointer-events-none"
                        />
                        <text
                          x={position.x + 28}
                          y={position.y + 4}
                          fill="white"
                          fontSize="12"
                          fontWeight="500"
                          className="pointer-events-none select-none"
                        >
                          {hotspot.component.name}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        {/* Loading State */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="text-muted-foreground">Cargando vista...</div>
          </div>
        )}
      </div>

      {/* Hotspot Legend */}
      {view.hotspots && view.hotspots.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Componentes ({view.hotspots.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {view.hotspots.map((hotspot) => (
                <button
                  key={hotspot.id}
                  onClick={() => handleHotspotClick(hotspot)}
                  onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    selectedHotspot?.id === hotspot.id
                      ? 'bg-primary/10 border-primary'
                      : hoveredHotspot === hotspot.id
                      ? 'bg-muted border-muted-foreground/20'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold shrink-0">
                    {hotspot.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {hotspot.component?.name || 'Sin nombre'}
                    </div>
                    {hotspot.component?.partNumber && (
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        P/N: {hotspot.component.partNumber}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Details Dialog */}
      <Dialog open={!!selectedHotspot} onOpenChange={() => setSelectedHotspot(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {selectedHotspot?.component?.name || 'Componente'}
            </DialogTitle>
            <DialogDescription>
              {selectedHotspot?.component?.partNumber && (
                <span className="font-mono">P/N: {selectedHotspot.component.partNumber}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedHotspot?.component && (
            <div className="space-y-4 mt-4">
              {/* Label if exists */}
              {selectedHotspot.label && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Etiqueta
                  </div>
                  <div className="text-sm">{selectedHotspot.label}</div>
                </div>
              )}

              {/* Description */}
              {selectedHotspot.component.description && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Descripción
                  </div>
                  <div className="text-sm">{selectedHotspot.component.description}</div>
                </div>
              )}

              {/* Technical Details */}
              <div className="grid grid-cols-2 gap-4">
                {selectedHotspot.component.manufacturer && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Fabricante
                    </div>
                    <div className="text-sm">{selectedHotspot.component.manufacturer}</div>
                  </div>
                )}
                {selectedHotspot.component.partNumber && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Número de Parte
                    </div>
                    <div className="text-sm font-mono">
                      {selectedHotspot.component.partNumber}
                    </div>
                  </div>
                )}
              </div>

              {/* Inventory Item Link */}
              {selectedHotspot.component.inventoryItem && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">
                        {selectedHotspot.component.inventoryItem.name}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {selectedHotspot.component.inventoryItem.code}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/admin/inventory/items/${selectedHotspot.component.inventoryItemId}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Documents */}
              {(selectedHotspot.component.manualUrl ||
                selectedHotspot.component.installationUrl ||
                selectedHotspot.component.imageUrl) && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Documentación
                  </div>
                  <div className="space-y-2">
                    {selectedHotspot.component.manualUrl && (
                      <a
                        href={selectedHotspot.component.manualUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 border rounded hover:bg-muted transition-colors"
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Manual de Usuario</span>
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}
                    {selectedHotspot.component.installationUrl && (
                      <a
                        href={selectedHotspot.component.installationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 border rounded hover:bg-muted transition-colors"
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Guía de Instalación</span>
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}
                    {selectedHotspot.component.imageUrl && (
                      <a
                        href={selectedHotspot.component.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 border rounded hover:bg-muted transition-colors"
                      >
                        <ImageIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm">Imagen del Componente</span>
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge variant={selectedHotspot.component.isActive ? 'default' : 'secondary'}>
                  {selectedHotspot.component.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* View Component Details Link */}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin/exploded-view-components/${selectedHotspot.componentId}`}>
                  Ver Detalles Completos
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
