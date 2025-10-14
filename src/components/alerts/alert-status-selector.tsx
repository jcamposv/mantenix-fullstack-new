import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStatusIcon } from "./alert-badges"

interface AlertStatusSelectorProps {
  currentStatus: string
  onStatusChange: (status: string) => void
  disabled?: boolean
}

export function AlertStatusSelector({ currentStatus, onStatusChange, disabled }: AlertStatusSelectorProps) {
  const statusOptions = [
    { value: "OPEN", label: "Abierta" },
    { value: "IN_PROGRESS", label: "En Progreso" },
    { value: "RESOLVED", label: "Resuelta" },
    { value: "CLOSED", label: "Cerrada" }
  ]

  return (
    <Select value={currentStatus} onValueChange={onStatusChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            <div className="flex items-center gap-2">
              <span>{getStatusIcon(status.value)}</span>
              <span>{status.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}