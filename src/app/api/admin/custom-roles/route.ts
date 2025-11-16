/**
 * Custom Roles API Routes
 * GET /api/admin/custom-roles - List custom roles
 * POST /api/admin/custom-roles - Create custom role
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server';
import { CustomRoleService } from '@/server/services/custom-role.service';
import { PermissionHelper } from '@/server/helpers/permission.helper';
import { createCustomRoleSchema } from '../../schemas/custom-role-schemas';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/custom-roles
 * List all custom roles for the user's company
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
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

    // User must have a company
    if (!sessionResult.user.companyId) {
      return NextResponse.json(
        { error: 'Usuario sin empresa asignada' },
        { status: 400 }
      );
    }

    const customRoleService = new CustomRoleService();
    const roles = await customRoleService.getRolesByCompany(sessionResult.user.companyId);

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching custom roles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/custom-roles
 * Create a new custom role
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate
    const sessionResult = await AuthService.getAuthenticatedSession();
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }

    // Only ADMIN_EMPRESA and ADMIN_GRUPO can create custom roles
    // ADMIN_GRUPO can create roles for companies in their group
    // ADMIN_EMPRESA can create roles for their company
    if (
      sessionResult.user.role !== PermissionHelper.ROLES.ADMIN_EMPRESA &&
      sessionResult.user.role !== PermissionHelper.ROLES.ADMIN_GRUPO
    ) {
      return NextResponse.json(
        { error: 'Solo administradores de empresa o grupo pueden crear roles personalizados' },
        { status: 403 }
      );
    }

    // User must have a company
    if (!sessionResult.user.companyId) {
      return NextResponse.json(
        { error: 'Usuario sin empresa asignada' },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = createCustomRoleSchema.parse(body);

    // Create role
    const customRoleService = new CustomRoleService();
    const role = await customRoleService.createRole({
      ...validatedData,
      description: validatedData.description ?? undefined,
      companyId: sessionResult.user.companyId,
      createdBy: sessionResult.user.id
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific errors
      if (error.message.includes('Ya existe un rol con el nombre')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes('no existen')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    console.error('Error creating custom role:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
