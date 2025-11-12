import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Control } from "react-hook-form"
import { AdminUserFormData, INTERNAL_ROLES, EXTERNAL_ROLES, ADMIN_TIMEZONES } from "@/schemas/admin-user"

interface AdminUserRoleSettingsProps {
  control: Control<AdminUserFormData>
  isExternalUser: boolean
  selectedRole: string | undefined
  currentUserRole?: string
}

export function AdminUserRoleSettings({ control, isExternalUser, selectedRole, currentUserRole }: AdminUserRoleSettingsProps) {
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

  return (
    <>
      {/* Role Selection */}
      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rol</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
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
              </SelectContent>
            </Select>
            <FormDescription>
              {isExternalUser
                ? `Usuarios externos: Admin General (acceso a todas las sedes), Admin de Sede (acceso a sede específica), Operario (reportar incidencias)`
                : currentUserRole === "ADMIN_GRUPO"
                  ? "ADMIN_GRUPO puede crear: Admin Empresa, Jefe de Mantenimiento, Supervisor y Técnico"
                  : "ADMIN_EMPRESA puede crear: Jefe de Mantenimiento, Supervisor y Técnico"
              }
              {isExternalUser && requiresSite && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded text-amber-800 dark:text-amber-200 text-xs">
                  ⚠️ Este rol requiere asignación a una sede específica
                </div>
              )}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
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