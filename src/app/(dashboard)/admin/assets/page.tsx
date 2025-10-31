"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Package, MapPin, Building2, Calendar } from "lucide-react"
import { toast } from "sonner"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { SignedImage } from "@/components/signed-image"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

interface Asset {
  id: string
  name: string
  code: string
  description: string | null
  location: string
  status: "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO"
  category: string | null
  manufacturer: string | null
  model: string | null
  serialNumber: string | null
  registrationDate: string
  images: string[]
  site: {
    id: string
    name: string
    clientCompany: {
      id: string
      name: string
    }
  }
  _count: {
    workOrders: number
  }
}

interface AssetsResponse {
  assets?: Asset[]
  items?: Asset[]
}

const getEstadoBadgeVariant = (estado: string) => {
  switch (estado) {
    case "OPERATIVO":
      return "default"
    case "EN_MANTENIMIENTO":
      return "secondary"
    case "FUERA_DE_SERVICIO":
      return "destructive"
    default:
      return "outline"
  }
}

const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case "OPERATIVO":
      return "Operativo"
    case "EN_MANTENIMIENTO":
      return "En Mantenimiento"
    case "FUERA_DE_SERVICIO":
      return "Fuera de Servicio"
    default:
      return estado
  }
}

export default function AssetsPage() {
  const [filteredSite, setFilteredSite] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: allAssets, loading, refetch } = useTableData<Asset>({
    endpoint: '/api/admin/assets',
    transform: (data) => (data as AssetsResponse).assets || (data as AssetsResponse).items || (data as Asset[]) || []
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const siteId = searchParams.get('siteId')
    setFilteredSite(siteId)
  }, [searchParams])

  // Filter assets by site if specified
  const assets = filteredSite 
    ? allAssets.filter((asset: Asset) => asset.site.id === filteredSite)
    : allAssets

  const handleAddAsset = () => {
    router.push("/admin/assets/new")
  }

  const handleEdit = (assetId: string) => {
    router.push(`/admin/assets/${assetId}/edit`)
  }

  const handleDelete = (asset: Asset) => {
    setAssetToDelete(asset)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!assetToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/assets/${assetToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Activo desactivado exitosamente')
        setDeleteDialogOpen(false)
        setAssetToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar el activo')
      }
    } catch (error) {
      console.error('Error deleting asset:', error)
      toast.error('Error al desactivar el activo')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: "images",
      header: "",
      cell: ({ row }) => {
        const asset = row.original
        const firstImage = asset.images?.[0]
        return (
          <div className="w-10 h-10">
            {firstImage ? (
              <SignedImage
                src={firstImage}
                alt={asset.name}
                width={40}
                height={40}
                className="rounded-md object-cover w-10 h-10"
              />
            ) : (
              <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Activo",
      cell: ({ row }) => {
        const asset = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium">{asset.name}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Package className="mr-1 h-3 w-3" />
              {asset.code}
            </div>
            {asset.category && (
              <div className="text-xs text-muted-foreground">
                {asset.category}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "site.name",
      header: "Sede",
      cell: ({ row }) => {
        const asset = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center">
              <Building2 className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{asset.site.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {asset.site.clientCompany.name}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-3 w-3" />
              {asset.location}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={getEstadoBadgeVariant(status)}>
            {getEstadoLabel(status)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "manufacturer",
      header: "Información Técnica",
      cell: ({ row }) => {
        const asset = row.original
        return (
          <div className="space-y-1">
            {asset.manufacturer && (
              <div className="text-sm font-medium">{asset.manufacturer}</div>
            )}
            {asset.model && (
              <div className="text-sm text-muted-foreground">{asset.model}</div>
            )}
            {asset.serialNumber && (
              <div className="text-xs text-muted-foreground">
                Serie: {asset.serialNumber}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "registrationDate",
      header: "Fecha de Registro",
      cell: ({ row }) => {
        const registrationDate = row.getValue("registrationDate") as string
        return (
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
            <span>
              {new Date(registrationDate).toLocaleDateString()}
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const asset = row.original
        const actions = [
          createEditAction(() => handleEdit(asset.id)),
          createDeleteAction(() => handleDelete(asset))
        ]
        
        return <TableActions actions={actions} />
      },
    },
  ]

  const getTitle = () => {
    if (filteredSite && assets.length > 0) {
      return `Activos de ${assets[0]?.site?.name}`
    }
    return "Activos"
  }

  const getDescription = () => {
    if (filteredSite) {
      return "Activos de la sede seleccionada"
    }
    return "Gestionar todos los activos de las sedes"
  }

  return (
    <div className="container mx-auto py-6">
      {filteredSite && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/assets')}
            className="mb-4"
          >
            ← Ver Todos los Activos
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={assets}
        searchKey="name"
        searchPlaceholder="Buscar activos..."
        title={getTitle()}
        description={getDescription()}
        onAdd={handleAddAsset}
        addLabel="Agregar Activo"
        loading={loading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Desactivar Activo"
        description={`¿Está seguro que desea desactivar "${assetToDelete?.name}"?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}