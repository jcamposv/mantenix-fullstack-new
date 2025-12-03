'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  addEdge,
  Panel,
  type Node,
} from '@xyflow/react'
import { MachineNode } from './machine-node'
import type { FlowConfiguration, NodeData } from '@/types/production-line.types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  AlertTriangle,
  TrendingDown,
  Clock,
  Gauge,
  Info,
  X,
  Package,
  CheckCircle,
  Truck,
} from 'lucide-react'

// Import React Flow styles
import '@xyflow/react/dist/style.css'

interface ProductionLineViewerProps {
  flowConfiguration: FlowConfiguration
  onFlowChange?: (config: FlowConfiguration) => void
  isEditable?: boolean
  className?: string
  unitPrice?: number // Price per unit produced
  targetThroughput?: number // Target units per hour
}

/**
 * Production Line Viewer Component
 * Displays interactive React Flow diagram of production line
 */
export function ProductionLineViewer({
  flowConfiguration,
  onFlowChange,
  isEditable = false,
  className,
  unitPrice = 0,
  targetThroughput = 0,
}: ProductionLineViewerProps) {
  // Define custom node types
  const nodeTypes = useMemo(
    () => ({
      machine: MachineNode,
      buffer: MachineNode,
      'quality-check': MachineNode,
      conveyor: MachineNode,
    }),
    []
  )

  // Initialize nodes and edges from configuration
  const initialNodes = flowConfiguration.nodes || []
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    flowConfiguration.edges || []
  )

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(connection, edges)
      setEdges(newEdges)

      if (onFlowChange) {
        onFlowChange({
          nodes,
          edges: newEdges,
          viewport: flowConfiguration.viewport,
        })
      }
    },
    [edges, nodes, flowConfiguration.viewport, onFlowChange, setEdges]
  )

  // State for selected node
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // Calculate industrial engineering metrics
  const metrics = useMemo(() => {
    const operational = nodes.filter((n) => n.data.status === 'OPERATIVO').length
    const maintenance = nodes.filter((n) => n.data.status === 'EN_MANTENIMIENTO').length
    const outOfService = nodes.filter((n) => n.data.status === 'FUERA_DE_SERVICIO').length
    const healthPercentage = nodes.length > 0 ? Math.round((operational / nodes.length) * 100) : 0

    // Find bottleneck (node with highest cycle time)
    const nodesWithCycleTime = nodes.filter((n) => n.data.cycleTime)
    const bottleneck = nodesWithCycleTime.length > 0
      ? nodesWithCycleTime.reduce((max, node) =>
          (node.data.cycleTime || 0) > (max.data.cycleTime || 0) ? node : max
        )
      : null

    // Calculate theoretical throughput (based on bottleneck)
    const theoreticalThroughput = bottleneck?.data.cycleTime
      ? Math.floor(3600 / bottleneck.data.cycleTime) // units per hour
      : null

    // Calculate average cycle time
    const avgCycleTime = nodesWithCycleTime.length > 0
      ? nodesWithCycleTime.reduce((sum, n) => sum + (n.data.cycleTime || 0), 0) / nodesWithCycleTime.length
      : null

    // Line balance analysis (coefficient of variation)
    const lineBalance = nodesWithCycleTime.length > 1 && avgCycleTime
      ? (() => {
          const variance = nodesWithCycleTime.reduce(
            (sum, n) => sum + Math.pow((n.data.cycleTime || 0) - avgCycleTime, 2),
            0
          ) / nodesWithCycleTime.length
          const stdDev = Math.sqrt(variance)
          const cv = (stdDev / avgCycleTime) * 100
          return {
            coefficient: cv,
            status: cv < 10 ? 'balanced' : cv < 25 ? 'moderate' : 'unbalanced'
          }
        })()
      : null

    // =====================================================
    // CRITICALITY ANALYSIS (SPOF - Single Point of Failure)
    // =====================================================
    // Detect nodes in parallel (redundant) vs critical (no redundancy)
    const parallelGroups = new Map<string, Node[]>()

    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)
      const targetNode = nodes.find((n) => n.id === edge.target)

      if (sourceNode && targetNode) {
        const key = `${edge.source}-${edge.target}`
        if (!parallelGroups.has(key)) {
          parallelGroups.set(key, [])
        }
      }
    })

    // Find nodes with no parallel alternatives (critical nodes)
    const criticalNodes = nodes.filter((node) => {
      // A node is critical if it has NO parallel alternatives
      // Check if there are other nodes with same inputs and outputs
      const nodeInEdges = edges.filter((e) => e.target === node.id)
      const nodeOutEdges = edges.filter((e) => e.source === node.id)

      // If node has no edges, it's not critical to flow
      if (nodeInEdges.length === 0 && nodeOutEdges.length === 0) return false

      // Check if there are parallel paths (other nodes with same source->target pattern)
      const hasParallel = nodes.some((otherNode) => {
        if (otherNode.id === node.id) return false

        const otherInEdges = edges.filter((e) => e.target === otherNode.id)
        const otherOutEdges = edges.filter((e) => e.source === otherNode.id)

        // Check if they share the same sources and targets
        const sameInputs = nodeInEdges.some((e1) =>
          otherInEdges.some((e2) => e1.source === e2.source)
        )
        const sameOutputs = nodeOutEdges.some((e1) =>
          otherOutEdges.some((e2) => e1.target === e2.target)
        )

        return sameInputs && sameOutputs
      })

      return !hasParallel // Critical if NO parallel found
    })

    // Calculate downtime costs
    const downtimeCostPerHour = unitPrice && theoreticalThroughput
      ? unitPrice * theoreticalThroughput
      : 0

    // Identify failed critical nodes (blocking production)
    const failedCriticalNodes = criticalNodes.filter(
      (n) => n.data.status === 'FUERA_DE_SERVICIO' || n.data.status === 'EN_MANTENIMIENTO'
    )

    // Identify failed parallel nodes (reducing capacity)
    const failedParallelNodes = nodes.filter(
      (n) => !criticalNodes.includes(n) &&
        (n.data.status === 'FUERA_DE_SERVICIO' || n.data.status === 'EN_MANTENIMIENTO')
    )

    return {
      total: nodes.length,
      operational,
      maintenance,
      outOfService,
      healthPercentage,
      bottleneck,
      theoreticalThroughput,
      avgCycleTime,
      lineBalance,
      criticalNodes,
      failedCriticalNodes,
      failedParallelNodes,
      downtimeCostPerHour,
      isLineBlocked: failedCriticalNodes.length > 0,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, unitPrice, targetThroughput])

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  // Update nodes to mark bottleneck
  useEffect(() => {
    if (metrics.bottleneck) {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isBottleneck: node.id === metrics.bottleneck?.id,
          },
        }))
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics.bottleneck?.id, setNodes])

  return (
    <div className={`h-full w-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isEditable ? onNodesChange : undefined}
        onEdgesChange={isEditable ? onEdgesChange : undefined}
        onConnect={isEditable ? onConnect : undefined}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultViewport={flowConfiguration.viewport || { x: 0, y: 0, zoom: 0.5 }}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }}
        attributionPosition="bottom-left"
        className="bg-muted/10"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            // Highlight bottleneck in orange
            if (metrics.bottleneck?.id === node.id) {
              return '#f97316'
            }
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

        {/* Analysis Panel - Top Right */}
        <Panel position="top-right" className="space-y-2 max-w-xs">
          <Card className="p-3 space-y-3 bg-background/95 backdrop-blur">
            <div className="text-sm font-semibold">Análisis de Línea</div>

            {/* Health Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Salud:</span>
                <Badge
                  variant={
                    metrics.healthPercentage >= 80
                      ? 'default'
                      : metrics.healthPercentage >= 50
                      ? 'outline'
                      : 'destructive'
                  }
                  className="text-xs"
                >
                  {metrics.healthPercentage}%
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-green-600 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Operativos
                </span>
                <span className="font-medium">{metrics.operational}/{metrics.total}</span>
              </div>
            </div>

            <Separator />

            {/* Bottleneck Analysis */}
            {metrics.bottleneck && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                  <TrendingDown className="h-3 w-3" />
                  Cuello de Botella
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-medium truncate">
                    {metrics.bottleneck.data.label}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cycle Time:</span>
                    <span className="font-semibold text-orange-600">
                      {metrics.bottleneck.data.cycleTime}s
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Theoretical Throughput */}
            {metrics.theoreticalThroughput && (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Gauge className="h-3 w-3" />
                    Throughput Teórico
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {metrics.theoreticalThroughput}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      u/h
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Basado en cuello de botella
                  </div>
                </div>
              </>
            )}

            {/* Line Balance */}
            {metrics.lineBalance && (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    Balance de Línea
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Estado:</span>
                    <Badge
                      variant={
                        metrics.lineBalance.status === 'balanced'
                          ? 'default'
                          : metrics.lineBalance.status === 'moderate'
                          ? 'outline'
                          : 'destructive'
                      }
                      className="text-xs"
                    >
                      {metrics.lineBalance.status === 'balanced'
                        ? 'Balanceada'
                        : metrics.lineBalance.status === 'moderate'
                        ? 'Moderada'
                        : 'Desbalanceada'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">CV:</span>
                    <span className="font-medium">
                      {metrics.lineBalance.coefficient.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </>
            )}

            {metrics.avgCycleTime && (
              <div className="text-xs text-muted-foreground">
                Promedio CT: {metrics.avgCycleTime.toFixed(1)}s
              </div>
            )}

            {/* Criticality & Downtime Analysis */}
            {(metrics.criticalNodes.length > 0 || metrics.downtimeCostPerHour > 0) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs font-medium text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    Análisis de Riesgo
                  </div>

                  {/* Line Blocked Warning */}
                  {metrics.isLineBlocked && (
                    <div className="bg-red-500/10 border border-red-500 rounded p-2 space-y-1">
                      <div className="text-xs font-semibold text-red-600">
                        ⚠️ LÍNEA BLOQUEADA
                      </div>
                      <div className="text-xs text-red-600">
                        {metrics.failedCriticalNodes.length} nodo(s) crítico(s) fuera de servicio
                      </div>
                    </div>
                  )}

                  {/* Critical Nodes Count */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Nodos Críticos (SPOF):</span>
                    <Badge variant="destructive" className="text-xs">
                      {metrics.criticalNodes.length}
                    </Badge>
                  </div>

                  {/* Parallel/Redundant Nodes */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Nodos con Redundancia:</span>
                    <Badge variant="outline" className="text-xs">
                      {metrics.total - metrics.criticalNodes.length}
                    </Badge>
                  </div>

                  {/* Failed Parallel Nodes */}
                  {metrics.failedParallelNodes.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500 rounded p-2">
                      <div className="text-xs text-yellow-600">
                        ⚠️ {metrics.failedParallelNodes.length} nodo(s) en paralelo caído(s)
                        <div className="text-xs font-normal">Capacidad reducida pero línea operativa</div>
                      </div>
                    </div>
                  )}

                  {/* Downtime Cost */}
                  {metrics.downtimeCostPerHour > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <div className="text-xs font-medium">Costo de Parada:</div>
                        <div className="text-lg font-bold text-red-600">
                          ${metrics.downtimeCostPerHour.toLocaleString()}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            /hora
                          </span>
                        </div>
                        {metrics.isLineBlocked && (
                          <div className="text-xs text-red-600">
                            💰 Pérdidas activas por bloqueo
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </Card>
        </Panel>

        {/* Legend Panel - Bottom Left */}
        <Panel position="bottom-left" className="space-y-2">
          <Card className="p-3 space-y-2 bg-background/95 backdrop-blur">
            <div className="flex items-center gap-1 text-xs font-semibold">
              <Info className="h-3 w-3" />
              Leyenda
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-medium">Tipos de Nodo:</div>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3" />
                <span>Máquina</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-3 w-3" />
                <span>Buffer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Control Calidad</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-3 w-3" />
                <span>Transporte</span>
              </div>

              <Separator />

              <div className="font-medium">Estados:</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Operativo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Mantenimiento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Fuera de Servicio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Cuello de Botella</span>
              </div>
            </div>
          </Card>
        </Panel>

        {/* Selected Node Details Panel */}
        {selectedNode && (() => {
          const nodeData = selectedNode.data as NodeData
          return (
            <Panel position="top-left" className="max-w-sm">
              <Card className="p-3 space-y-2 bg-background/95 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Detalles del Nodo</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNode(null)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="font-semibold">{nodeData.label}</div>
                    <div className="text-muted-foreground">{nodeData.assetCode}</div>
                  </div>

                <div className="flex gap-1 flex-wrap">
                  {selectedNode.id === metrics.bottleneck?.id && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                      Cuello de Botella
                    </Badge>
                  )}
                  {metrics.criticalNodes.some((n) => n.id === selectedNode.id) && (
                    <Badge variant="destructive" className="text-xs">
                      Nodo Crítico (SPOF)
                    </Badge>
                  )}
                  {!metrics.criticalNodes.some((n) => n.id === selectedNode.id) && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      Redundancia OK
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className="font-medium">{nodeData.status}</span>
                  </div>

                  {nodeData.cycleTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cycle Time:</span>
                      <span className="font-medium">{nodeData.cycleTime}s</span>
                    </div>
                  )}

                  {nodeData.capacity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacidad:</span>
                      <span className="font-medium">{nodeData.capacity}/h</span>
                    </div>
                  )}

                  {nodeData.manufacturer && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fabricante:</span>
                      <span className="font-medium">{nodeData.manufacturer}</span>
                    </div>
                  )}

                  {nodeData.model && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modelo:</span>
                      <span className="font-medium">{nodeData.model}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Panel>
          )
        })()}
      </ReactFlow>
    </div>
  )
}
