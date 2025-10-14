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
import { Edit, MoreHorizontal, Trash2, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: string
  image: string | null
  createdAt: string
  company: {
    id: string
    name: string
    subdomain: string
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    router.push("/admin/users/new")
  }

  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`)
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (confirm(`¿Está seguro que desea desactivar al usuario "${userName}"?`)) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const result = await response.json()
          toast.success(result.message || 'Usuario desactivado exitosamente')
          fetchUsers() // Refresh the list
        } else {
          const error = await response.json()
          toast.error(error.error || 'Error al desactivar el usuario')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('Error al desactivar el usuario')
      }
    }
  }

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Usuario",
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
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge variant={getRoleBadgeVariant(role)}>
          <Shield className="mr-1 h-3 w-3" />
          {role.replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: "company.name",
    header: "Empresa",
    cell: ({ row }) => {
      const company = row.original.company
      if (!company) {
        return <span className="text-muted-foreground">Sin empresa</span>
      }
      return (
        <div>
          <div className="font-medium">{company.name}</div>
          <div className="text-sm text-muted-foreground">{company.subdomain}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "emailVerified",
    header: "Estado",
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified") as boolean
      return (
        <Badge variant={verified ? "default" : "secondary"}>
          {verified ? "Verificado" : "Pendiente"}
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
            <DropdownMenuItem onClick={() => handleEdit(user.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(user.id, user.name)}
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
        data={users}
        searchKey="name"
        searchPlaceholder="Buscar usuarios..."
        title="Usuarios"
        description="Gestionar todos los usuarios del sistema"
        onAdd={handleAddUser}
        addLabel="Agregar Usuario"
        loading={loading}
      />
    </div>
  )
}