"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { Edit, MoreHorizontal, Trash2, Building2, Mail, Phone, MapPin } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface ClientCompany {
  id: string
  name: string
  companyId: string | null
  logo: string | null
  address: string | null
  phone: string | null
  email: string | null
  contactName: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  isActive: boolean
  createdAt: string
  tenantCompany: {
    id: string
    name: string
    subdomain: string
  }
  createdByUser: {
    id: string
    name: string
    email: string
  }
}

export default function ClientCompaniesPage() {
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchClientCompanies()
  }, [])

  const fetchClientCompanies = async () => {
    try {
      const response = await fetch('/api/admin/client-companies')
      if (response.ok) {
        const data = await response.json()
        setClientCompanies(data)
      } else {
        console.error('Error al cargar empresas cliente')
      }
    } catch (error) {
      console.error('Error fetching client companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClientCompany = () => {
    router.push("/admin/client-companies/new")
  }

  const handleEdit = (companyId: string) => {
    router.push(`/admin/client-companies/${companyId}/edit`)
  }

  const handleViewSites = (companyId: string) => {
    router.push(`/admin/sites?clientCompanyId=${companyId}`)
  }

  const handleDelete = async (companyId: string, companyName: string) => {
    if (confirm(`¿Está seguro que desea desactivar "${companyName}"?`)) {
      try {
        const response = await fetch(`/api/admin/client-companies/${companyId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const result = await response.json()
          toast.success(result.message || 'Empresa cliente desactivada exitosamente')
          fetchClientCompanies() // Refresh the list
        } else {
          const error = await response.json()
          toast.error(error.error || 'Error al desactivar la empresa cliente')
        }
      } catch (error) {
        console.error('Error deleting client company:', error)
        toast.error('Error al desactivar la empresa cliente')
      }
    }
  }

const columns: ColumnDef<ClientCompany>[] = [
  {
    accessorKey: "name",
    header: "Empresa",
    cell: ({ row }) => {
      const company = row.original
      return (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 overflow-hidden">
            {company.logo ? (
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={32}
                height={32}
                className="object-contain"
              />
            ) : (
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <div className="font-medium">{company.name}</div>
            {company.contactName && (
              <div className="text-sm text-muted-foreground">{company.contactName}</div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "contact",
    header: "Información de Contacto",
    cell: ({ row }) => {
      const company = row.original
      return (
        <div className="space-y-1">
          {company.email && (
            <div className="flex items-center text-sm">
              <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
              {company.email}
            </div>
          )}
          {company.phone && (
            <div className="flex items-center text-sm">
              <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
              {company.phone}
            </div>
          )}
          {!company.email && !company.phone && (
            <span className="text-sm text-muted-foreground">Sin información de contacto</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ row }) => {
      const address = row.getValue("address") as string
      if (!address) {
        return <span className="text-muted-foreground">Sin dirección</span>
      }
      return (
        <div className="max-w-[200px] truncate" title={address}>
          {address}
        </div>
      )
    },
  },
  {
    accessorKey: "companyId",
    header: "Cédula Jurídica",
    cell: ({ row }) => {
      const companyId = row.getValue("companyId") as string
      if (!companyId) {
        return <span className="text-muted-foreground">Sin cédula</span>
      }
      return <div className="font-mono text-sm">{companyId}</div>
    },
  },
  {
    accessorKey: "tenantCompany.name",
    header: "Organización",
    cell: ({ row }) => {
      const company = row.original.tenantCompany
      return (
        <div>
          <div className="font-medium">{company.name}</div>
          <div className="text-sm text-muted-foreground">{company.subdomain}</div>
        </div>
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
      const company = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewSites(company.id)}>
              <MapPin className="mr-2 h-4 w-4" />
              Ver Sedes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(company.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(company.id, company.name)}
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

  return (
    <div className="container mx-auto py-6">
      <DataTable
        columns={columns}
        data={clientCompanies}
        searchKey="name"
        searchPlaceholder="Buscar empresas cliente..."
        title="Empresas Cliente"
        description="Gestionar empresas cliente para órdenes de trabajo e inventario de equipos"
        onAdd={handleAddClientCompany}
        addLabel="Agregar Empresa Cliente"
        loading={loading}
      />
    </div>
  )
}