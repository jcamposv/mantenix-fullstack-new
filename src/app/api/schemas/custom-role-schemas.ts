/**
 * Custom Role Validation Schemas
 * Zod schemas for custom role API routes
 */

import { z } from 'zod';

const interfaceTypeEnum = z.enum(['MOBILE', 'DASHBOARD', 'BOTH']);

/**
 * Schema for creating a custom role
 */
export const createCustomRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del rol es requerido')
    .max(50, 'El nombre del rol es muy largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    ),
  description: z
    .string()
    .max(200, 'La descripción es muy larga')
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (debe ser hexadecimal)')
    .default('#3b82f6'),
  interfaceType: interfaceTypeEnum.default('MOBILE'),
  permissionIds: z
    .array(z.string().cuid('ID de permiso inválido'))
    .min(1, 'Debe seleccionar al menos un permiso')
    .max(100, 'Demasiados permisos seleccionados')
});

/**
 * Schema for updating a custom role
 */
export const updateCustomRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del rol es requerido')
    .max(50, 'El nombre del rol es muy largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    )
    .optional(),
  description: z
    .string()
    .max(200, 'La descripción es muy larga')
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (debe ser hexadecimal)')
    .optional(),
  interfaceType: interfaceTypeEnum.optional(),
  permissionIds: z
    .array(z.string().cuid('ID de permiso inválido'))
    .min(1, 'Debe seleccionar al menos un permiso')
    .max(100, 'Demasiados permisos seleccionados')
    .optional()
});

/**
 * Schema for duplicating a custom role
 */
export const duplicateCustomRoleSchema = z.object({
  newName: z
    .string()
    .min(1, 'El nuevo nombre es requerido')
    .max(50, 'El nombre es muy largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    )
});

/**
 * Type exports
 */
export type CreateCustomRoleInput = z.infer<typeof createCustomRoleSchema>;
export type UpdateCustomRoleInput = z.infer<typeof updateCustomRoleSchema>;
export type DuplicateCustomRoleInput = z.infer<typeof duplicateCustomRoleSchema>;
