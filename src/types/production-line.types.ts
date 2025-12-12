import type { Node, Edge } from '@xyflow/react'
import type { PaginatedResponse } from "@/types/common.types"

/**
 * Production Line Types
 * Following Next.js Expert patterns: explicit types, no any
 */

export interface ProductionLine {
  id: string
  name: string
  code: string
  description: string | null
  siteId: string
  companyId: string
  targetThroughput: number | null
  taktTime: number | null
  unitPrice: number | null
  flowConfiguration: FlowConfiguration | null
  isActive: boolean
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductionLineWithRelations extends ProductionLine {
  site?: {
    id: string
    name: string
  }
  company?: {
    id: string
    name: string
  }
  assets?: ProductionLineAssetWithAsset[]
  _count?: {
    assets: number
  }
}

export interface ProductionLineAsset {
  id: string
  productionLineId: string
  assetId: string
  sequence: number
  position: Position | null
  cycleTime: number | null
  capacity: number | null
  nodeType: NodeType
  createdAt: Date
  updatedAt: Date
}

export interface ProductionLineAssetWithAsset extends ProductionLineAsset {
  asset: {
    id: string
    name: string
    code: string
    status: 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO'
    location: string
    manufacturer: string | null
    model: string | null
  }
}

/**
 * React Flow Configuration Types
 */
export interface FlowConfiguration {
  nodes: FlowNode[]
  edges: FlowEdge[]
  viewport?: {
    x: number
    y: number
    zoom: number
  }
}

export interface FlowNode extends Node {
  type: NodeType
  data: NodeData
}

export interface NodeData extends Record<string, unknown> {
  label: string
  assetId: string
  assetCode: string
  status: 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO'
  cycleTime?: number
  capacity?: number
  manufacturer?: string
  model?: string
  isBottleneck?: boolean
}

export interface FlowEdge extends Edge {
  type?: 'default' | 'smoothstep' | 'step' | 'straight'
  animated?: boolean
}

export type NodeType = 'machine' | 'buffer' | 'quality-check' | 'conveyor'

export interface Position {
  x: number
  y: number
}

/**
 * Form Data Types
 */
export interface CreateProductionLineData {
  name: string
  code: string
  description?: string
  siteId: string
  targetThroughput?: number
  taktTime?: number
  unitPrice?: number
}

export interface UpdateProductionLineData {
  name?: string
  code?: string
  description?: string
  siteId?: string
  targetThroughput?: number
  taktTime?: number
  unitPrice?: number
  flowConfiguration?: FlowConfiguration
  isActive?: boolean
}

export interface AddAssetToLineData {
  assetId: string
  sequence: number
  position?: Position
  cycleTime?: number
  capacity?: number
  nodeType?: NodeType
}

export interface UpdateAssetInLineData {
  sequence?: number
  position?: Position
  cycleTime?: number
  capacity?: number
  nodeType?: NodeType
}

/**
 * Filter and Pagination Types
 */
export interface ProductionLineFilters {
  siteId?: string
  companyId?: string
  search?: string
  isActive?: boolean
}

export type PaginatedProductionLinesResponse = PaginatedResponse<ProductionLineWithRelations>

/**
 * Monitoring and Stats Types
 */
export interface ProductionLineStats {
  totalLines: number
  activeLines: number
  totalMachines: number
  operationalMachines: number
  machinesInMaintenance: number
  machinesOutOfService: number
  averageThroughput: number | null
  utilizationRate: number // Percentage
}

export interface LineHealthStatus {
  lineId: string
  lineName: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  operationalAssets: number
  totalAssets: number
  bottleneck: {
    assetId: string
    assetName: string
    cycleTime: number
  } | null
}
