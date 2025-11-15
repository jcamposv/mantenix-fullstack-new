'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { NodeData } from '@/types/production-line.types'
import {
  Activity,
  AlertTriangle,
  XCircle,
  Package,
  CheckCircle,
  Truck,
} from 'lucide-react'

/**
 * Custom React Flow Node for Production Line Assets
 * Shows machine status with visual indicators
 */
export const MachineNode = memo(({ data, type }: NodeProps) => {
  // Type assertion for data
  const nodeData = data as NodeData
  
  // Check if this is marked as bottleneck
  const isBottleneck = nodeData.isBottleneck === true

  // Determine status styling
  const getStatusConfig = () => {
    switch (nodeData.status) {
      case 'OPERATIVO':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          borderColor: isBottleneck ? 'border-orange-500' : 'border-green-500',
          icon: <Activity className="h-4 w-4" />,
          label: 'Operativo',
        }
      case 'EN_MANTENIMIENTO':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          borderColor: isBottleneck ? 'border-orange-500' : 'border-yellow-500',
          icon: <AlertTriangle className="h-4 w-4" />,
          label: 'Mantenimiento',
        }
      case 'FUERA_DE_SERVICIO':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-700',
          borderColor: isBottleneck ? 'border-orange-500' : 'border-red-500',
          icon: <XCircle className="h-4 w-4" />,
          label: 'Fuera de Servicio',
        }
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          borderColor: isBottleneck ? 'border-orange-500' : 'border-gray-500',
          icon: <Activity className="h-4 w-4" />,
          label: 'Desconocido',
        }
    }
  }

  // Determine node icon based on type
  const getNodeIcon = () => {
    switch (type) {
      case 'machine':
        return <Activity className="h-5 w-5" />
      case 'buffer':
        return <Package className="h-5 w-5" />
      case 'quality-check':
        return <CheckCircle className="h-5 w-5" />
      case 'conveyor':
        return <Truck className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <Card
      className={`min-w-[200px] border-2 ${statusConfig.borderColor} shadow-lg transition-all hover:shadow-xl`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500"
      />

      <div className="p-4 space-y-3">
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`${statusConfig.textColor}`}>{getNodeIcon()}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{nodeData.label}</h4>
              <p className="text-xs text-muted-foreground">{nodeData.assetCode}</p>
            </div>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${statusConfig.color} flex-shrink-0 animate-pulse`}
          />
        </div>

        {/* Status Badge */}
        <Badge
          variant="outline"
          className={`text-xs ${statusConfig.textColor} border-current`}
        >
          <span className="flex items-center gap-1">
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </Badge>

        {/* Metrics */}
        {(nodeData.cycleTime || nodeData.capacity) && (
          <div className="text-xs space-y-1 pt-2 border-t">
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
          </div>
        )}

        {/* Additional Info */}
        {(nodeData.manufacturer || nodeData.model) && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {nodeData.manufacturer && <div>Fabricante: {nodeData.manufacturer}</div>}
            {nodeData.model && <div>Modelo: {nodeData.model}</div>}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500"
      />
    </Card>
  )
})

MachineNode.displayName = 'MachineNode'
