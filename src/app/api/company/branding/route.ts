import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain is required" },
        { status: 400 }
      )
    }

    // Find company by subdomain
    const company = await prisma.company.findUnique({
      where: { 
        subdomain: subdomain,
        isActive: true 
      },
      select: {
        name: true,
        logo: true,
        logoSmall: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        customFont: true
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(company)

  } catch (error) {
    console.error("Error fetching company branding:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}