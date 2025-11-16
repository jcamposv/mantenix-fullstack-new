/**
 * Custom Role Detail API Routes
 * GET /api/admin/custom-roles/[id] - Get role details
 * PUT /api/admin/custom-roles/[id] - Update role
 * DELETE /api/admin/custom-roles/[id] - Delete role
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server';
import { CustomRoleService } from '@/server/services/custom-role.service';
import { PermissionHelper } from '@/server/helpers/permission.helper';
import { updateCustomRoleSchema } from '../../../schemas/custom-role-schemas';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/custom-roles/[id]
 * Get custom role details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Authenticate
    const sessionResult = await AuthService.getAuthenticatedSession();
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }

    // Only ADMIN_EMPRESA and above can view custom roles
    const allowedRoles = [
      PermissionHelper.ROLES.SUPER_ADMIN,
      PermissionHelper.ROLES.ADMIN_GRUPO,
      PermissionHelper.ROLES.ADMIN_EMPRESA
    ] as const;

    if (!allowedRoles.includes(sessionResult.user.role as typeof allowedRoles[number])) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver roles personalizados' },
        { status: 403 }
      );
    }

    if (!sessionResult.user.companyId) {
      return NextResponse.json(
        { error: 'Usuario sin empresa asignada' },
        { status: 400 }
      );
    }

    const customRoleService = new CustomRoleService();
    const role = await customRoleService.getRoleById(id);

    if (!role) {
      return NextResponse.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    // Validate access (role must belong to user's company)
    const hasAccess = await customRoleService.validateRoleAccess(
      id,
      sessionResult.user.companyId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes acceso a este rol' },
        { status: 403 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error fetching custom role:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/custom-roles/[id]
 * Update custom role
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Authenticate
    const sessionResult = await AuthService.getAuthenticatedSession();
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }

    // Only ADMIN_EMPRESA and ADMIN_GRUPO can update custom roles
    if (
      sessionResult.user.role !== PermissionHelper.ROLES.ADMIN_EMPRESA &&
      sessionResult.user.role !== PermissionHelper.ROLES.ADMIN_GRUPO
    ) {
      return NextResponse.json(
        { error: 'Solo administradores de empresa o grupo pueden modificar roles personalizados' },
        { status: 403 }
      );
    }

    if (!sessionResult.user.companyId) {
      return NextResponse.json(
        { error: 'Usuario sin empresa asignada' },
        { status: 400 }
      );
    }

    // Validate access
    const customRoleService = new CustomRoleService();
    const hasAccess = await customRoleService.validateRoleAccess(
      id,
      sessionResult.user.companyId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes acceso a este rol' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = updateCustomRoleSchema.parse(body);

    // Update role - convert null to undefined for description
    const role = await customRoleService.updateRole(id, {
      ...validatedData,
      description: validatedData.description ?? undefined
    });

    return NextResponse.json(role);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Ya existe un rol con el nombre')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes('no existen')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message === 'Rol no encontrado') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    console.error('Error updating custom role:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/custom-roles/[id]
 * Delete custom role (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Authenticate
    const sessionResult = await AuthService.getAuthenticatedSession();
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }

    // Only ADMIN_EMPRESA and ADMIN_GRUPO can delete custom roles
    if (
      sessionResult.user.role !== PermissionHelper.ROLES.ADMIN_EMPRESA &&
      sessionResult.user.role !== PermissionHelper.ROLES.ADMIN_GRUPO
    ) {
      return NextResponse.json(
        { error: 'Solo administradores de empresa o grupo pueden eliminar roles personalizados' },
        { status: 403 }
      );
    }

    if (!sessionResult.user.companyId) {
      return NextResponse.json(
        { error: 'Usuario sin empresa asignada' },
        { status: 400 }
      );
    }

    // Validate access
    const customRoleService = new CustomRoleService();
    const hasAccess = await customRoleService.validateRoleAccess(
      id,
      sessionResult.user.companyId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes acceso a este rol' },
        { status: 403 }
      );
    }

    // Delete role
    await customRoleService.deleteRole(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Rol no encontrado') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('tiene') && error.message.includes('usuario')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }

    console.error('Error deleting custom role:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
