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
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Edit", company.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log("Delete", company.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCompany = () => {
    router.push("/super-admin/companies/new")
  }

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