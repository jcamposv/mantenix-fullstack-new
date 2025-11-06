"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface Company {
  name: string
  logo: string
  hasCustomBranding: boolean
  plan: string
}

interface AvailableCompany {
  id: string
  name: string
  subdomain: string
  logo?: string | null
  isActive: boolean
}

export function TeamSwitcher({
  company,
  availableCompanies,
  isSuperAdmin = false,
  isGroupAdmin = false,
}: {
  company: Company
  availableCompanies?: AvailableCompany[] | null
  isSuperAdmin?: boolean
  isGroupAdmin?: boolean
}) {
  const { isMobile } = useSidebar()

  if (!company) {
    return null
  }

  // Function to switch to a different company
  const switchToCompany = (companyData: AvailableCompany) => {
    if (companyData.subdomain) {
      // Get current hostname to detect environment
      const currentHost = window.location.hostname
      const domainBase = process.env.NEXT_PUBLIC_DOMAIN_BASE || "mantenix.com"

      let targetUrl: string

      if (process.env.NODE_ENV === 'production') {
        // Extract environment from current hostname (e.g., "dev", "staging")
        // Pattern: subdomain.env.domain.com or subdomain.domain.com
        const hostParts = currentHost.split('.')

        // Check if there's an environment subdomain
        // e.g., codela.dev.mantenix.com -> ["codela", "dev", "mantenix", "com"]
        // e.g., codela.mantenix.com -> ["codela", "mantenix", "com"]
        let environment = ''
        if (hostParts.length > 3) {
          // Has environment (e.g., codela.dev.mantenix.com)
          environment = `.${hostParts[1]}`
        }

        // Build target URL: subdomain.environment.domain.com (without /dashboard)
        targetUrl = `https://${companyData.subdomain}${environment}.${domainBase}`
      } else {
        // Development: use localhost
        targetUrl = `http://${companyData.subdomain}.localhost:3000`
      }

      // Navigate to the company (without /dashboard)
      window.location.href = targetUrl
    }
  }

  // If super admin or group admin with companies available, show dropdown
  if ((isSuperAdmin || isGroupAdmin) && availableCompanies && availableCompanies.length > 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent text-sidebar-primary-foreground">
                  {company.hasCustomBranding ? (
                    <Image 
                      src={company.logo} 
                      alt={`${company.name} logo`}
                      width={24}
                      height={24}
                      className="size-6 object-contain"
                    />
                  ) : (
                    <Image 
                      src="/images/mantenix-logo-black.svg" 
                      alt="Mantenix logo"
                      width={24}
                      height={24}
                      className="size-6 object-contain dark:invert"
                    />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{company.name}</span>
                  <span className="truncate text-xs">{company.plan}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Cambiar Compañía
              </DropdownMenuLabel>
              {availableCompanies.map((companyItem) => (
                <DropdownMenuItem
                  key={companyItem.id}
                  onClick={() => switchToCompany(companyItem)}
                  className="gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {companyItem.logo ? (
                      <Image 
                        src={companyItem.logo} 
                        alt={`${companyItem.name} logo`}
                        width={16}
                        height={16}
                        className="size-4 object-contain"
                      />
                    ) : (
                      <Image 
                        src="/images/mantenix-logo-black.svg" 
                        alt="Mantenix logo"
                        width={16}
                        height={16}
                        className="size-4 object-contain dark:invert"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{companyItem.name}</span>
                    <span className="text-xs text-muted-foreground">{companyItem.subdomain}</span>
                  </div>
                  {!companyItem.isActive && (
                    <span className="ml-auto text-xs text-orange-500">Inactiva</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Default view for regular users or super admin without companies
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent text-sidebar-primary-foreground">
            {company.hasCustomBranding ? (
              <Image 
                src={company.logo} 
                alt={`${company.name} logo`}
                width={24}
                height={24}
                className="size-6 object-contain"
              />
            ) : (
              <Image 
                src="/images/mantenix-logo-black.svg" 
                alt="Mantenix logo"
                width={24}
                height={24}
                className="size-6 object-contain dark:invert"
              />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{company.name}</span>
            <span className="truncate text-xs">{company.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
