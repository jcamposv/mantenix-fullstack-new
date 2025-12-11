/**
 * LOTO Procedure Card - Mobile View
 * Displays lockout/tagout procedure details with apply functionality
 */

"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Lock, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LOTOProcedureCardProps {
  procedure: {
    id: string
    status: string
    appliedAt: string | null
    releasedAt: string | null
    asset: {
      id: string
      name: string
      assetTag: string
    } | null
    lockSerialNumbers: string[]
    tagNumbers?: string[]
  }
  onRefresh?: () => void
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPLIED: "bg-blue-100 text-blue-800",
  VERIFIED: "bg-green-100 text-green-800",
  REMOVED: "bg-gray-100 text-gray-800"
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPLIED: "Aplicado",
  VERIFIED: "Verificado",
  REMOVED: "Removido"
}

export function LOTOProcedureCard({ procedure, onRefresh }: LOTOProcedureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card collapse

    setLoading(true)
    try {
      const response = await fetch(`/api/loto-procedures/${procedure.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lockSerialNumbers: procedure.lockSerialNumbers,
          tagNumbers: procedure.tagNumbers || [],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al aplicar LOTO')
      }

      toast.success('LOTO aplicado exitosamente')
      onRefresh?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al aplicar LOTO')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div
        className="p-3 cursor-pointer select-none active:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Lock className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                LOTO - {procedure.asset?.name || "Sin activo"}
              </p>
              {procedure.asset && (
                <p className="text-xs text-muted-foreground">
                  Tag: {procedure.asset.assetTag}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("text-xs", statusColors[procedure.status])}
            >
              {statusLabels[procedure.status] || procedure.status}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t pt-3">
          {/* Lock Serial Numbers */}
          {procedure.lockSerialNumbers.length > 0 && (
            <div className="flex gap-2">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">
                  Candados ({procedure.lockSerialNumbers.length})
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {procedure.lockSerialNumbers.map((serial, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {serial}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Asset Info */}
          {procedure.asset && (
            <div className="p-2 rounded bg-muted/50">
              <p className="text-xs font-medium text-foreground">Activo</p>
              <p className="text-xs text-muted-foreground">
                {procedure.asset.name} ({procedure.asset.assetTag})
              </p>
            </div>
          )}

          {/* Critical Warning */}
          {procedure.status === "APPLIED" && (
            <div className="p-2 rounded bg-red-50 border border-red-200">
              <p className="text-xs text-red-900 font-medium">
                ⚠️ LOTO Activo - NO remover sin autorización
              </p>
            </div>
          )}

          {/* Apply LOTO Button - Only for PENDING status */}
          {procedure.status === "PENDING" && (
            <div className="pt-2">
              <Button
                onClick={handleApply}
                disabled={loading}
                className="w-full"
                size="sm"
              >
                <Lock className="h-4 w-4 mr-2" />
                {loading ? "Aplicando..." : "Aplicar LOTO"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Confirmar que los candados fueron colocados físicamente
              </p>
            </div>
          )}

          {/* Note */}
          <div className="mt-3 p-2 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              Ver puntos de aislamiento en la versión web
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
