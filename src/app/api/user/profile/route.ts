import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get userId from query params or use session user id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    // Security check: users can only access their own profile unless they're admin
    if (userId !== session.user.id) {
      // TODO: Add admin role check here when implementing permissions
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Fetch user with company, site, and client company information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            primaryColor: true,
            secondaryColor: true,
            backgroundColor: true,
            logo: true,
            tier: true,
          }
        },
        site: {
          select: {
            id: true,
            name: true,
            clientCompany: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        clientCompany: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}