/**
 * POST /api/auth/validate-subdomain
 * Validates if a user can access the current subdomain
 * Called after successful better-auth signIn
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { validateSubdomainAccess } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';


export async function POST(): Promise<NextResponse> {
  try {
    // Get current subdomain from headers
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const subdomain = host.split('.')[0];

    // Skip validation for localhost or main domain
    if (!subdomain || subdomain === 'localhost' || subdomain === host) {
      return NextResponse.json({
        success: true,
        canAccess: true,
        message: 'No subdomain validation required'
      });
    }

    // Get current session to verify user is authenticated
    const session = await auth.api.getSession({
      headers: headersList
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Validate subdomain access
    const validation = await validateSubdomainAccess(session.user.id, subdomain);

    if (!validation.canAccess) {
      // Sign out the user since they don't have access
      await auth.api.signOut({
        headers: headersList
      });

      return NextResponse.json(
        {
          success: false,
          canAccess: false,
          error: validation.error || 'No tienes acceso a este subdominio'
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      canAccess: true,
      subdomain
    });
  } catch (error) {
    console.error('Error validating subdomain:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al validar subdominio'
      },
      { status: 500 }
    );
  }
}
