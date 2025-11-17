import { NextRequest, NextResponse } from "next/server"
import { CompanyService } from "@/server/services/company.service"
import { companyFiltersSchema, createCompanySchema } from "@/app/api/schemas/company-schemas"
import { AuthService } from "@/server/services/auth.service"
import type { AuthenticatedSession } from "@/types/auth.types"

export const dynamic = 'force-dynamic'

export const GET = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    const { searchParams } = new URL(request.url)
    const filters = companyFiltersSchema.parse({
      tier: searchParams.get('tier') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined
    })

    const result = await CompanyService.getList(session, filters, filters.page, filters.limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching companies:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const sessionResult = await AuthService.getAuthenticatedSession()

    if (sessionResult instanceof NextResponse) {
      return sessionResult
    }

    const session = sessionResult

    const body = await request.json()
    const data = createCompanySchema.parse(body)

    const company = await CompanyService.create(session, data)
    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error("Error creating company:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}