"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserAvatar } from "@/components/common/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Shield, Calendar } from "lucide-react"
import type { WorkOrderAssignmentWithUser } from "@/types/work-order.types"

interface TechnicianDetailModalProps {
  assignment: WorkOrderAssignmentWithUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Administrador",
  ADMIN_EMPRESA: "Administrador de Empresa",
  SUPERVISOR: "Supervisor",
  TECNICO: "Técnico",
  CLIENTE_ADMIN_GENERAL: "Admin General Cliente",
  CLIENTE_ADMIN_SEDE: "Admin de Sede",
  CLIENTE_OPERARIO: "Operario"
}

export function TechnicianDetailModal({
  assignment,
  open,
  onOpenChange,
}: TechnicianDetailModalProps) {
  if (!assignment) return null

  const { user, assigner, assignedAt } = assignment

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles del Técnico</DialogTitle>
          <DialogDescription>
            Información completa del técnico asignado a esta orden de trabajo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Avatar and Name */}
          <div className="flex items-center gap-4">
            <UserAvatar
              name={user?.name || "Usuario"}
              image={user?.image}
              size="lg"
              className="h-20 w-20"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user?.name || "Usuario"}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Rol</label>
            </div>
            <Badge variant="secondary" className="text-sm">
              {ROLE_LABELS[user?.role || ""] || user?.role}
            </Badge>
          </div>

          {/* Assignment Info */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Información de Asignación
            </h4>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha de Asignación</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(assignedAt).toLocaleString('es-ES', {
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>

              {assigner && (
                <div className="flex items-start gap-2">
                  <UserAvatar
                    name={assigner.name}
                    image={null}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium">Asignado por</p>
                    <p className="text-sm text-muted-foreground">{assigner.name}</p>
                    <p className="text-xs text-muted-foreground">{assigner.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
