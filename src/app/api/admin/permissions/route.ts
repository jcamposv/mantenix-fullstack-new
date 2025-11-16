/**
 * GET /api/admin/permissions
 * List all permissions grouped by module
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server';
import { PermissionService } from '@/server/services/permission.service';
import { PermissionHelper } from '@/server/helpers/permission.helper';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate
    const sessionResult = await AuthService.getAuthenticatedSession();
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }

    // Only ADMIN_EMPRESA and above can view permissions
    const allowedRoles = [
      PermissionHelper.ROLES.SUPER_ADMIN,
      PermissionHelper.ROLES.ADMIN_GRUPO,
      PermissionHelper.ROLES.ADMIN_EMPRESA
    ] as const;

    if (!allowedRoles.includes(sessionResult.user.role as typeof allowedRoles[number])) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver permisos del sistema' },
        { status: 403 }
      );
    }

    const permissionService = new PermissionService();

    // Check if client wants grouped permissions
    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get('grouped') === 'true';

    if (grouped) {
      const permissionsByModule = await permissionService.getPermissionsByModule();
      return NextResponse.json(permissionsByModule);
    } else {
      const permissions = await permissionService.getAllPermissions();
      return NextResponse.json(permissions);
    }
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
