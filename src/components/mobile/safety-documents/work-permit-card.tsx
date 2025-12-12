/**
 * Work Permit Card - Mobile View
 * Displays work permit details with hazards, precautions, and PPE
 */

"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Shield, MapPin, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface WorkPermitCardProps {
  permit: {
    id: string
    permitType: string
    status: string
    location: string
    validFrom: string | null
    validUntil: string | null
  }
}

const permitTypeLabels: Record<string, string> = {
  GENERAL: "General",
  HOT_WORK: "Trabajo en Caliente",
  CONFINED_SPACE: "Espacio Confinado",
  ELECTRICAL: "Eléctrico",
  HEIGHT: "Trabajo en Altura",
  EXCAVATION: "Excavación"
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_AUTHORIZATION: "bg-yellow-100 text-yellow-800",
  AUTHORIZED: "bg-green-100 text-green-800",
  ACTIVE: "bg-blue-100 text-blue-800",
  EXPIRED: "bg-orange-100 text-orange-800",
  CLOSED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800"
}

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_AUTHORIZATION: "Pendiente",
  AUTHORIZED: "Autorizado",
  ACTIVE: "Activo",
  EXPIRED: "Vencido",
  CLOSED: "Cerrado",
  CANCELLED: "Cancelado"
}

export function WorkPermitCard({ permit }: WorkPermitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div
        className="p-3 cursor-pointer select-none active:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {permitTypeLabels[permit.permitType] || permit.permitType}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {permit.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("text-xs", statusColors[permit.status])}
            >
              {statusLabels[permit.status] || permit.status}
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
          {/* Location */}
          <div className="flex gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">Ubicación</p>
              <p className="text-xs text-muted-foreground">{permit.location}</p>
            </div>
          </div>

          {/* Validity Period */}
          {permit.validFrom && permit.validUntil && (
            <div className="flex gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">Vigencia</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(permit.validFrom), "dd MMM yyyy HH:mm", { locale: es })}
                  {" - "}
                  {format(new Date(permit.validUntil), "dd MMM yyyy HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          )}

          {/* Note to view full details */}
          <div className="mt-3 p-2 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              Ver detalles completos en la versión web
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
