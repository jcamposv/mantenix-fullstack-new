import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PermissionHelper } from "@/server/helpers/permission.helper";  

export async function middleware(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Extract subdomain from request
    const host = request.headers.get('host') || ''
    const subdomain = host.split('.')[0]
    
    // Skip validation for main domain (localhost or main domain)
    if (!subdomain || subdomain === 'localhost' || subdomain === host) {
      return NextResponse.next()
    }

    // Get user with company info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        company: {
          include: {
            companyGroup: {
              include: {
                companies: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based route protection
    const pathname = request.nextUrl.pathname
    const mobileOnlyRoles = [PermissionHelper.ROLES.TECNICO, PermissionHelper.ROLES.SUPERVISOR, PermissionHelper.ROLES.CLIENTE_OPERARIO] as const

    // Super admins can access any subdomain and any route
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.next()
    }

    // Group admins can access any subdomain within their corporate group
    if (user.role === 'ADMIN_GRUPO' && user.company?.companyGroup) {
      const groupSubdomains = user.company.companyGroup.companies.map(c => c.subdomain)
      if (groupSubdomains.includes(subdomain)) {
        return NextResponse.next()
      }
    }

    // Regular users must access their company's subdomain
    if (user.company?.subdomain !== subdomain) {
      // Redirect to correct company subdomain
      const domainBase = process.env.NEXT_PUBLIC_DOMAIN_BASE || "mantenix.com"
      const correctUrl = process.env.NODE_ENV === 'production'
        ? `https://${user.company?.subdomain}.${domainBase}${request.nextUrl.pathname}`
        : `http://${user.company?.subdomain}.localhost:3000${request.nextUrl.pathname}`

      return NextResponse.redirect(new URL(correctUrl))
    }

    // Check if mobile-only user is trying to access dashboard routes
    if ((mobileOnlyRoles as readonly string[]).includes(user.role) && !pathname.startsWith('/mobile')) {
      return NextResponse.redirect(new URL("/mobile", request.url))
    }

    // Admin users can access both dashboard and mobile routes
    // No restriction needed for admin users accessing mobile

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/", 
    "/dashboard/:path*", 
    "/admin/:path*", 
    "/super-admin/:path*", 
    "/work-orders/:path*", 
    "/alerts/:path*", 
    "/users/:path*", 
    "/mobile/:path*",
    "/platform-selection"
  ],
}