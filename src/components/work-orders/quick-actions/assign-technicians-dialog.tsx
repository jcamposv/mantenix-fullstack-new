"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollableDialog } from "@/components/common/scrollable-dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  assignTechniciansSchema,
  type AssignTechniciansData,
} from "@/schemas/work-order-quick-actions.schema"

interface AssignTechniciansDialogProps {
  workOrderId: string | null
  workOrderNumber?: string
  currentTechnicianIds?: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface Technician {
  id: string
  name: string
  email: string
  role: string
}

/**
 * AssignTechniciansDialog
 * Quick assignment of technicians to work order from calendar
 */
export function AssignTechniciansDialog({
  workOrderId,
  workOrderNumber,
  currentTechnicianIds = [],
  open,
  onOpenChange,
  onSuccess,
}: AssignTechniciansDialogProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingTechnicians, setFetchingTechnicians] = useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssignTechniciansData>({
    resolver: zodResolver(assignTechniciansSchema),
    defaultValues: {
      workOrderId: workOrderId || "",
      technicianIds: currentTechnicianIds,
    },
  })

  const selectedTechnicianIds = watch("technicianIds")

  useEffect(() => {
    if (open && workOrderId) {
      setValue("workOrderId", workOrderId)
      setValue("technicianIds", currentTechnicianIds)
      fetchTechnicians()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, workOrderId, currentTechnicianIds])

  const fetchTechnicians = async (): Promise<void> => {
    try {
      setFetchingTechnicians(true)
      const response = await fetch("/api/users?role=TECNICO&role=JEFE_MANTENIMIENTO")

      if (!response.ok) throw new Error("Error al cargar técnicos")

      const data = await response.json()
      setTechnicians(data.items || [])
    } catch (error) {
      console.error("Error fetching technicians:", error)
      toast.error("Error al cargar técnicos")
    } finally {
      setFetchingTechnicians(false)
    }
  }

  const handleTechnicianToggle = (technicianId: string): void => {
    const current = selectedTechnicianIds || []
    const newSelection = current.includes(technicianId)
      ? current.filter((id) => id !== technicianId)
      : [...current, technicianId]

    setValue("technicianIds", newSelection, { shouldValidate: true })
  }

  const onSubmit = async (data: AssignTechniciansData): Promise<void> => {
    try {
      setLoading(true)

      const response = await fetch(`/api/work-orders/${workOrderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: data.technicianIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al asignar técnicos")
      }

      toast.success("Técnicos asignados exitosamente")
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error assigning technicians:", error)
      toast.error(error instanceof Error ? error.message : "Error al asignar técnicos")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = (): void => {
    if (!loading) {
      reset()
      onOpenChange(false)
    }
  }

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={handleClose}
      title="Asignar Técnicos"
      description={workOrderNumber ? `Orden: ${workOrderNumber}` : undefined}
      maxWidth="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading || fetchingTechnicians}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Asignar
          </Button>
        </>
      }
    >
      {fetchingTechnicians ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Cargando técnicos...</span>
        </div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No hay técnicos disponibles
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Técnicos Disponibles</Label>
          <div className="space-y-2">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                onClick={() => handleTechnicianToggle(tech.id)}
              >
                <Checkbox
                  id={`tech-${tech.id}`}
                  checked={selectedTechnicianIds?.includes(tech.id)}
                  onCheckedChange={() => handleTechnicianToggle(tech.id)}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`tech-${tech.id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {tech.name}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">{tech.email}</p>
                </div>
              </div>
            ))}
          </div>
          {errors.technicianIds && (
            <p className="text-sm text-destructive mt-2">{errors.technicianIds.message}</p>
          )}
        </div>
      )}
    </ScrollableDialog>
  )
}
