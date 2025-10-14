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
import { Edit, MoreHorizontal, Trash2, Shield, Building2, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: string
  image: string | null
  isExternalUser: boolean
  createdAt: string
  company: {
    id: string
    name: string
    subdomain: string
  } | null
  clientCompany: {
    id: string
    name: string
    contactName: string
  } | null
}

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "destructive"
    case "ADMIN_EMPRESA":
      return "default"
    case "SUPERVISOR":
      return "secondary"
    default:
      return "outline"
  }
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original
      const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      const user = row.original
      return (
        <div className="space-y-1">
          <Badge variant={getRoleBadgeVariant(role)}>
            <Shield className="mr-1 h-3 w-3" />
            {role.replace('_', ' ')}
          </Badge>
          {user.isExternalUser && (
            <Badge variant="outline" className="text-xs">
              <Users className="mr-1 h-3 w-3" />
              External
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "company.name",
    header: "Company",
    cell: ({ row }) => {
      const user = row.original
      const company = user.company
      const clientCompany = user.clientCompany
      
      if (!company) {
        return <span className="text-muted-foreground">No company</span>
      }
      
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <div>
              <div className="font-medium">{company.name}</div>
              <div className="text-xs text-muted-foreground">{company.subdomain}</div>
            </div>
          </div>
          {user.isExternalUser && clientCompany && (
            <div className="flex items-center space-x-1 text-xs text-orange-600">
              <Users className="h-3 w-3" />
              <span>Client: {clientCompany.name}</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "emailVerified",
    header: "Status",
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified") as boolean
      return (
        <Badge variant={verified ? "default" : "secondary"}>
          {verified ? "Verified" : "Pending"}
        </Badge>
      )
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
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Edit", user.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log("Delete", user.id)}
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

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Use a different endpoint for super admin to get all users
      const response = await fetch('/api/super-admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    router.push("/super-admin/users/new")
  }

  return (
    <div className="container mx-auto py-6">
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search users..."
        title="Users Management (Super Admin)"
        description="Manage all users across all companies and tenants"
        onAdd={handleAddUser}
        addLabel="Invite User"
        loading={loading}
      />
    </div>
  )
}