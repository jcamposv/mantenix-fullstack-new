"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import Image from "next/image"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

interface Company {
  id: string
  name: string
  subdomain: string
  tier: string
  primaryColor: string
  logo: string | null
  createdAt: string
  _count: {
    users: number
  }
}

interface CompaniesResponse {
  companies?: Company[]
  items?: Company[]
}

export default function CompaniesPage() {
  const router = useRouter()
  const { data: companies, loading, refetch } = useTableData<Company>({
    endpoint: '/api/admin/companies',
    transform: (data) => (data as CompaniesResponse).companies || (data as CompaniesResponse).items || (data as Company[]) || []
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = (companyId: string) => {
    router.push(`/super-admin/companies/${companyId}/edit`)
  }

  const handleDelete = (company: Company) => {
    setCompanyToDelete(company)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!companyToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/super-admin/companies/${companyToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Empresa desactivada exitosamente')
        setDeleteDialogOpen(false)
        setCompanyToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar la empresa')
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      toast.error('Error al desactivar la empresa')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddCompany = () => {
    router.push("/super-admin/companies/new")
  }

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: "Nombre de Empresa",
      cell: ({ row }) => {
        const company = row.original
        return (
          <div className="flex items-center space-x-2">
            {company.logo && (
              <Image 
                src={company.logo} 
                alt={company.name} 
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <div>
              <div className="font-medium">{company.name}</div>
              <div className="text-sm text-muted-foreground">{company.subdomain}.mantenix.ai</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "tier",
      header: "Plan",
      cell: ({ row }) => {
        const tier = row.getValue("tier") as string
        return (
          <Badge variant={tier === "ENTERPRISE" ? "default" : tier === "PROFESSIONAL" ? "secondary" : "outline"}>
            {tier}
          </Badge>
        )
      },
    },
    {
      accessorKey: "_count.users",
      header: "Usuarios",
      cell: ({ row }) => {
        return <div className="text-center">{row.original._count.users}</div>
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
          <TableActions actions={[
            createEditAction(() => handleEdit(company.id)),
            createDeleteAction(() => handleDelete(company))
          ]} />
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <DataTable
        columns={columns}
        data={companies}
        searchKey="name"
        searchPlaceholder="Buscar empresas..."
        title="Empresas"
        description="Gestionar todas las empresas del sistema"
        onAdd={handleAddCompany}
        addLabel="Agregar Empresa"
        loading={loading}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Desactivar Empresa"
        description={`¿Está seguro que desea desactivar "${companyToDelete?.name}"?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}