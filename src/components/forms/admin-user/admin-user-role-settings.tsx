import { useState, useEffect } from "react"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Control, useWatch, UseFormSetValue } from "react-hook-form"
import { AdminUserFormData, INTERNAL_ROLES, EXTERNAL_ROLES, ADMIN_TIMEZONES } from "@/schemas/admin-user"
import { useCurrentUser } from "@/hooks/useCurrentUser"

interface CustomRole {
  id: string
  name: string
  description: string | null
  color: string
}

interface AdminUserRoleSettingsProps {
  control: Control<AdminUserFormData>
  setValue: UseFormSetValue<AdminUserFormData>
  isExternalUser: boolean
  selectedRole: string | undefined
  currentUserRole?: string
}

export function AdminUserRoleSettings({ control, setValue, isExternalUser, selectedRole, currentUserRole }: AdminUserRoleSettingsProps) {
  const { user: currentUser } = useCurrentUser()
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([])

  // Watch the customRoleId value
  const customRoleId = useWatch({ control, name: 'customRoleId' })

  // Get available roles based on user type
  let availableRoles = isExternalUser ? EXTERNAL_ROLES : INTERNAL_ROLES

  // Filter roles based on current user's role
  if (!isExternalUser && currentUserRole === "ADMIN_EMPRESA") {
    // ADMIN_EMPRESA cannot create other ADMIN_EMPRESA users
    availableRoles = INTERNAL_ROLES.filter(role => role.value !== "ADMIN_EMPRESA")
  }

  // Check if selected role requires site assignment
  const selectedRoleData = EXTERNAL_ROLES.find(role => role.value === selectedRole)
  const requiresSite = selectedRoleData?.requiresSite || false

  // Fetch custom roles for internal users
  useEffect(() => {
    const fetchCustomRoles = async () => {
      if (isExternalUser || !currentUser?.company?.id) {
        return
      }

      try {
        const response = await fetch('/api/admin/custom-roles')
        if (response.ok) {
          const data = await response.json()
          setCustomRoles(data)
        }
      } catch (error) {
        console.error('Error fetching custom roles:', error)
      }
    }

    fetchCustomRoles()
  }, [isExternalUser, currentUser?.company?.id])
  
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN_EMPRESA":
        return "default"
      case "JEFE_MANTENIMIENTO":
        return "default"
      case "SUPERVISOR":
        return "secondary"
      case "TECNICO":
        return "default"
      case "CLIENTE_ADMIN_GENERAL":
        return "default"
      case "CLIENTE_ADMIN_SEDE":
        return "secondary"
      case "CLIENTE_OPERARIO":
        return "outline"
      default:
        return "outline"
    }
  }

  const handleRoleChange = (value: string, field: { onChange: (value: string) => void }) => {
    // Check if it's a custom role (starts with custom_)
    if (value.startsWith('custom_')) {
      const customRoleId = value.replace('custom_', '')
      // Set a default base role (TECNICO) and the custom role ID
      field.onChange('TECNICO')
      setValue('customRoleId', customRoleId)
    } else {
      // It's a base role, clear custom role
      field.onChange(value)
      setValue('customRoleId', null)
    }
  }

  // Get the current selected value (either base role or custom_<id>)
  const getCurrentValue = (baseRole: string | undefined, customRoleId: string | null | undefined) => {
    if (customRoleId) {
      return `custom_${customRoleId}`
    }
    return baseRole
  }

  return (
    <>
      {/* Unified Role Selection */}
      <FormField
        control={control}
        name="role"
        render={({ field }) => {
          const currentValue = getCurrentValue(field.value, customRoleId)

          return (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select
                onValueChange={(value) => handleRoleChange(value, field)}
                value={currentValue}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Base Roles Group */}
                  <SelectGroup>
                    <SelectLabel>Roles del Sistema</SelectLabel>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getRoleBadgeVariant(role.value)} className="text-xs">
                            {role.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {role.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  {/* Custom Roles Group (only for internal users) */}
                  {!isExternalUser && customRoles.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Roles Personalizados</SelectLabel>
                      {customRoles.map((role) => (
                        <SelectItem key={`custom_${role.id}`} value={`custom_${role.id}`}>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: role.color }}
                            />
                            <span>{role.name}</span>
                            {role.description && (
                              <span className="text-sm text-muted-foreground">
                                - {role.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                {isExternalUser
                  ? `Usuarios externos: Admin General (acceso a todas las sedes), Admin de Sede (acceso a sede específica), Operario (reportar incidencias)`
                  : currentUserRole === "ADMIN_GRUPO"
                    ? "ADMIN_GRUPO puede crear: Admin Empresa, Jefe de Mantenimiento, Supervisor y Técnico. Los roles personalizados tienen permisos específicos configurados."
                    : "ADMIN_EMPRESA puede crear: Jefe de Mantenimiento, Supervisor y Técnico. Los roles personalizados tienen permisos específicos configurados."
                }
                {isExternalUser && requiresSite && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded text-amber-800 dark:text-amber-200 text-xs">
                    ⚠️ Este rol requiere asignación a una sede específica
                  </div>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )
        }}
      />

      {/* Additional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona Horaria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione zona horaria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ADMIN_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="locale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idioma</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione idioma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}