/**
 * Custom Role Form
 * Main form component for creating/editing custom roles
 */

"use client";

import { useForm, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { customRoleSchema, CustomRoleFormData } from '@/schemas/custom-role';
import { RoleBasicInfo } from './custom-role/role-basic-info';
import { RolePermissionsSelector } from './custom-role/role-permissions-selector';

interface CustomRoleFormProps {
  onSubmit: (data: CustomRoleFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  defaultValues?: CustomRoleFormData;
  mode?: 'create' | 'edit';
}

export function CustomRoleForm({
  onSubmit,
  onCancel,
  loading,
  defaultValues,
  mode = 'create'
}: CustomRoleFormProps) {
  const form = useForm({
    resolver: zodResolver(customRoleSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      color: '#3b82f6',
      interfaceType: 'MOBILE',
      permissionIds: []
    }
  });

  const handleSubmit = async (data: CustomRoleFormData) => {
    await onSubmit(data);
  };

  return (
    <Card className="w-full shadow-none border-none mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'edit' ? 'Editar Rol' : 'Crear Rol Personalizado'}</CardTitle>
        <CardDescription>
          Define un rol con permisos específicos para tu equipo (ej: Mecánico, Fontanero,
          Electricista)
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <RoleBasicInfo control={form.control as unknown as Control<CustomRoleFormData>} />

            {/* Permissions Selector */}
            <RolePermissionsSelector control={form.control as unknown as Control<CustomRoleFormData>} />

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : mode === 'edit' ? (
                  'Actualizar Rol'
                ) : (
                  'Crear Rol'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
