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

    // Get user with company info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Super admins can access any subdomain
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.next()
    }

    // Regular users must access their company's subdomain
    if (user.company?.subdomain !== subdomain) {
      // Redirect to correct company subdomain
      const domainBase = process.env.NEXT_PUBLIC_DOMAIN_BASE || "mantenix.ai"
      const correctUrl = process.env.NODE_ENV === 'production' 
        ? `https://${user.company?.subdomain}.${domainBase}${request.nextUrl.pathname}`
        : `http://${user.company?.subdomain}.localhost:3000${request.nextUrl.pathname}`
      
      return NextResponse.redirect(new URL(correctUrl))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  runtime: "nodejs",
  matcher: ["/", "/dashboard/:path*"],
}