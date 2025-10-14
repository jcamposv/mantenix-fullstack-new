import { NextRequest, NextResponse } from "next/server"
import { CompanyService } from "@/server/services/company.service"
import { brandingQuerySchema } from "@/app/api/schemas/company-schemas"

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const { subdomain } = brandingQuerySchema.parse({
      subdomain: searchParams.get('subdomain')
    })

    const company = await CompanyService.getBrandingBySubdomain(subdomain)

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(company)

  } catch (error) {
    console.error("Error fetching company branding:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}