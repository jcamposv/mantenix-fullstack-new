/**
 * Authority Limit Form Component
 *
 * Form for creating/editing authority limits.
 * Part of WORKFLOW_GAPS feature.
 *
 * Following Next.js Expert standards:
 * - Client component with React Hook Form + Zod
 * - Type-safe
 * - Uses SWR for data fetching
 * - Under 200 lines
 */

'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authorityLimitSchema, type AuthorityLimitFormData } from '@/schemas/authority-limit.schema'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface AuthorityLimitFormProps {
  initialData?: Partial<AuthorityLimitFormData>
  authorityLimitId?: string
}

export function AuthorityLimitForm({
  initialData,
  authorityLimitId,
}: AuthorityLimitFormProps) {
  const router = useRouter()
  const isEditing = !!authorityLimitId

  // Fetch all available roles (system + custom, excluding SUPER_ADMIN) using SWR
  const { data: rolesData, isLoading: rolesLoading } = useSWR(
    '/api/roles/available',
    fetcher
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AuthorityLimitFormData>({
    resolver: zodResolver(authorityLimitSchema) as Resolver<AuthorityLimitFormData>,
    defaultValues: initialData || {
      canCreateWorkOrders: false,
      canAssignDirectly: false,
      isActive: true,
    },
  })

  const onSubmit = async (data: AuthorityLimitFormData) => {
    try {
      const url = isEditing
        ? `/api/authority-limits/${authorityLimitId}`
        : '/api/authority-limits'

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar')
      }

      toast.success(
        isEditing
          ? 'Límite de autoridad actualizado'
          : 'Límite de autoridad creado'
      )

      router.push('/admin/authority-limits')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    }
  }

  if (rolesLoading) {
    return <div className="text-sm text-muted-foreground">Cargando roles...</div>
  }

  const roles = rolesData || []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Role Select */}
      <div className="space-y-2">
        <Label htmlFor="roleKey">Rol *</Label>
        <Select
          onValueChange={(value) => setValue('roleKey', value)}
          defaultValue={initialData?.roleKey}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un rol" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role: { id: string; key: string | null; name: string; isSystemRole: boolean }) => (
              <SelectItem key={role.id} value={role.key || role.id}>
                {role.name} {role.isSystemRole && '(Sistema)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.roleKey && (
          <p className="text-sm text-destructive">{errors.roleKey.message}</p>
        )}
      </div>

      {/* Max Direct Authorization */}
      <div className="space-y-2">
        <Label htmlFor="maxDirectAuthorization">
          Monto Máximo de Autorización Directa (₡) *
        </Label>
        <Input
          id="maxDirectAuthorization"
          type="number"
          step="0.01"
          {...register('maxDirectAuthorization')}
          placeholder="0.00"
        />
        {errors.maxDirectAuthorization && (
          <p className="text-sm text-destructive">
            {errors.maxDirectAuthorization.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Monto hasta el cual este rol puede autorizar sin aprobación
        </p>
      </div>

      {/* Approval Level */}
      <div className="space-y-2">
        <Label htmlFor="approvalLevel">Nivel de Aprobación (1-10)</Label>
        <Input
          id="approvalLevel"
          type="number"
          min="1"
          max="10"
          {...register('approvalLevel')}
          placeholder="Dejar vacío si no puede aprobar"
        />
        {errors.approvalLevel && (
          <p className="text-sm text-destructive">{errors.approvalLevel.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Nivel mínimo que este rol puede aprobar. Dejar vacío si no puede aprobar.
        </p>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="canCreateWorkOrders"
            checked={watch('canCreateWorkOrders')}
            onCheckedChange={(checked) =>
              setValue('canCreateWorkOrders', checked as boolean)
            }
          />
          <Label htmlFor="canCreateWorkOrders" className="cursor-pointer">
            Puede crear órdenes de trabajo
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="canAssignDirectly"
            checked={watch('canAssignDirectly')}
            onCheckedChange={(checked) =>
              setValue('canAssignDirectly', checked as boolean)
            }
          />
          <Label htmlFor="canAssignDirectly" className="cursor-pointer">
            Puede asignar directamente
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={watch('isActive')}
            onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Activo
          </Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/authority-limits')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
