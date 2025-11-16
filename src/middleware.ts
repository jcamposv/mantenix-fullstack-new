import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMobileOnlyRoles } from "@/lib/rbac/role-definitions";  

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

    // Get user with company info and custom role
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
        },
        customRole: {
          select: {
            interfaceType: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based route protection
    const pathname = request.nextUrl.pathname
    const mobileOnlyRoles = getMobileOnlyRoles()

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

    // Check interface access based on custom role or base role
    const effectiveInterfaceType = user.customRole?.interfaceType ||
      (mobileOnlyRoles.includes(user.role) ? 'MOBILE' : 'BOTH')

    // Enforce interface restrictions
    if (effectiveInterfaceType === 'MOBILE' && !pathname.startsWith('/mobile')) {
      // Mobile-only users must use /mobile
      return NextResponse.redirect(new URL("/mobile", request.url))
    } else if (effectiveInterfaceType === 'DASHBOARD' && pathname.startsWith('/mobile')) {
      // Dashboard-only users cannot access /mobile
      return NextResponse.redirect(new URL("/", request.url))
    }

    // BOTH: User can access any interface
    // Admin users can access both dashboard and mobile routes
    // No restriction needed

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