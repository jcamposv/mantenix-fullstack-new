/**
 * Permission Module Group
 * Collapsible group of permissions for a specific module
 */

import { Control, useWatch } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { CustomRoleFormData } from '@/schemas/custom-role';

interface Permission {
  id: string;
  key: string;
  name: string;
  description: string | null;
}

interface PermissionModuleGroupProps {
  module: string;
  label: string;
  permissions: Permission[];
  control: Control<CustomRoleFormData>;
  isExpanded: boolean;
  onToggle: () => void;
}

export function PermissionModuleGroup({
  label,
  permissions,
  control,
  isExpanded,
  onToggle
}: PermissionModuleGroupProps) {
  // Watch selected permissions
  const selectedPermissions = useWatch({
    control,
    name: 'permissionIds'
  }) || [];

  const modulePermissionIds = permissions.map((p) => p.id);
  const selectedCount = modulePermissionIds.filter((id) => selectedPermissions.includes(id))
    .length;
  const isFullySelected = selectedCount === permissions.length;
  const isPartiallySelected = selectedCount > 0 && selectedCount < permissions.length;

  // Toggle all permissions in this module
  const toggleAllPermissions = (checked: boolean, onChange: (value: string[]) => void) => {
    if (checked) {
      // Add all permissions from this module
      const newPermissions = [
        ...selectedPermissions,
        ...modulePermissionIds.filter((id) => !selectedPermissions.includes(id))
      ];
      onChange(newPermissions);
    } else {
      // Remove all permissions from this module
      const newPermissions = selectedPermissions.filter((id) => !modulePermissionIds.includes(id));
      onChange(newPermissions);
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <FormField
                  control={control}
                  name="permissionIds"
                  render={({ field }) => (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isFullySelected}
                        onCheckedChange={(checked) =>
                          toggleAllPermissions(checked as boolean, field.onChange)
                        }
                        className={
                          isPartiallySelected && !isFullySelected
                            ? 'data-[state=unchecked]:bg-primary/20'
                            : ''
                        }
                      />
                      <span className="font-medium">{label}</span>
                      <Badge variant="outline" className="text-xs">
                        {permissions.length}
                      </Badge>
                    </div>
                  )}
                />
              </div>
              <Badge variant="secondary" className="text-xs">
                {selectedCount} / {permissions.length}
              </Badge>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
              {permissions.map((permission) => (
                <FormField
                  key={permission.id}
                  control={control}
                  name="permissionIds"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, permission.id]);
                            } else {
                              field.onChange(
                                field.value?.filter((value) => value !== permission.id)
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          {permission.name}
                        </FormLabel>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
