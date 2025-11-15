'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  type Connection,
  ReactFlowProvider,
} from '@xyflow/react'
import { MachineNode } from './machine-node'
import type {
  ProductionLineWithRelations,
  NodeType,
  FlowConfiguration,
  FlowNode,
} from '@/types/production-line.types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Save,
  Plus,
  Search,
  Activity,
  Package,
  CheckCircle,
  Truck,
} from 'lucide-react'

import '@xyflow/react/dist/style.css'

interface ProductionLineEditorProps {
  productionLine: ProductionLineWithRelations
  sites: Array<{ id: string; name: string }>
  availableAssets: Array<{
    id: string
    name: string
    code: string
    status: 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO'
    location: string
    manufacturer: string | null
    model: string | null
    siteId: string
    site: { name: string }
  }>
}

const nodeTypes = {
  machine: MachineNode,
  buffer: MachineNode,
  'quality-check': MachineNode,
  conveyor: MachineNode,
}

function ProductionLineEditorContent({
  productionLine,
  availableAssets,
}: ProductionLineEditorProps) {
  const router = useRouter()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType>('machine')

  // Initialize nodes and edges from existing configuration
  const initialNodes = productionLine.flowConfiguration?.nodes || []
  const initialEdges = productionLine.flowConfiguration?.edges || []

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  // Handle node drag end - save positions
  const onNodeDragStop = useCallback(() => {
    // Positions are automatically updated in nodes state
  }, [])

  // Add asset to canvas
  const addAssetToCanvas = useCallback(
    (asset: (typeof availableAssets)[0]) => {
      // Check if asset already exists in canvas
      const existingNode = nodes.find((n) => n.data.assetId === asset.id)
      if (existingNode) {
        toast.error('Este activo ya está en el canvas')
        return
      }

      // Create new node
      const newNode: FlowNode = {
        id: `node-${Date.now()}`,
        type: selectedNodeType,
        position: { x: 250, y: 250 }, // Center position
        data: {
          label: asset.name,
          assetId: asset.id,
          assetCode: asset.code,
          status: asset.status,
          manufacturer: asset.manufacturer || undefined,
          model: asset.model || undefined,
        },
      }

      setNodes((nds) => [...nds, newNode])
      toast.success(`${asset.name} agregado al canvas`)
    },
    [nodes, selectedNodeType, setNodes]
  )

  // Save flow configuration
  const saveConfiguration = useCallback(async () => {
    setIsSaving(true)

    try {
      const flowConfig: FlowConfiguration = {
        nodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 },
      }

      const response = await fetch(
        `/api/production-lines/${productionLine.id}/flow`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(flowConfig),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar configuración')
      }

      toast.success('Configuración guardada exitosamente')
      router.refresh()
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar configuración'
      )
    } finally {
      setIsSaving(false)
    }
  }, [nodes, edges, productionLine.id, router])

  // Filter assets
  const filteredAssets = availableAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get icon for node type
  const getNodeTypeIcon = (type: NodeType) => {
    switch (type) {
      case 'machine':
        return <Activity className="h-4 w-4" />
      case 'buffer':
        return <Package className="h-4 w-4" />
      case 'quality-check':
        return <CheckCircle className="h-4 w-4" />
      case 'conveyor':
        return <Truck className="h-4 w-4" />
    }
  }

  return (
    <div className="flex h-[800px]">
      {/* Sidebar - Assets Panel */}
      <div className="w-96 border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Tipo de Nodo</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedNodeType === 'machine' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedNodeType('machine')}
                className="h-auto py-3 flex flex-col gap-1"
              >
                <Activity className="h-5 w-5" />
                <span className="text-xs">Máquina</span>
              </Button>
              <Button
                variant={selectedNodeType === 'buffer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedNodeType('buffer')}
                className="h-auto py-3 flex flex-col gap-1"
              >
                <Package className="h-5 w-5" />
                <span className="text-xs">Buffer</span>
              </Button>
              <Button
                variant={selectedNodeType === 'quality-check' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedNodeType('quality-check')}
                className="h-auto py-3 flex flex-col gap-1"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="text-xs">Calidad</span>
              </Button>
              <Button
                variant={selectedNodeType === 'conveyor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedNodeType('conveyor')}
                className="h-auto py-3 flex flex-col gap-1"
              >
                <Truck className="h-5 w-5" />
                <span className="text-xs">Transporte</span>
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="search">Buscar Activos</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por nombre o código..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">
                {filteredAssets.length} activo{filteredAssets.length !== 1 ? 's' : ''} disponible{filteredAssets.length !== 1 ? 's' : ''}
              </p>
              <Badge variant="outline" className="text-xs">
                {getNodeTypeIcon(selectedNodeType)}
                <span className="ml-1">
                  {selectedNodeType === 'machine' && 'Máquina'}
                  {selectedNodeType === 'buffer' && 'Buffer'}
                  {selectedNodeType === 'quality-check' && 'Calidad'}
                  {selectedNodeType === 'conveyor' && 'Transporte'}
                </span>
              </Badge>
            </div>

            {filteredAssets.length === 0 ? (
              <Card className="p-6">
                <div className="text-center space-y-2">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">No se encontraron activos</p>
                  <p className="text-xs text-muted-foreground">
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => {
                  const isInCanvas = nodes.some((n) => n.data.assetId === asset.id)
                  return (
                    <Card
                      key={asset.id}
                      className={`p-4 transition-all cursor-pointer border-2 ${
                        isInCanvas
                          ? 'border-primary/50 bg-primary/5 opacity-60 cursor-not-allowed'
                          : 'hover:border-primary/30 hover:bg-accent hover:shadow-md'
                      }`}
                      onClick={() => !isInCanvas && addAssetToCanvas(asset)}
                    >
                      <div className="space-y-2">
                        {/* Header with icon and status */}
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              asset.status === 'OPERATIVO'
                                ? 'bg-green-500/10 text-green-700'
                                : asset.status === 'EN_MANTENIMIENTO'
                                  ? 'bg-yellow-500/10 text-yellow-700'
                                  : 'bg-red-500/10 text-red-700'
                            }`}
                          >
                            {getNodeTypeIcon(selectedNodeType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {asset.name}
                            </h4>
                            <p className="text-xs text-muted-foreground font-mono">
                              {asset.code}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1 pl-11">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                asset.status === 'OPERATIVO'
                                  ? 'default'
                                  : asset.status === 'EN_MANTENIMIENTO'
                                    ? 'outline'
                                    : 'destructive'
                              }
                              className="text-xs"
                            >
                              {asset.status === 'OPERATIVO' && '✓ Operativo'}
                              {asset.status === 'EN_MANTENIMIENTO' && '⚠ Mantenimiento'}
                              {asset.status === 'FUERA_DE_SERVICIO' && '✕ Fuera de Servicio'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            📍 {asset.site.name}
                          </p>
                          {asset.location && (
                            <p className="text-xs text-muted-foreground">
                              🏢 {asset.location}
                            </p>
                          )}
                          {(asset.manufacturer || asset.model) && (
                            <p className="text-xs text-muted-foreground truncate">
                              {asset.manufacturer} {asset.model}
                            </p>
                          )}
                          {isInCanvas && (
                            <p className="text-xs text-primary font-medium mt-1">
                              ✓ Ya está en el canvas
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          className="bg-muted/10"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.data.status) {
                case 'OPERATIVO':
                  return '#22c55e'
                case 'EN_MANTENIMIENTO':
                  return '#eab308'
                case 'FUERA_DE_SERVICIO':
                  return '#ef4444'
                default:
                  return '#6b7280'
              }
            }}
            className="bg-background border border-border"
          />

          {/* Toolbar Panel */}
          <Panel position="top-right" className="space-y-2">
            <Card className="p-4 bg-background/95 backdrop-blur shadow-lg">
              <div className="space-y-3">
                {/* Stats */}
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <p className="text-xs text-muted-foreground">Canvas</p>
                    <p className="text-sm font-semibold">
                      {nodes.length} nodos • {edges.length} conexiones
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={saveConfiguration}
                    disabled={isSaving}
                    className="w-full"
                    size="lg"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>

                  {nodes.length > 0 && (
                    <Button
                      onClick={() => {
                        setNodes([])
                        setEdges([])
                        toast.success('Canvas limpiado')
                      }}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      Limpiar Canvas
                    </Button>
                  )}
                </div>

                {/* Tips */}
                {nodes.length > 0 && (
                  <div className="pt-3 border-t space-y-1">
                    <p className="text-xs font-medium">💡 Consejos:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Arrastra nodos para reposicionar</li>
                      <li>• Conecta los puntos azules</li>
                      <li>• Usa zoom con scroll</li>
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </Panel>

          {/* Instructions Panel */}
          {nodes.length === 0 && (
            <Panel position="top-center" className="pointer-events-none">
              <Card className="p-6 bg-background/95 backdrop-blur shadow-lg max-w-md">
                <div className="text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-primary/10">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Comienza a construir tu línea
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sigue estos pasos para crear tu línea de producción
                    </p>
                  </div>
                  <div className="space-y-2 text-left">
                    <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Selecciona el tipo de nodo</p>
                        <p className="text-xs text-muted-foreground">
                          Elige entre Máquina, Buffer, Calidad o Transporte
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Haz clic en un activo</p>
                        <p className="text-xs text-muted-foreground">
                          Selecciona del panel izquierdo para agregarlo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Conecta los nodos</p>
                        <p className="text-xs text-muted-foreground">
                          Arrastra desde los puntos azules para conectar
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  )
}

export function ProductionLineEditor(props: ProductionLineEditorProps) {
  return (
    <ReactFlowProvider>
      <ProductionLineEditorContent {...props} />
    </ReactFlowProvider>
  )
}
