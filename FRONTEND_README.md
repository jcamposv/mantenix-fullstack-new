# Documentación Frontend - Exploración Completa

Este conjunto de documentos proporciona una análisis exhaustivo del código frontend existente en el proyecto Mantenix.

## Archivos de Documentación

### 1. FRONTEND_SUMMARY.md (6.5 KB)
**Resumen ejecutivo rápido**

Ideal para:
- Entendimiento general rápido
- Checklist de nuevas páginas admin
- Principales patrones a seguir
- Mejores prácticas observadas

Contiene:
- Stack tecnológico
- 5 patrones principales
- Control de acceso
- Estados de loading
- Checklist para nuevas páginas

### 2. FRONTEND_EXPLORATION.md (29 KB)
**Análisis detallado de la arquitectura**

Ideal para:
- Entender la estructura completa
- Aprender todos los patrones
- Referencias para desarrollo
- Documentación de mejores prácticas

17 secciones que cubren:
1. Estructura de carpetas
2. Patrones de páginas admin (CRUD)
3. Ejemplo completo (Sites CRUD)
4. Componentes de formularios reutilizables
5. Componentes de tabla y listados
6. Componentes comunes reutilizables
7. Hooks personalizados para fetching
8. Componentes shadcn/ui implementados
9. Patrones de validación y errores
10. Control de permisos y seguridad
11. Skeletons y estados de loading
12. Notificaciones (Toast)
13. Patrones de navegación
14. Ejemplos de formularios complejos
15. Mejores prácticas observadas
16. Checklist para nuevas páginas admin
17. Estructura típica de API routes

### 3. FRONTEND_CODE_EXAMPLES.md (35 KB)
**Ejemplos de código real del proyecto**

Ideal para:
- Copiar y pegar patrones
- Referencia rápida
- Desarrollar nuevas features
- Ejemplos completos y funcionales

12 ejemplos de código real:
1. Página de listado (Sites) - Completa
2. Página de crear (Sites)
3. Página de editar (Sites)
4. Componente SiteForm principal
5. Componente SiteBasicInfo modular
6. Schema Zod
7. Hook useTableData
8. ConfirmDialog
9. TableActions
10. AdminLayout con protección
11. Página de usuarios (más compleja)
12. UserAvatar y RoleBadge

## Cómo Usar Esta Documentación

### Para Aprender Rápido
1. Lee `FRONTEND_SUMMARY.md` completo (5 min)
2. Mira el checklist de nuevas páginas
3. Consulta ejemplos específicos en `FRONTEND_CODE_EXAMPLES.md`

### Para Desarrollar Nueva Funcionalidad
1. Consulta el checklist en `FRONTEND_SUMMARY.md`
2. Abre `FRONTEND_CODE_EXAMPLES.md` para copiar patrones
3. Referencia `FRONTEND_EXPLORATION.md` si necesitas más detalle
4. Sigue el patrón de carpetas y estructura

### Para Entender la Arquitectura
1. Lee secciones 1-10 de `FRONTEND_EXPLORATION.md`
2. Examina ejemplos en `FRONTEND_CODE_EXAMPLES.md`
3. Aplica los patrones a nuevas páginas

### Para Resolver Problemas Específicos
- **Crear tabla**: Ver sección 5 de EXPLORATION + Ejemplo 1 de CODE_EXAMPLES
- **Crear formulario**: Ver sección 4 de EXPLORATION + Ejemplos 4-5 de CODE_EXAMPLES
- **Crear hook**: Ver sección 7 de EXPLORATION + Ejemplo 7 de CODE_EXAMPLES
- **Control de acceso**: Ver sección 10 de EXPLORATION + Ejemplo 10 de CODE_EXAMPLES
- **Loading states**: Ver sección 11 de EXPLORATION

## Stack Tecnológico Clave

```
Validación:       React Hook Form + Zod
UI Components:    shadcn/ui (30+ componentes)
Tablas:           TanStack Table v8
Styling:          Tailwind CSS v4 + CSS variables
Iconos:           Lucide React
Notificaciones:   Sonner
Router:           Next.js 15 (useRouter)
Framework:        Next.js 15 con App Router
```

## Patrones Principales

### 1. Estructura de Carpetas Admin CRUD
```
/admin/[resource]/
├── page.tsx              # Lista (READ)
├── new/page.tsx          # Crear (CREATE)
└── [id]/edit/page.tsx    # Editar (UPDATE)
```

### 2. Componentes por Tipo

**UI Components** (`/components/ui/`)
- Componentes shadcn/ui sin lógica
- 30+ componentes disponibles

**Form Components** (`/components/forms/`)
- Formularios con react-hook-form + zod
- Sub-componentes por secciones
- Componentes reutilizables

**Common Components** (`/components/common/`)
- ConfirmDialog
- UserAvatar
- RoleBadge
- TableActions

**Hooks** (`/components/hooks/` y `/hooks/`)
- useTableData (genérico)
- useCompanies, useUsers (específicos)
- useCurrentUser, useUserRole (globales)

**Schemas** (`/schemas/`)
- Zod schemas por recurso
- Constantes y tipos exportados

## Checklist Rápido para Nueva Página Admin

```
[ ] Crear schema Zod en /schemas/[resource].ts
[ ] Crear componentes de campo en /components/forms/[resource]/
[ ] Crear componente Form en /components/forms/[resource]-form.tsx
[ ] Crear página lista: /app/(dashboard)/admin/[resource]/page.tsx
[ ] Crear página crear: /app/(dashboard)/admin/[resource]/new/page.tsx
[ ] Crear página editar: /app/(dashboard)/admin/[resource]/[id]/edit/page.tsx
[ ] Implementar API routes (GET/POST/PUT/DELETE)
[ ] Agregar ruta en sidebar
[ ] Protección de permisos en layout
```

## Componentes Más Usados

### UI Primitivos
Button, Input, Select, Form, Card, Dialog, Badge, DropdownMenu, Avatar

### Custom Components
DataTable, TableActions, ConfirmDialog, UserAvatar, RoleBadge

### Forms
SiteForm, UserForm, AssetForm, ClientCompanyForm, LocationForm

## Hooks Principales

```typescript
// Genérico (usar para tablas)
const { data, loading, refetch } = useTableData<T>({
  endpoint: '/api/admin/[resource]',
  transform: (data) => [...]
})

// Específicos (para datos particulares)
const { companies, loading } = useCompanies()
const { user } = useCurrentUser()
const { isSuperAdmin, isCompanyAdmin } = useUserRole()
```

## Flujos Comunes

### Crear Recurso
1. Page llama Form sin initialData
2. Form se envía a API POST
3. Toast de éxito
4. Router.push a lista

### Editar Recurso
1. Page hace fetch inicial
2. Muestra FormSkeleton mientras carga
3. Form con initialData pre-llenada
4. PUT a API
5. Toast de éxito
6. Router.push a lista

### Eliminar Recurso
1. Click en TableActions delete
2. ConfirmDialog aparece
3. Fetch DELETE si usuario confirma
4. Toast de éxito
5. refetch() para actualizar tabla

### Filtrar/Buscar
1. DataTable busca en campo especificado (searchKey)
2. useTableData retorna datos completos
3. Page filtra localmente si es necesario

## Estructura General del Proyecto

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── admin/              # Admin pages
│   │   ├── super-admin/        # Super admin pages
│   │   ├── work-orders/        # Work orders
│   │   ├── alerts/             # Alerts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/                    # API routes
│   ├── mobile/                 # Mobile UI
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui (30+ componentes)
│   ├── forms/                  # Formularios
│   ├── common/                 # Componentes reutilizables
│   ├── hooks/                  # Hooks de fetching
│   ├── skeletons/              # Loading states
│   └── ...
├── hooks/                      # Hooks globales
├── schemas/                    # Zod schemas
├── types/                      # TypeScript types
├── lib/                        # Utilidades
└── server/                     # Server actions/helpers
```

## Mejores Prácticas

1. **Separación de responsabilidades**: Hooks para data, Pages para lógica, Components para UI
2. **Props tipadas**: Siempre definir interfaces explícitas
3. **Validación centralizada**: Schemas Zod
4. **Componentes pequeños**: Single Responsibility Principle
5. **Reutilización**: Máximo aprovechamiento de componentes comunes
6. **Permisos**: Validar en layout + formularios
7. **Loading states**: Skeletons y flags de loading
8. **Errores**: Toast notifications
9. **Confirmación destructiva**: ConfirmDialog antes de delete
10. **Refetch automático**: Después de CRUD

## Notas Importantes

- El proyecto está bien estructurado y es mantenible
- Los patrones son consistentes
- TypeScript estricto en todo el codebase
- Validaciones con Zod + backend
- Control de acceso en múltiples niveles
- Componentes reutilizables para eficiencia

## Recursos Rápidos

- **Tabla genérica**: DataTable + useTableData
- **Formulario modular**: Form + SubComponent + Schema
- **Confirmación**: ConfirmDialog
- **Avatar**: UserAvatar
- **Badge rol**: RoleBadge
- **Acciones**: TableActions + createEditAction/createDeleteAction
- **Protección**: AdminLayout + useUserRole
- **Notificaciones**: toast.success/error

## Ejemplos Prácticos

Todos en `FRONTEND_CODE_EXAMPLES.md`:

1. **Página lista** (230 líneas)
2. **Página crear** (45 líneas)
3. **Página editar** (100 líneas)
4. **Formulario principal** (75 líneas)
5. **Sub-componente formulario** (65 líneas)
6. **Schema** (25 líneas)
7. **Hook genérico** (45 líneas)
8. **ConfirmDialog** (65 líneas)
9. **TableActions** (75 líneas)
10. **AdminLayout** (40 líneas)
11. **Página usuarios** (250 líneas)
12. **Componentes comunes** (75 líneas)

Total: 1,000+ líneas de código real de referencia

---

**Última actualización:** 4 de noviembre de 2025

Para más información o preguntas, consulta los documentos detallados o el código fuente del proyecto.
