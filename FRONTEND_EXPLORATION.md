# Exploración Frontend - Patrones y Componentes Reutilizables

## 1. Estructura de Carpetas del Frontend

```
src/
├── app/
│   ├── (dashboard)/                    # Layout con navbar y sidebar
│   │   ├── admin/                     # Páginas de administración
│   │   │   ├── layout.tsx             # Control de permisos (super-admin)
│   │   │   ├── sites/                 # Crud completo (list/create/edit)
│   │   │   ├── users/                 # Crud de usuarios
│   │   │   ├── client-companies/      # Crud de empresas clientes
│   │   │   ├── locations/
│   │   │   ├── attendance/
│   │   │   ├── work-order-templates/
│   │   │   └── work-order-prefixes/
│   │   ├── super-admin/
│   │   ├── work-orders/
│   │   ├── alerts/
│   │   └── page.tsx                   # Dashboard principal
│   ├── api/                           # API routes
│   ├── mobile/                        # UI móvil
│   └── layout.tsx                     # Layout global
├── components/
│   ├── ui/                            # shadcn/ui components (sin lógica)
│   │   ├── data-table.tsx             # Tabla genérica (TanStack Table)
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   └── ...más de 30 componentes
│   ├── forms/                         # Formularios con react-hook-form + zod
│   │   ├── site-form.tsx
│   │   ├── site/
│   │   │   ├── site-basic-info.tsx
│   │   │   ├── site-contact-info.tsx
│   │   │   └── site-location-info.tsx
│   │   ├── user-form.tsx
│   │   ├── user/
│   │   │   ├── user-basic-fields.tsx
│   │   │   ├── user-role-field.tsx
│   │   │   ├── user-company-field.tsx
│   │   │   ├── user-preferences-fields.tsx
│   │   │   ├── user-form-schema.ts    # Zod schema dinámico
│   │   │   └── user-form-utils.ts
│   │   ├── asset-form.tsx
│   │   ├── client-company/
│   │   ├── location-form.tsx
│   │   └── ...más formularios
│   ├── common/                        # Componentes reutilizables
│   │   ├── table-actions.tsx          # Acciones genéricas de tabla
│   │   ├── confirm-dialog.tsx         # Diálogo de confirmación
│   │   ├── user-avatar.tsx            # Avatar de usuario
│   │   ├── role-badge.tsx             # Badge de rol
│   │   └── ...más comunes
│   ├── hooks/                         # Hooks para fetching
│   │   ├── use-table-data.ts          # Hook genérico para tablas
│   │   ├── use-companies.ts           # Hook específico de empresas
│   │   └── ...más hooks
│   ├── skeletons/                     # Componentes de loading
│   │   ├── data-table-skeleton.tsx
│   │   └── ...más skeletons
│   ├── app-sidebar.tsx
│   └── ...más componentes
├── hooks/                             # Hooks a nivel app
│   ├── useCurrentUser.ts
│   ├── useUserRole.ts
│   ├── useCompanyFeatures.ts
│   └── ...más hooks globales
├── schemas/                           # Zod schemas para validación
│   ├── site.ts
│   ├── user.ts
│   ├── asset.ts
│   ├── client-company.ts
│   └── ...más schemas
├── types/                             # TypeScript types
│   ├── user.types.ts
│   ├── site.types.ts
│   └── ...más tipos
└── lib/                               # Funciones utilitarias
```

---

## 2. Patrones de Páginas Admin (CRUD)

### Patrón de Estructura de Carpetas para Admin

```
/admin/[resource]/
├── page.tsx              # Lista (READ)
├── new/
│   └── page.tsx          # Crear (CREATE)
└── [id]/
    └── edit/
        └── page.tsx      # Editar (UPDATE)
```

**Nota:** Delete es una acción inline en la tabla, no una página separada.

---

## 3. Ejemplo Completo: Sites CRUD

### 3.1 Lista de Sitios (`/admin/sites/page.tsx`)

**Características clave:**
- Hook `useTableData` para fetching
- Componente `DataTable` de TanStack Table
- Columnas personalizadas con iconos y información enriquecida
- Acciones inline (edit/delete)
- Filtrado por búsqueda
- Dialogo de confirmación para eliminar
- Estados de loading con esqueletos

```typescript
// Estructura típica
const { data: allSites, loading, refetch } = useTableData<Site>({
  endpoint: '/api/admin/sites',
  transform: (data) => (data as SitesResponse).sites || []
})

// Columnas con ColumnDef de TanStack Table
const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "name",
    header: "Sede",
    cell: ({ row }) => <CustomCell /> // Renderizado personalizado
  },
  // ... más columnas
  {
    id: "actions",
    cell: ({ row }) => {
      const actions = [
        createEditAction(() => handleEdit(row.original.id)),
        createDeleteAction(() => handleDelete(row.original))
      ]
      return <TableActions actions={actions} />
    }
  }
]

// Render
<DataTable
  columns={columns}
  data={sites}
  searchKey="name"
  searchPlaceholder="Buscar sedes..."
  title="Sedes"
  onAdd={handleAddSite}
  addLabel="Agregar Sede"
  loading={loading}
/>
```

### 3.2 Crear Sitio (`/admin/sites/new/page.tsx`)

**Estructura simple:**
```typescript
const handleSubmit = async (data: SiteFormData) => {
  const response = await fetch('/api/admin/sites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (response.ok) {
    toast.success('Sede creada exitosamente')
    router.push('/admin/sites')
  }
}

return (
  <SiteForm
    onSubmit={handleSubmit}
    onCancel={handleCancel}
    loading={loading}
  />
)
```

### 3.3 Editar Sitio (`/admin/sites/[id]/edit/page.tsx`)

**Características:**
- Fetch inicial del item
- Skeleton mientras carga
- Formulario pre-llenado
- Validación y actualización

```typescript
useEffect(() => {
  const fetchSite = async () => {
    const response = await fetch(`/api/admin/sites/${id}`)
    const data = await response.json()
    setInitialData({ /* mapeo de datos */ })
  }
  fetchSite()
}, [id])

const handleSubmit = async (data: SiteFormData) => {
  const response = await fetch(`/api/admin/sites/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

return (
  <SiteForm
    onSubmit={handleSubmit}
    onCancel={handleCancel}
    loading={loading}
    initialData={initialData}
  />
)
```

---

## 4. Componentes de Formularios Reutilizables

### 4.1 Patrón de Formulario Modular

Los formularios se dividen en **componentes específicos** que encapsulan campos relacionados:

```
FormComponent/
├── FormComponent.tsx          # Componente principal
├── FormComponent/
│   ├── SubSection1.tsx        # Sección 1 (grupos de campos)
│   ├── SubSection2.tsx        # Sección 2
│   └── form-schema.ts         # Schema Zod (si dinámico)
```

**Ejemplo: SiteForm**
```typescript
<SiteForm>
  <SiteBasicInfo />      // Nombre + Empresa Cliente
  <SiteContactInfo />    // Contacto + Email + Teléfono
  <SiteLocationInfo />   // Coordenadas + Zona Horaria
</SiteForm>
```

### 4.2 Patrón de Campos Individuales

**Estructura típica de un componente de campo:**
```typescript
interface SiteBasicInfoProps {
  control: Control<SiteFormData>
  clientCompanies: ClientCompany[]
  loadingClientCompanies: boolean
}

export function SiteBasicInfo({ 
  control, 
  clientCompanies, 
  loadingClientCompanies 
}: SiteBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Sede</FormLabel>
            <FormControl>
              <Input placeholder="..." {...field} />
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
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {clientCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
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

### 4.3 Schema Zod Pattern

**Schemas simples (site):**
```typescript
export const siteSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientCompanyId: z.string().min(1, "La empresa cliente es requerida"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().or(z.literal("")),
  timezone: z.string(),
})

export type SiteFormData = z.infer<typeof siteSchema>
```

**Schemas dinámicos (user):**
```typescript
export const createUserSchema = (mode: "create" | "invite" | "edit") => 
  z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: mode === "create"
      ? z.string().min(8, "Password must be at least 8 characters")
      : z.string().optional(),
    role: z.enum([...])
    // ... más campos
  })

export type UserFormData = z.infer<ReturnType<typeof createUserSchema>>
```

### 4.4 Componente SiteForm Completo

```typescript
interface SiteFormProps {
  onSubmit: (data: SiteFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<SiteFormData>  // Para edición
}

export function SiteForm({ 
  onSubmit, 
  onCancel, 
  loading, 
  initialData 
}: SiteFormProps) {
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([])
  const [loadingClientCompanies, setLoadingClientCompanies] = useState(true)

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: initialData?.name || "",
      clientCompanyId: initialData?.clientCompanyId || "",
      address: initialData?.address || "",
      // ... más defaultValues
    },
  })

  useEffect(() => {
    fetchClientCompanies()
  }, [])

  const handleSubmit = (data: SiteFormData) => {
    onSubmit(data)  // Delegado a la página
  }

  return (
    <Card>
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
                {loading ? "Guardando..." : "Guardar"}
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

## 5. Componentes de Tabla y Listados

### 5.1 DataTable - Componente Genérico

**Ubicación:** `/components/ui/data-table.tsx`

**Características:**
- Construido con TanStack Table v8
- Soporte para ordenamiento, filtrado, búsqueda
- Paginación (10, 20, 30, 40, 50 filas)
- Visibilidad de columnas customizable
- Selección de filas
- Skeletons de loading
- Header con título, descripción y botón agregar

**Props:**
```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]  // De TanStack Table
  data: TData[]
  searchKey?: string                    // Campo para filtrar
  searchPlaceholder?: string
  title?: string
  description?: string
  onAdd?: () => void                    // Callback agregar
  addLabel?: string
  loading?: boolean
  hideHeader?: boolean
  initialColumnVisibility?: VisibilityState
}
```

**Uso:**
```typescript
<DataTable
  columns={columns}
  data={sites}
  searchKey="name"                      // Búsqueda por nombre
  searchPlaceholder="Buscar sedes..."
  title="Sedes"
  description="Gestionar todas las sedes"
  onAdd={() => router.push("/admin/sites/new")}
  addLabel="Agregar Sede"
  loading={loading}
/>
```

### 5.2 TableActions - Acciones en Filas

**Ubicación:** `/components/common/table-actions.tsx`

**Características:**
- Dropdown menu con acciones
- Funciones helper predefinidas
- Soporte para variantes (destructive)

**Funciones Helper:**
```typescript
createEditAction(onClick: () => void)
createDeleteAction(onClick: () => void, disabled?: boolean)
createDeactivateAction(onClick: () => void)
createResetPasswordAction(onClick: () => void, disabled?: boolean)
createViewAction(onClick: () => void)
createPrintAction(onClick: () => void)
```

**Uso en columnas:**
```typescript
{
  id: "actions",
  cell: ({ row }) => {
    const actions = [
      createEditAction(() => handleEdit(row.original.id)),
      createDeleteAction(() => handleDelete(row.original))
    ]
    return <TableActions actions={actions} />
  },
}
```

### 5.3 Ejemplo de Columnas Complejas

```typescript
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
            <Building2 className="mr-1 h-3 w-3" />
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
    accessorKey: "timezone",
    header: "Zona Horaria",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("timezone")}</Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Creado",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
]
```

---

## 6. Componentes Comunes Reutilizables

### 6.1 ConfirmDialog

**Ubicación:** `/components/common/confirm-dialog.tsx`

Para confirmaciones antes de acciones destructivas (delete, deactivate).

```typescript
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string           // "Eliminar", "Desactivar", etc
  cancelText?: string
  onConfirm: () => void
  variant?: "default" | "destructive"
  loading?: boolean              // Estado durante la operación
}
```

**Uso:**
```typescript
const [deleteDialog, setDeleteDialog] = useState(false)
const [itemToDelete, setItemToDelete] = useState<Site | null>(null)

const handleDelete = (site: Site) => {
  setItemToDelete(site)
  setDeleteDialog(true)
}

const confirmDelete = async () => {
  const response = await fetch(`/api/admin/sites/${itemToDelete.id}`, {
    method: 'DELETE'
  })
  // ... manejar respuesta
}

return (
  <>
    <DataTable /* ... */ />
    
    <ConfirmDialog
      open={deleteDialog}
      onOpenChange={setDeleteDialog}
      title="Desactivar Sede"
      description={`¿Seguro desactivar "${itemToDelete?.name}"?`}
      confirmText="Desactivar"
      cancelText="Cancelar"
      onConfirm={confirmDelete}
      variant="destructive"
    />
  </>
)
```

### 6.2 UserAvatar

**Ubicación:** `/components/common/user-avatar.tsx`

Muestra avatar del usuario con fallback a iniciales.

```typescript
interface UserAvatarProps {
  name: string
  image?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

// Uso en tablas
<UserAvatar name={user.name} image={user.image} size="md" />
```

### 6.3 RoleBadge

**Ubicación:** `/components/common/role-badge.tsx`

Muestra el rol del usuario con color codificado.

```typescript
const ROLE_CONFIG = {
  SUPER_ADMIN: { variant: "destructive", label: "Súper Admin" },
  ADMIN_EMPRESA: { variant: "default", label: "Admin Empresa" },
  SUPERVISOR: { variant: "secondary", label: "Supervisor" },
  TECNICO: { variant: "outline", label: "Técnico" },
  // ... más roles
}

// Uso
<RoleBadge role={user.role} />
```

---

## 7. Hooks Personalizados para Fetching

### 7.1 useTableData - Hook Genérico

**Ubicación:** `/components/hooks/use-table-data.ts`

Abstracciona el fetching de datos para tablas.

```typescript
interface UseTableDataOptions<T> {
  endpoint: string
  transform?: (data: unknown) => T[]  // Transformar respuesta API
  dependencies?: unknown[]             // Dep array para refetch
}

export function useTableData<T>({ 
  endpoint, 
  transform, 
  dependencies = [] 
}: UseTableDataOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(endpoint)
      const result = await response.json()
      
      // Manejo inteligente de respuestas variadas
      const items = result.items || result.companies || result.users || result.sites || result
      const transformedData = transform ? transform(items) : items
      
      setData(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  const refetch = () => {
    fetchData()  // Para refrescar después de CRUD
  }

  return { data, loading, error, refetch, setData }
}
```

**Uso:**
```typescript
const { data: sites, loading, refetch } = useTableData<Site>({
  endpoint: '/api/admin/sites',
  transform: (data) => (data as SitesResponse).sites || []
})

// Después de crear/editar/eliminar:
refetch()  // Refresca la tabla
```

### 7.2 useCompanies - Hook Específico

**Ubicación:** `/components/hooks/use-companies.ts`

Ejemplo de hook específico para un recurso.

```typescript
export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || data || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  return { companies, loading, refetch: fetchCompanies }
}
```

### 7.3 Hooks Globales

**Ubicación:** `/hooks/`

```typescript
useCurrentUser()          // Usuario actualmente logueado
useUserRole()             // { isSuperAdmin, isCompanyAdmin, loading }
useCompanyFeatures()      // Features habilitadas para empresa
useUserSites()            // Sitios asignados al usuario
usePlatformSwitch()       // Para cambiar entre plataformas
```

---

## 8. Componentes shadcn/ui Implementados

### Componentes UI Base (sin lógica)
```
button.tsx
input.tsx
select.tsx
form.tsx               # Integración react-hook-form
card.tsx
dialog.tsx
badge.tsx
tabs.tsx
popover.tsx
dropdown-menu.tsx
avatar.tsx
label.tsx
calendar.tsx
alert.tsx
progress.tsx
switch.tsx
tooltip.tsx
breadcrumb.tsx
scroll-area.tsx
sheet.tsx
sonner.tsx             # Toast notifications
```

### Patrón de Uso de Form Components

```typescript
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// En el componente
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ }
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input placeholder="..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

## 9. Patrones de Validación y Errores

### 9.1 Zod + react-hook-form

**Patrón de validación:**
```typescript
const schema = z.object({
  field1: z.string().min(2, "Al menos 2 caracteres"),
  field2: z.string().email("Email inválido").or(z.literal("")),
  field3: z.string().optional(),
})

const form = useForm({
  resolver: zodResolver(schema),
  mode: "onBlur"  // Validar al salir del campo
})
```

**Manejo de errores API:**
```typescript
try {
  const response = await fetch(endpoint, { method: 'POST', body })
  
  if (!response.ok) {
    const error = await response.json()
    toast.error(error.error || 'Error desconocido')
    return
  }
  
  toast.success('Operación exitosa')
} catch (error) {
  toast.error('Error al conectar con el servidor')
}
```

---

## 10. Control de Permisos y Seguridad

### 10.1 Layout de Admin con Protección

```typescript
// /app/(dashboard)/admin/layout.tsx
"use client"

import { useUserRole } from "@/hooks/useUserRole"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, loading, isCompanyAdmin } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isSuperAdmin && !isCompanyAdmin) {
      router.replace("/")
    }
  }, [isSuperAdmin, loading, isCompanyAdmin, router])

  if (loading) {
    return <PageSkeleton />
  }

  if (!isSuperAdmin && !isCompanyAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">No tienes permiso para acceder a esta área.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
```

### 10.2 Permisos en Formularios

```typescript
// En UserForm - Restricción de roles
if (currentUser?.role !== PermissionHelper.ROLES.SUPER_ADMIN) {
  // Non-super-admin users should use their own company
  data.companyId = currentUser?.company?.id
  
  // Restrict role selection
  const allowedRoles = [TECNICO, SUPERVISOR, CLIENTE_ADMIN_GENERAL]
  if (!allowedRoles.includes(data.role)) {
    data.role = "TECNICO"
  }
}
```

---

## 11. Skeletons y Estados de Loading

### 11.1 DataTableSkeleton

Para tablas mientras cargan datos.

```typescript
<DataTable
  columns={columns}
  data={data}
  loading={loading}  // Muestra skeleton automáticamente
/>
```

### 11.2 FormSkeleton

Para formularios mientras cargan datos iniciales (en edit).

```typescript
if (isLoading) {
  return <FormSkeleton fields={7} showTitle={true} showFooter={true} />
}
```

### 11.3 PageSkeleton

Para control de acceso mientras valida permisos.

---

## 12. Notificaciones (Toast)

### Librería: Sonner

```typescript
import { toast } from "sonner"

// Éxito
toast.success('Sede creada exitosamente')

// Error
toast.error(error.error || 'Error al crear')

// Información (implícita)
toast('Mensaje informativo')

// Carga
const id = toast.loading('Procesando...')
setTimeout(() => {
  toast.success('Completado', { id })
}, 2000)
```

---

## 13. Patrones de Navegación

### 13.1 Router de Next.js 15

```typescript
import { useRouter } from "next/navigation"

const router = useRouter()

// Navegar
router.push('/admin/sites')
router.push(`/admin/sites/${id}/edit`)

// Atrás
router.back()

// Reemplazar (sin historial)
router.replace('/login')
```

### 13.2 SearchParams para Filtros

```typescript
const searchParams = useSearchParams()
const clientCompanyId = searchParams.get('clientCompanyId')

// URL: /admin/sites?clientCompanyId=123
// Usar para filtrar resultados
const filtered = allSites.filter(s => s.clientCompany.id === clientCompanyId)
```

---

## 14. Ejemplos de Formularios Complejos

### UserForm (Dinámico según Modo)

**Modos:** create | invite | edit

**Características especiales:**
- Schema dinámico (password requerido solo en create)
- Restricción de roles según usuario actual
- Restricción de empresas según usuario actual
- Campos condicionales (invite info box)
- Upload de foto de perfil

```typescript
const form = useForm<UserFormData>({
  resolver: zodResolver(createUserSchema(mode)),  // Schema dinámico
  defaultValues: {
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: mode === "invite" || mode === "edit" ? undefined : "",
    role: initialData?.role || "TECNICO",
    // ...
  },
})

// Mostrar campos condicionales
{mode === "invite" && (
  <div className="bg-blue-50 p-4 rounded-lg">
    <h4>Proceso de Invitación</h4>
    <p>Se enviará una invitación por correo...</p>
  </div>
)}
```

---

## 15. Mejores Prácticas Observadas

### Estructura General

1. **Separación de responsabilidades**: Hooks → Pages → Forms → Field Components
2. **Componentes pequeños y reutilizables**: Cada componente tiene una única responsabilidad
3. **Props bien tipadas**: TypeScript strict con interfaces explícitas
4. **Validación centralizada**: Schemas Zod en `/schemas`

### Formularios

1. **Modularidad**: Dividir en sub-componentes por secciones lógicas
2. **Control externo**: Los componentes de campos reciben `control` de react-hook-form
3. **Manejo de loading**: Estados claros durante fetch/submit
4. **Preparación de datos**: Transformación de datos antes de enviar a API

### Tablas

1. **Columnas personalizadas**: Usar `cell` para renderizado enriquecido
2. **Acciones inline**: TableActions con dropdown menu
3. **Confirmación de destructivas**: ConfirmDialog para delete/deactivate
4. **Refetch después de cambios**: Refrescar tabla tras CRUD

### Hooks

1. **Hook genérico**: useTableData para todas las tablas
2. **Hooks específicos**: useCompanies, useUsers, etc para datos especializados
3. **Manejo de estado**: useState para diálogos, loading, etc
4. **Dependencias claras**: Dependencies array explícito en useEffect

### Seguridad

1. **Protección en layout**: Verificar permisos en AdminLayout
2. **Filtrado de opciones**: Empresas/roles filtrados según usuario actual
3. **Restricción de acciones**: Algunas acciones solo para super-admin
4. **Validación en ambos lados**: Zod + backend

---

## 16. Checklist para Nuevas Páginas Admin

- [ ] Crear schema Zod en `/schemas/[resource].ts`
- [ ] Crear componentes de campo en `/components/forms/[resource]/`
- [ ] Crear componente principal Form en `/components/forms/[resource]-form.tsx`
- [ ] Crear página de lista: `/app/(dashboard)/admin/[resource]/page.tsx`
  - [ ] Usar `useTableData` para fetching
  - [ ] Definir columnas con ColumnDef
  - [ ] Incluir TableActions con edit/delete
  - [ ] Incluir ConfirmDialog para delete
- [ ] Crear página de crear: `/app/(dashboard)/admin/[resource]/new/page.tsx`
  - [ ] Componente Form sin initialData
  - [ ] POST a `/api/admin/[resource]`
- [ ] Crear página de editar: `/app/(dashboard)/admin/[resource]/[id]/edit/page.tsx`
  - [ ] Fetch inicial en useEffect
  - [ ] Mostrar FormSkeleton mientras carga
  - [ ] Componente Form con initialData
  - [ ] PUT a `/api/admin/[resource]/[id]`
- [ ] Agregar ruta en sidebar/nav
- [ ] Agregar protecciones de permisos en layout
- [ ] Implementar API routes correspondientes (POST/PUT/DELETE)

---

## 17. Estructura Típica de una API Route

```typescript
// /app/api/admin/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Validar permisos
    // Obtener datos
    return NextResponse.json({ items: [...] })
  } catch (error) {
    return NextResponse.json(
      { error: "Error message" },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Validar con schema
    // Guardar en DB
    return NextResponse.json({ message: "Creado exitosamente" })
  } catch (error) {
    return NextResponse.json(
      { error: "Error message" },
      { status: 400 }
    )
  }
}

// /app/api/admin/[resource]/[id]/route.ts
export async function PUT(request: NextRequest) {
  // Actualizar
}

export async function DELETE(request: NextRequest) {
  // Desactivar (soft delete)
}
```

