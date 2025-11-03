"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { MapPin } from "lucide-react"
import { toast } from "sonner"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LocationForm } from "@/components/forms/location-form"
import { LocationFormData } from "@/schemas/location"

interface Location {
  id: string
  companyId: string
  name: string
  address?: string | null
  latitude: number
  longitude: number
  radiusMeters: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function LocationsManagementPage() {
  const { data: locations, loading, refetch } = useTableData<Location>({
    endpoint: '/api/admin/locations',
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleAdd = () => {
    setEditingLocation(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setFormDialogOpen(true)
  }

  const handleDelete = (location: Location) => {
    setLocationToDelete(location)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!locationToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/locations/${locationToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Ubicación eliminada exitosamente')
        setDeleteDialogOpen(false)
        setLocationToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar la ubicación')
      }
    } catch (error) {
      console.error('Error deleting location:', error)
      toast.error('Error al eliminar la ubicación')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormSubmit = async (data: LocationFormData) => {
    setSubmitting(true)

    try {
      const url = editingLocation
        ? `/api/admin/locations/${editingLocation.id}`
        : "/api/admin/locations"

      const response = await fetch(url, {
        method: editingLocation ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success(
          editingLocation
            ? "Ubicación actualizada exitosamente"
            : "Ubicación creada exitosamente"
        )
        setFormDialogOpen(false)
        setEditingLocation(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al guardar ubicación")
      }
    } catch (error) {
      console.error("Error saving location:", error)
      toast.error("Error al guardar ubicación")
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormCancel = () => {
    setFormDialogOpen(false)
    setEditingLocation(null)
  }

  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: "name",
      header: "Ubicación",
      cell: ({ row }) => {
        const location = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{location.name}</span>
            </div>
            {location.address && (
              <div className="text-sm text-muted-foreground">
                {location.address}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "latitude",
      header: "Coordenadas",
      cell: ({ row }) => {
        const location = row.original
        return (
          <div className="font-mono text-sm">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </div>
        )
      },
    },
    {
      accessorKey: "radiusMeters",
      header: "Radio",
      cell: ({ row }) => {
        const radiusMeters = row.getValue("radiusMeters") as number
        return <span>{radiusMeters}m</span>
      },
    },
    {
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Activa" : "Inactiva"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const location = row.original
        const actions = [
          createEditAction(() => handleEdit(location)),
          createDeleteAction(() => handleDelete(location))
        ]

        return <TableActions actions={actions} />
      },
    },
  ]

  return (
    <div className="container mx-auto py-0">
      <DataTable
        columns={columns}
        data={locations}
        searchKey="name"
        searchPlaceholder="Buscar ubicaciones..."
        title="Gestión de Ubicaciones"
        description="Configura las ubicaciones donde tus empleados pueden marcar asistencia"
        onAdd={handleAdd}
        addLabel="Nueva Ubicación"
        loading={loading}
      />

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Editar Ubicación" : "Nueva Ubicación"}
            </DialogTitle>
            <DialogDescription>
              Configura el nombre, dirección y coordenadas de la ubicación. Los empleados
              solo podrán marcar asistencia si están dentro del radio configurado.
            </DialogDescription>
          </DialogHeader>

          <LocationForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={submitting}
            initialData={
              editingLocation
                ? {
                    ...editingLocation,
                    address: editingLocation.address ?? undefined,
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Ubicación"
        description={`¿Está seguro que desea eliminar "${locationToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
