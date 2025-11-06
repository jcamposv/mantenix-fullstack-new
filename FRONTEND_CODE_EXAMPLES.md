# Ejemplos de Código Real - Frontend

Este documento contiene ejemplos de código real del proyecto que puedes usar como referencia para crear nuevas características.

---

## 1. Página de Listado (Sites)

**Archivo:** `/src/app/(dashboard)/admin/sites/page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { MapPin, Building2, Users } from "lucide-react"
import { toast } from "sonner"
import { TableActions, createEditAction, createDeleteAction } from "@/components/common/table-actions"
import { useTableData } from "@/components/hooks/use-table-data"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

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

interface SitesResponse {
  sites?: Site[]
  items?: Site[]
}

export default function SitesPage() {
  const [filteredClientCompany, setFilteredClientCompany] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: allSites, loading, refetch } = useTableData<Site>({
    endpoint: '/api/admin/sites',
    transform: (data) => (data as SitesResponse).sites || (data as SitesResponse).items || (data as Site[]) || []
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const clientCompanyId = searchParams.get('clientCompanyId')
    setFilteredClientCompany(clientCompanyId)
  }, [searchParams])

  // Filter sites by client company if specified
  const sites = filteredClientCompany 
    ? allSites.filter((site: Site) => site.clientCompany.id === filteredClientCompany)
    : allSites

  const handleAddSite = () => {
    router.push("/admin/sites/new")
  }

  const handleEdit = (siteId: string) => {
    router.push(`/admin/sites/${siteId}/edit`)
  }

  const handleDelete = (site: Site) => {
    setSiteToDelete(site)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!siteToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/sites/${siteToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Sede desactivada exitosamente')
        setDeleteDialogOpen(false)
        setSiteToDelete(null)
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar la sede')
      }
    } catch (error) {
      console.error('Error deleting site:', error)
      toast.error('Error al desactivar la sede')
    } finally {
      setIsDeleting(false)
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
        const actions = [
          createEditAction(() => handleEdit(site.id)),
          createDeleteAction(() => handleDelete(site))
        ]
        
        return <TableActions actions={actions} />
      },
    },
  ]

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
    <div className="container mx-auto py-0">
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Desactivar Sede"
        description={`¿Está seguro que desea desactivar "${siteToDelete?.name}"?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}
```

---

## 2. Página de Crear (Sites)

**Archivo:** `/src/app/(dashboard)/admin/sites/new/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteForm } from "@/components/forms/site-form"
import { toast } from "sonner"

export default function NewSitePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Sede creada exitosamente')
        router.push('/admin/sites')
      } else {
        const error = await response.json()
        console.error('Error creating site:', error)
        toast.error(error.error || 'Error al crear la sede')
      }
    } catch (error) {
      console.error('Error creating site:', error)
      toast.error('Error al crear la sede')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <SiteForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}
```

---

## 3. Página de Editar (Sites)

**Archivo:** `/src/app/(dashboard)/admin/sites/[id]/edit/page.tsx`

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { SiteForm } from "@/components/forms/site-form"
import { toast } from "sonner"
import type { SiteFormData } from "@/schemas/site"
import { FormSkeleton } from "@/components/skeletons"

export default function EditSitePage() {
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<SiteFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    fetchSite()
  }, [id])

  const fetchSite = async () => {
    try {
      const response = await fetch(`/api/admin/sites/${id}`)
      if (response.ok) {
        const data = await response.json()
        setInitialData({
          name: data.name,
          clientCompanyId: data.clientCompany.id,
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          contactName: data.contactName || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          timezone: data.timezone || "UTC",
          notes: data.notes || "",
        })
      } else {
        const error = await response.json()
        console.error('Error fetching site:', error)
        toast.error(error.error || 'Error al cargar los datos de la sede')
        router.push('/admin/sites')
      }
    } catch (error) {
      console.error('Error fetching site:', error)
      toast.error('Error al cargar los datos de la sede')
      router.push('/admin/sites')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: SiteFormData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/sites/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Sede actualizada exitosamente')
        router.push('/admin/sites')
      } else {
        const error = await response.json()
        console.error('Error updating site:', error)
        toast.error(error.error || 'Error al actualizar la sede')
      }
    } catch (error) {
      console.error('Error updating site:', error)
      toast.error('Error al actualizar la sede')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-0">
        <FormSkeleton fields={7} showTitle={true} showFooter={true} />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-0">
        <div className="text-center">
          <p className="text-muted-foreground">No se pudieron cargar los datos de la sede.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-0">
      <SiteForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData}
      />
    </div>
  )
}
```

---

## 4. Componente Formulario Principal (SiteForm)

**Archivo:** `/src/components/forms/site-form.tsx`

```typescript
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { siteSchema, type SiteFormData } from "@/schemas/site"
import { SiteBasicInfo } from "./site/site-basic-info"
import { SiteContactInfo } from "./site/site-contact-info"
import { SiteLocationInfo } from "./site/site-location-info"

interface ClientCompany {
  id: string
  name: string
  companyId: string
  contactName: string | null
}

interface SiteFormProps {
  onSubmit: (data: SiteFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<SiteFormData>
}

export function SiteForm({ onSubmit, onCancel, loading, initialData }: SiteFormProps) {
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([])
  const [loadingClientCompanies, setLoadingClientCompanies] = useState(true)

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: initialData?.name || "",
      clientCompanyId: initialData?.clientCompanyId || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      contactName: initialData?.contactName || "",
      latitude: initialData?.latitude || "",
      longitude: initialData?.longitude || "",
      timezone: initialData?.timezone || "UTC",
      notes: initialData?.notes || "",
    },
  })

  useEffect(() => {
    fetchClientCompanies()
  }, [])

  const fetchClientCompanies = async () => {
    try {
      const response = await fetch('/api/admin/client-companies')
      if (response.ok) {
        const data = await response.json()
        setClientCompanies(data.clientCompanies || [])
      }
    } catch (error) {
      console.error('Error fetching client companies:', error)
    } finally {
      setLoadingClientCompanies(false)
    }
  }

  const handleSubmit = (data: SiteFormData) => {
    onSubmit(data)
  }

  return (
    <Card className="w-full shadow-none border-none mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Sede" : "Crear Nueva Sede"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <SiteBasicInfo 
              control={form.control} 
              clientCompanies={clientCompanies}
              loadingClientCompanies={loadingClientCompanies}
            />
            
            <SiteContactInfo control={form.control} />
            
            <SiteLocationInfo control={form.control} />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (initialData ? "Actualizando..." : "Creando...")
                  : (initialData ? "Actualizar Sede" : "Crear Sede")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

---

## 5. Componente de Campo Modular (SiteBasicInfo)

**Archivo:** `/src/components/forms/site/site-basic-info.tsx`

```typescript
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Control } from "react-hook-form"
import { SiteFormData } from "@/schemas/site"

interface ClientCompany {
  id: string
  name: string
  companyId: string
  contactName: string | null
}

interface SiteBasicInfoProps {
  control: Control<SiteFormData>
  clientCompanies: ClientCompany[]
  loadingClientCompanies: boolean
}

export function SiteBasicInfo({ control, clientCompanies, loadingClientCompanies }: SiteBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Sede</FormLabel>
            <FormControl>
              <Input placeholder="Oficina Principal, Fábrica 1, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="clientCompanyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Empresa Cliente</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una empresa cliente" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {loadingClientCompanies ? (
                  <SelectItem value="loading" disabled>
                    Cargando empresas cliente...
                  </SelectItem>
                ) : clientCompanies.length === 0 ? (
                  <SelectItem value="no-companies" disabled>
                    No hay empresas cliente disponibles
                  </SelectItem>
                ) : (
                  clientCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {company.companyId}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
```

---

## 6. Schema Zod

**Archivo:** `/src/schemas/site.ts`

```typescript
import * as z from "zod"

export const siteSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientCompanyId: z.string().min(1, "La empresa cliente es requerida"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Dirección de email inválida").or(z.literal("")),
  contactName: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  timezone: z.string(),
  notes: z.string().optional(),
})

export type SiteFormData = z.infer<typeof siteSchema>

export const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Hora del Este" },
  { value: "America/Chicago", label: "Hora Central" },
  { value: "America/Denver", label: "Hora de Montaña" },
  { value: "America/Los_Angeles", label: "Hora del Pacífico" },
  { value: "America/Mexico_City", label: "Ciudad de México" },
  { value: "America/Costa_Rica", label: "Costa Rica" },
  { value: "America/Guatemala", label: "Guatemala" },
  { value: "America/Panama", label: "Panamá" },
]
```

---

## 7. Hook Personalizado para Tablas

**Archivo:** `/src/components/hooks/use-table-data.ts`

```typescript
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface UseTableDataOptions<T> {
  endpoint: string
  transform?: (data: unknown) => T[]
  dependencies?: unknown[]
}

export function useTableData<T>({ endpoint, transform, dependencies = [] }: UseTableDataOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // Handle paginated responses
      const items = result.items || result.companies || result.users || result.sites || result
      const transformedData = transform ? transform(items) : items
      
      setData(transformedData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar datos"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  const refetch = () => {
    fetchData()
  }

  return { data, loading, error, refetch, setData }
}
```

---

## 8. Componente Común - ConfirmDialog

**Archivo:** `/src/components/common/confirm-dialog.tsx`

```typescript
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: "default" | "destructive"
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 9. Componentes Comunes - TableActions

**Archivo:** `/src/components/common/table-actions.tsx`

```typescript
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, UserX, KeyRound, Printer } from "lucide-react"

interface TableAction {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}

interface TableActionsProps {
  actions: TableAction[]
}

export function TableActions({ actions }: TableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.variant === "destructive" ? "text-destructive" : ""}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Predefined common action types
export const createEditAction = (onClick: () => void): TableAction => ({
  label: "Editar",
  icon: Edit,
  onClick,
})

export const createViewAction = (onClick: () => void): TableAction => ({
  label: "Ver",
  icon: Eye,
  onClick,
})

export const createDeleteAction = (onClick: () => void, disabled = false): TableAction => ({
  label: "Eliminar",
  icon: Trash2,
  onClick,
  variant: "destructive",
  disabled,
})

export const createDeactivateAction = (onClick: () => void): TableAction => ({
  label: "Desactivar",
  icon: UserX,
  onClick,
  variant: "destructive",
})

export const createResetPasswordAction = (onClick: () => void, disabled = false): TableAction => ({
  label: "Resetear Contraseña",
  icon: KeyRound,
  onClick,
  disabled,
})

export const createPrintAction = (onClick: () => void): TableAction => ({
  label: "Imprimir",
  icon: Printer,
  onClick,
})
```

---

## 10. AdminLayout con Protección de Permisos

**Archivo:** `/src/app/(dashboard)/admin/layout.tsx`

```typescript
"use client"

import { useUserRole } from "@/hooks/useUserRole"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageSkeleton } from "@/components/skeletons"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSuperAdmin, loading, isCompanyAdmin } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isSuperAdmin && !isCompanyAdmin) {
      router.replace("/")
    }
  }, [isSuperAdmin, loading, router, isCompanyAdmin])

  if (loading) {
    return <PageSkeleton />
  }

  if (!isSuperAdmin && !isCompanyAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">No tienes permiso para acceder a esta área.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
```

---

## 11. Página de Listado - Usuarios (Ejemplo Más Complejo)

**Archivo:** `/src/app/(dashboard)/admin/users/page.tsx`

Demuestra uso de múltiples componentes comunes (UserAvatar, RoleBadge) y manejo de múltiples diálogos.

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { toast } from "sonner"
import { UserAvatar } from "@/components/common/user-avatar"
import { RoleBadge } from "@/components/common/role-badge"
import { TableActions, createEditAction, createDeleteAction, createResetPasswordAction } from "@/components/common/table-actions"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useTableData } from "@/components/hooks/use-table-data"

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

interface UsersResponse {
  users?: User[]
  items?: User[]
}

export default function UsersPage() {
  const router = useRouter()
  const { data: users, loading, refetch } = useTableData<User>({
    endpoint: '/api/admin/users',
    transform: (data) => (data as UsersResponse).users || (data as UsersResponse).items || (data as User[]) || []
  })

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  })
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  })

  const handleAddUser = () => {
    router.push("/admin/users/new")
  }

  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`)
  }

  const handleDelete = (user: User) => {
    setDeleteDialog({ open: true, user })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.user) return

    try {
      const response = await fetch(`/api/admin/users/${deleteDialog.user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Usuario desactivado exitosamente')
        refetch()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al desactivar el usuario')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al desactivar el usuario')
    }
  }

  const handleResetPassword = (user: User) => {
    setResetPasswordDialog({ open: true, user })
  }

  const confirmResetPassword = async () => {
    if (!resetPasswordDialog.user) return

    try {
      const response = await fetch(`/api/admin/reset-password/${resetPasswordDialog.user.id}`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Link de reseteo de contraseña enviado exitosamente al correo del usuario')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al enviar link de reseteo')
      }
    } catch (error) {
      console.error('Error sending password reset:', error)
      toast.error('Error al enviar link de reseteo')
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Usuario",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center space-x-3">
            <UserAvatar name={user.name} image={user.image} />
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
        return <RoleBadge role={row.getValue("role")} />
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
        const actions = [
          createEditAction(() => handleEdit(user.id)),
          createResetPasswordAction(() => handleResetPassword(user)),
          createDeleteAction(() => handleDelete(user))
        ]

        return <TableActions actions={actions} />
      },
    },
]

  return (
    <div className="container mx-auto py-0">
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
        title="Desactivar Usuario"
        description={`¿Está seguro que desea desactivar al usuario "${deleteDialog.user?.name}"? Esta acción puede revertirse posteriormente.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      {/* Reset Password Confirmation Dialog */}
      <ConfirmDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => setResetPasswordDialog({ open, user: null })}
        title="Resetear Contraseña"
        description={`Se enviará un link de reseteo de contraseña a "${resetPasswordDialog.user?.name}" (${resetPasswordDialog.user?.email}). El usuario recibirá un correo con instrucciones para crear una nueva contraseña.`}
        confirmText="Enviar Link"
        cancelText="Cancelar"
        onConfirm={confirmResetPassword}
      />
    </div>
  )
}
```

---

## 12. Componentes Comunes - UserAvatar y RoleBadge

**Archivo:** `/src/components/common/user-avatar.tsx`

```typescript
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/components/sidebar/sidebar-utils"
import { useProfilePhotoSignedUrl } from "@/hooks/use-profile-photo-signed-url"
import { Loader2 } from "lucide-react"

interface UserAvatarProps {
  name: string
  image?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZES = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10"
} as const

export function UserAvatar({ name, image, size = "md", className }: UserAvatarProps) {
  const { signedUrl, loading } = useProfilePhotoSignedUrl(image)

  return (
    <Avatar className={`${SIZES[size]} ${className || ""}`}>
      {loading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : signedUrl ? (
        <AvatarImage src={signedUrl} alt={name} />
      ) : null}
      <AvatarFallback>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
```

**Archivo:** `/src/components/common/role-badge.tsx`

```typescript
import { Badge } from "@/components/ui/badge"

const ROLE_CONFIG = {
  SUPER_ADMIN: { variant: "destructive" as const, label: "Súper Admin" },
  ADMIN_EMPRESA: { variant: "default" as const, label: "Admin Empresa" },
  SUPERVISOR: { variant: "secondary" as const, label: "Supervisor" },
  TECNICO: { variant: "outline" as const, label: "Técnico" },
  CLIENTE_ADMIN_GENERAL: { variant: "secondary" as const, label: "Cliente Admin" },
  CLIENTE_ADMIN_SEDE: { variant: "outline" as const, label: "Admin Sede" },
  CLIENTE_OPERARIO: { variant: "outline" as const, label: "Operario" },
} as const

interface RoleBadgeProps {
  role: string
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]
  
  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {role}
      </Badge>
    )
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

export const getRoleBadgeVariant = (role: string) => {
  return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG]?.variant || "outline"
}
```

---

Este documento proporciona ejemplos prácticos reales del código del proyecto que puedes usar como referencia para crear nuevas características frontend.

