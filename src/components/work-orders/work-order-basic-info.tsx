"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Wrench, Users } from "lucide-react"
import { UserAvatar } from "@/components/common/user-avatar"
import { TechnicianDetailModal } from "./technician-detail-modal"
import type { WorkOrderWithRelations, WorkOrderAssignmentWithUser } from "@/types/work-order.types"

interface WorkOrderBasicInfoProps {
  workOrder: WorkOrderWithRelations
}

export function WorkOrderBasicInfo({ workOrder }: WorkOrderBasicInfoProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<WorkOrderAssignmentWithUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleTechnicianClick = (assignment: WorkOrderAssignmentWithUser) => {
    setSelectedAssignment(assignment)
    setModalOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Básica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Descripción</label>
          <p className="text-sm text-muted-foreground mt-1">
            {workOrder.description || "Sin descripción"}
          </p>
        </div>

        {/* Usuarios Asignados */}
        {workOrder.assignments && workOrder.assignments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">
                Técnicos Asignados ({workOrder.assignments.length})
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              {workOrder.assignments.map((assignment) => (
                <button
                  key={assignment.id}
                  onClick={() => handleTechnicianClick(assignment)}
                  className="flex items-center gap-3 bg-muted/50 hover:bg-muted rounded-lg p-3 transition-colors cursor-pointer text-left"
                >
                  <UserAvatar
                    name={assignment.user?.name || "Usuario"}
                    image={assignment.user?.image}
                    size="lg"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {assignment.user?.name || "Usuario"}
                    </p>
                    {assignment.user?.email && (
                      <p className="text-xs text-muted-foreground">
                        {assignment.user.email}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Sede</p>
              <p className="text-sm text-muted-foreground">
                {workOrder.site?.name || "N/A"}
              </p>
            </div>
          </div>

          {workOrder.asset && (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Activo</p>
                <p className="text-sm text-muted-foreground">
                  {workOrder.asset.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Código: {workOrder.asset.code}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Technician Detail Modal */}
      <TechnicianDetailModal
        assignment={selectedAssignment}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </Card>
  )
}
