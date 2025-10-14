"use client"

import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { toast } from "sonner"

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

export default function CompaniesPage() {
  const router = useRouter()
  const { data: companies, loading, refetch } = useTableData<Company>({
    endpoint: '/api/admin/companies',
    transform: (data) => data.companies || data.items || data || []
  })

  const handleEdit = (companyId: string) => {
    router.push(`/super-admin/companies/${companyId}/edit`)
  }

  const handleDelete = async (company: Company) => {
    if (confirm(`¿Está seguro que desea desactivar "${company.name}"?`)) {
      try {
        const response = await fetch(`/api/super-admin/companies/${company.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const result = await response.json()
          toast.success(result.message || 'Empresa desactivada exitosamente')
          refetch()
        } else {
          const error = await response.json()
          toast.error(error.error || 'Error al desactivar la empresa')
        }
      } catch (error) {
        console.error('Error deleting company:', error)
        toast.error('Error al desactivar la empresa')
      }
    }
  }

  const handleAddCompany = () => {
    router.push("/super-admin/companies/new")
  }

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: "Company Name",
      cell: ({ row }) => {
        const company = row.original
        return (
          <div className="flex items-center space-x-2">
            {company.logo && (
              <img 
                src={company.logo} 
                alt={company.name} 
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
      header: "Tier",
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
      header: "Users",
      cell: ({ row }) => {
        return <div className="text-center">{row.original._count.users}</div>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
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
        searchPlaceholder="Search companies..."
        title="Companies"
        description="Manage all companies in the system"
        onAdd={handleAddCompany}
        addLabel="Add Company"
        loading={loading}
      />
    </div>
  )
}