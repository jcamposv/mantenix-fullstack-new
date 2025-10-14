"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2, MapPin, Building2, Users } from "lucide-react"
import { toast } from "sonner"

interface Site {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  contactName: string | null
  timezone: string
  createdAt: string
  clientCompany: {
    id: string
    name: string
    tenantCompany: {
      id: string
      name: string
      subdomain: string
    }
  }
  createdByUser: {
    id: string
    name: string
    email: string
  }
  _count: {
    siteUsers: number
  }
}

const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "name",
    header: "Sede",
    cell: ({ row }) => {
      const site = row.original
      return (
        <div className="space-y-1">
          <div className="font-medium">{site.name}</div>
          {site.address && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-3 w-3" />
              {site.address}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "clientCompany.name",
    header: "Empresa Cliente",
    cell: ({ row }) => {
      const site = row.original
      return (
        <div className="space-y-1">
          <div className="flex items-center">
            <Building2 className="mr-1 h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{site.clientCompany.name}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Tenant: {site.clientCompany.tenantCompany.name}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "contactName",
    header: "Contacto",
    cell: ({ row }) => {
      const site = row.original
      if (!site.contactName) {
        return <span className="text-muted-foreground">Sin contacto</span>
      }
      return (
        <div>
          <div className="font-medium">{site.contactName}</div>
          {site.email && (
            <div className="text-sm text-muted-foreground">{site.email}</div>
          )}
          {site.phone && (
            <div className="text-sm text-muted-foreground">{site.phone}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "_count.siteUsers",
    header: "Usuarios",
    cell: ({ row }) => {
      const userCount = row.original._count.siteUsers
      return (
        <div className="flex items-center">
          <Users className="mr-1 h-3 w-3 text-muted-foreground" />
          <span>{userCount} asignados</span>
        </div>
      )
    },
  },
  {
    accessorKey: "timezone", 
    header: "Zona Horaria",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="text-xs">
          {row.getValue("timezone")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString()
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const site = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(site.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(site.id, site.name)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Desactivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredClientCompany, setFilteredClientCompany] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const clientCompanyId = searchParams.get('clientCompanyId')
    setFilteredClientCompany(clientCompanyId)
    fetchSites()
  }, [searchParams])

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/admin/sites')
      if (response.ok) {
        const data = await response.json()
        const sitesData = data.sites || []
        const clientCompanyId = searchParams.get('clientCompanyId')
        
        // Filter sites by client company if specified
        const filteredSites = clientCompanyId 
          ? sitesData.filter((site: Site) => site.clientCompany.id === clientCompanyId)
          : sitesData
          
        setSites(filteredSites)
      }
    } catch (error) {
      console.error('Error fetching sites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSite = () => {
    router.push("/admin/sites/new")
  }

  const handleEdit = (siteId: string) => {
    router.push(`/admin/sites/${siteId}/edit`)
  }

  const handleDelete = async (siteId: string, siteName: string) => {
    if (confirm(`¿Está seguro que desea desactivar "${siteName}"?`)) {
      try {
        const response = await fetch(`/api/admin/sites/${siteId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const result = await response.json()
          toast.success(result.message || 'Sede desactivada exitosamente')
          fetchSites() // Refresh the list
        } else {
          const error = await response.json()
          toast.error(error.error || 'Error al desactivar la sede')
        }
      } catch (error) {
        console.error('Error deleting site:', error)
        toast.error('Error al desactivar la sede')
      }
    }
  }

  const getTitle = () => {
    if (filteredClientCompany && sites.length > 0) {
      return `Sedes de ${sites[0]?.clientCompany?.name}`
    }
    return "Sedes"
  }

  const getDescription = () => {
    if (filteredClientCompany) {
      return "Sedes de la empresa cliente seleccionada"
    }
    return "Gestionar todas las sedes de las empresas cliente"
  }

  return (
    <div className="container mx-auto py-6">
      {filteredClientCompany && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/sites')}
            className="mb-4"
          >
            ← Ver Todas las Sedes
          </Button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={sites}
        searchKey="name"
        searchPlaceholder="Buscar sedes..."
        title={getTitle()}
        description={getDescription()}
        onAdd={handleAddSite}
        addLabel="Agregar Sede"
        loading={loading}
      />
    </div>
  )
}