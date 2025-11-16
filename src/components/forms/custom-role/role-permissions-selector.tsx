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
import { toast } from 'sonner';
import { CustomRoleFormData } from '@/schemas/custom-role';
import { PermissionModuleGroup } from './permission-module-group';

interface Permission {
  id: string;
  key: string;
  name: string;
  description: string | null;
  module: string;
}

interface PermissionGroup {
  module: string;
  label: string;
  permissions: Permission[];
}

interface RolePermissionsSelectorProps {
  control: Control<CustomRoleFormData>;
}

// Module labels mapping
const MODULE_LABELS: Record<string, string> = {
  alerts: 'Alertas',
  work_orders: 'Órdenes de Trabajo',
  work_order_templates: 'Plantillas de OT',
  users: 'Usuarios',
  assets: 'Activos',
  client_companies: 'Empresas Cliente',
  sites: 'Sedes',
  companies: 'Empresas',
  company_groups: 'Grupos Corporativos',
  email_configuration: 'Configuración de Email',
  email_templates: 'Plantillas de Email',
  features: 'Funcionalidades',
  attendance: 'Asistencia',
  locations: 'Ubicaciones',
  inventory: 'Inventario'
};

export function RolePermissionsSelector({ control }: RolePermissionsSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const selectedPermissions = useWatch({
    control,
    name: 'permissionIds'
  }) || [];

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/admin/permissions?grouped=true');
        if (response.ok) {
          const data: PermissionGroup[] = await response.json();

          // Map module names to labels
          const groupsWithLabels = data.map((group) => ({
            ...group,
            label: MODULE_LABELS[group.module] || group.module
          }));

          setPermissionGroups(groupsWithLabels);

          // Expand all modules by default
          const allModules = new Set(groupsWithLabels.map((g) => g.module));
          setExpandedModules(allModules);
        } else {
          toast.error('Error al cargar permisos');
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
        toast.error('Error al cargar permisos');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

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
