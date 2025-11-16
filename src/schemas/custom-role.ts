/**
 * Custom Role Schema
 * Zod validation schema for custom role forms
 */

import { z } from 'zod';

export const interfaceTypeEnum = z.enum(['MOBILE', 'DASHBOARD', 'BOTH'], {
  message: 'Tipo de interfaz inválido'
});

export const customRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del rol es requerido')
    .max(50, 'El nombre del rol es muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  description: z.string().max(200, 'La descripción es muy larga').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (debe ser hexadecimal)')
    .default('#3b82f6'),
  interfaceType: interfaceTypeEnum.default('MOBILE'),
  permissionIds: z
    .array(z.string())
    .min(1, 'Debe seleccionar al menos un permiso')
    .max(100, 'Demasiados permisos seleccionados')
});

export type CustomRoleFormData = z.infer<typeof customRoleSchema>;
export type InterfaceType = z.infer<typeof interfaceTypeEnum>;
