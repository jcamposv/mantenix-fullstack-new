/**
 * Role Permissions Selector
 * Main component for selecting role permissions grouped by module
 */

import { useState, useEffect } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { CustomRoleFormData } from '@/schemas/custom-role';
import { PermissionModuleGroup } from './permission-module-group';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

interface RolePermissionsSelectorProps {
  control: Control<CustomRoleFormData>;
}

// Module labels mapping (excluding super admin only modules)
const MODULE_LABELS: Record<string, string> = {
  alerts: 'Alertas',
  work_orders: 'Órdenes de Trabajo',
  work_order_templates: 'Plantillas de OT',
  users: 'Usuarios',
  assets: 'Activos',
  client_companies: 'Empresas Cliente',
  sites: 'Sedes',
  custom_roles: 'Roles Personalizados',
  attendance: 'Asistencia',
  locations: 'Ubicaciones',
  inventory: 'Inventario',
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  production_lines: 'Líneas de Producción'
};

export function RolePermissionsSelector({ control }: RolePermissionsSelectorProps) {
  // Use SWR hook for admin permissions
  const { permissionGroups: rawPermissionGroups, loading } = useAdminPermissions({
    grouped: true,
    forCustomRole: true
  });

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const selectedPermissions = useWatch({
    control,
    name: 'permissionIds'
  }) || [];

  // Map module names to labels
  const permissionGroups = rawPermissionGroups.map((group) => ({
    ...group,
    label: MODULE_LABELS[group.module] || group.module
  }));

  // Expand all modules by default when data loads
  useEffect(() => {
    if (permissionGroups.length > 0 && expandedModules.size === 0) {
      const allModules = new Set(permissionGroups.map((g) => g.module));
      setExpandedModules(allModules);
    }
  }, [permissionGroups, expandedModules.size]);

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Permisos del Rol</h3>
          <p className="text-sm text-muted-foreground">
            Selecciona los permisos que tendrá este rol
          </p>
        </div>
        <Badge variant="secondary">
          <ShieldCheck className="h-3 w-3 mr-1" />
          {selectedPermissions.length} seleccionados
        </Badge>
      </div>

      <FormField
        control={control}
        name="permissionIds"
        render={() => (
          <FormItem>
            <div className="space-y-2">
              {permissionGroups.map((group) => (
                <PermissionModuleGroup
                  key={group.module}
                  module={group.module}
                  label={group.label}
                  permissions={group.permissions}
                  control={control}
                  isExpanded={expandedModules.has(group.module)}
                  onToggle={() => toggleModule(group.module)}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
