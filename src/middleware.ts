import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Get user with company info and role (all roles are now in CustomRole)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: {
          select: {
            key: true,
            interfaceType: true
          }
        },
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

    if (!user || !user.role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based route protection
    const pathname = request.nextUrl.pathname

    // Super admins can access any subdomain and any route
    if (user.role.key === 'SUPER_ADMIN') {
      // Redirect to super-admin dashboard if accessing root
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/super-admin/dashboard', request.url))
      }
      return NextResponse.next()
    }

    // Group admins can access any subdomain within their corporate group
    if (user.role.key === 'ADMIN_GRUPO' && user.company?.companyGroup) {
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

    // Enforce interface restrictions based on role's interfaceType
    const interfaceType = user.role.interfaceType

    if (interfaceType === 'MOBILE' && !pathname.startsWith('/mobile')) {
      // Mobile-only users must use /mobile
      return NextResponse.redirect(new URL("/mobile", request.url))
    } else if (interfaceType === 'DASHBOARD' && pathname.startsWith('/mobile')) {
      // Dashboard-only users cannot access /mobile
      return NextResponse.redirect(new URL("/", request.url))
    }

    // BOTH: User can access any interface
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