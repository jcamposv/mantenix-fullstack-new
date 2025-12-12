"use client"

import { Users, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { UserMultiSelect } from "./user-multi-select"
import { useUsers } from "@/hooks/useUsers"
import { useEffect } from "react"
import { toast } from "sonner"

interface UserAssignmentSectionProps {
  selectedUserIds: string[]
  onUserIdsChange: (userIds: string[]) => void
  title?: string
}

/**
 * UserAssignmentSection
 * Wrapper for UserMultiSelect with data fetching
 * Uses the same endpoint and UX as work order creation
 * Optimized with SWR caching via useUsers hook
 * Max 200 lines per nextjs-expert standards
 */
export function UserAssignmentSection({
  selectedUserIds,
  onUserIdsChange,
  title = "Asignación de Personal",
}: UserAssignmentSectionProps) {
  // Use the new useUsers hook with SWR
  const { users, loading, error } = useUsers()

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error("Error al cargar usuarios")
    }
  }, [error])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Label className="text-base font-semibold">{title}</Label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay usuarios disponibles</p>
      ) : (
        <UserMultiSelect
          users={users}
          selectedUserIds={selectedUserIds}
          onUserIdsChange={onUserIdsChange}
          placeholder="Seleccionar usuarios..."
          emptyText="No se encontraron usuarios."
        />
      )}
    </div>
  )
}
