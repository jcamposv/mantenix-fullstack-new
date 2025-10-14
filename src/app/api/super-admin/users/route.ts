import { NextResponse } from "next/server"
import { AuthService, UserService } from "@/server"

export const GET = async () => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()
    
    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    // Only super admins can access this endpoint
    if (sessionResult.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ 
        error: "Forbidden - Only super admins can view all users" 
      }, { status: 403 })
    }

    const users = await UserService.getAllUsers()
    return NextResponse.json(users)

  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}