/**
 * Role Basic Info Fields
 * Name, description, and color picker for custom role
 */

import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CustomRoleFormData } from '@/schemas/custom-role';
import { Smartphone, Monitor, MonitorSmartphone } from 'lucide-react';

interface RoleBasicInfoProps {
  control: Control<CustomRoleFormData>;
}

// Predefined colors
const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16' // Lime
];

export function RoleBasicInfo({ control }: RoleBasicInfoProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Rol *</FormLabel>
            <FormControl>
              <Input placeholder="ej: Mecánico, Fontanero, Electricista" {...field} />
            </FormControl>
            <FormDescription>Nombre descriptivo del rol (solo letras y espacios)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descripción breve del rol y sus responsabilidades"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Color del Rol</FormLabel>
            <div className="flex items-center gap-4">
              <FormControl>
                <Input type="color" className="w-20 h-10" {...field} />
              </FormControl>
              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded-md border-2 border-transparent hover:border-primary transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => field.onChange(color)}
                  />
                ))}
              </div>
            </div>
            <FormDescription>Color para identificar el rol visualmente</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="interfaceType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Acceso *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de interfaz" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="MOBILE">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Solo App Móvil</div>
                      <div className="text-xs text-muted-foreground">
                        Trabajo de campo (técnicos, operarios)
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="DASHBOARD">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Solo Dashboard Web</div>
                      <div className="text-xs text-muted-foreground">
                        Trabajo de oficina (analistas, coordinadores)
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="BOTH">
                  <div className="flex items-center gap-2">
                    <MonitorSmartphone className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Ambas Interfaces</div>
                      <div className="text-xs text-muted-foreground">
                        Híbrido (supervisores, jefes de mantenimiento)
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Define dónde puede acceder el usuario: app móvil, dashboard web, o ambos
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
