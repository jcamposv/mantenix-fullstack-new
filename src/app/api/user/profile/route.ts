import { NextRequest, NextResponse } from 'next/server'
import { AuthService, UserService } from '@/server'

export const dynamic = 'force-dynamic'

export const GET = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Get userId from query params or use session user id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || sessionResult.user.id

    // Security check: users can only access their own profile unless they're admin
    if (userId !== sessionResult.user.id) {
      // TODO: Add admin role check here when implementing permissions
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const user = await UserService.getProfile(userId)

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