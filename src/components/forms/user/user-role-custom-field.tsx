/**
 * User Role and Custom Role Field
 * Allows selecting base roles or custom roles for user
 */

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Control, UseFormSetValue } from 'react-hook-form';
import { UserFormData } from './user-form-schema';
import { ROLES } from './user-form-constants';
import { getRoleBadgeVariant } from './user-form-utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getRolesCreatableBy } from '@/lib/rbac/role-definitions';
import { Role } from '@prisma/client';

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

interface UserRoleCustomFieldProps {
  control: Control<UserFormData>;
  setValue: UseFormSetValue<UserFormData>;
  restrictedMode?: boolean;
  onChange?: (isCustomRole: boolean) => void;
}

export function UserRoleCustomField({
  control,
  setValue,
  restrictedMode = false,
  onChange
}: UserRoleCustomFieldProps) {
  const { user: currentUser } = useCurrentUser();
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Use centralized system to determine available base roles
  const availableBaseRoles = restrictedMode && currentUser?.role
    ? getRolesCreatableBy(currentUser.role as Role)
    : ROLES;

  useEffect(() => {
    const fetchCustomRoles = async () => {
      if (!currentUser?.company?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/custom-roles');
        if (response.ok) {
          const data = await response.json();
          setCustomRoles(data);
        }
      } catch (error) {
        console.error('Error fetching custom roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomRoles();
  }, [currentUser?.company?.id]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField<UserFormData>
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rol Base *</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Clear custom role when base role is selected
                setValue('customRoleId', null);
                onChange?.(false);
              }}
              value={field.value as string | undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol base" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableBaseRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRoleBadgeVariant(role.value)}>{role.label}</Badge>
                      <span className="text-sm text-muted-foreground">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Rol predefinido del sistema</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField<UserFormData>
        control={control}
        name="customRoleId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rol Personalizado (Opcional)</FormLabel>
            <Select
              onValueChange={(value) => {
                if (value === 'none') {
                  field.onChange(null);
                  onChange?.(false);
                } else {
                  field.onChange(value);
                  onChange?.(true);
                }
              }}
              value={(field.value as string | undefined) || 'none'}
              disabled={loading || customRoles.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sin rol personalizado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles Personalizados</SelectLabel>
                  <SelectItem value="none">Sin rol personalizado</SelectItem>
                  {customRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
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
              </SelectContent>
            </Select>
            <FormDescription>
              {customRoles.length === 0
                ? 'No hay roles personalizados creados'
                : 'Si se selecciona, sobreescribe los permisos del rol base'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
