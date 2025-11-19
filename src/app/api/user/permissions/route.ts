/**
 * GET /api/user/permissions
 * Get current user's permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server';
import { getUserPermissions } from '@/server/helpers/permission-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const sessionResult = await AuthService.getAuthenticatedSession();
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }

    // Get user permissions (handles both base roles and custom roles)
    const permissions = await getUserPermissions(sessionResult);

    return NextResponse.json({
      permissions,
      role: sessionResult.user.role,
      customRoleId: null // Note: customRoleId not available in session, but permissions are already resolved
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { error: 'Error al obtener permisos del usuario' },
      { status: 500 }
    );
  }
}
