import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { CompanyService } from "@/server/services/company.service"
import { updateCompanySchema } from "@/app/api/schemas/company-schemas"
import type { AuthenticatedSession } from "@/types/auth.types"

export const dynamic = 'force-dynamic'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    }) as AuthenticatedSession

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const company = await CompanyService.getById(session, id)

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error fetching company:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    }) as AuthenticatedSession

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateCompanySchema.parse(body)

    const company = await CompanyService.update(session, id, data)
    return NextResponse.json(company)
  } catch (error) {
    console.error("Error updating company:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    }) as AuthenticatedSession

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const company = await CompanyService.delete(session, id)
    return NextResponse.json(company)
  } catch (error) {
    console.error("Error deleting company:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
