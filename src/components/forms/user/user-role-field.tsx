import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Control } from "react-hook-form"
import { UserFormData } from "./user-form-schema"
import { ROLES } from "./user-form-constants"
import { getRoleBadgeVariant } from "./user-form-utils"

interface UserRoleFieldProps {
  control: Control<UserFormData>
  selectedRole: string
  restrictedMode?: boolean
}

export function UserRoleField({ control, selectedRole, restrictedMode = false }: UserRoleFieldProps) {
  const availableRoles = restrictedMode 
    ? ROLES.filter(role => !["SUPER_ADMIN", "ADMIN_EMPRESA"].includes(role.value))
    : ROLES
  return (
    <FormField<UserFormData>
      control={control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(role.value)}>
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
          {selectedRole && (
            <FormDescription>
              Selected: <Badge variant={getRoleBadgeVariant(selectedRole)}>
                {availableRoles.find(r => r.value === selectedRole)?.label}
              </Badge>
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}