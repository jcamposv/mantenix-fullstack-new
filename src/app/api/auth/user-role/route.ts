import { NextResponse } from "next/server"
import { getCurrentUserWithRole } from "@/lib/auth-utils"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUserWithRole()
    
    if (!user) {
      return NextResponse.json({ role: null, isAuthenticated: false })
    }

    return NextResponse.json({
      role: user.role,
      isAuthenticated: true,
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      isGroupAdmin: user.role === 'ADMIN_GRUPO',
      isCompanyAdmin: user.role === 'ADMIN_EMPRESA',
      companyId: user.companyId,
      company: user.company
    })
  } catch (error) {
    console.error('Error getting user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}