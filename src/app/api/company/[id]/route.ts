import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { CompanyService } from "@/server/services/company.service"
import type { AuthenticatedSession } from "@/types/auth.types"

export const GET = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    }) as AuthenticatedSession

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await CompanyService.getBasicInfoById(session, params.id)

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}