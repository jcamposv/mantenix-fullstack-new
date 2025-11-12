"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSidebarData, type AppSidebarProps } from "@/components/sidebar"

interface ExtendedAppSidebarProps extends AppSidebarProps, React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ 
  companyBranding, 
  availableCompanies,
  serverUser,
  userPermissions,
  ...props 
}: ExtendedAppSidebarProps) {
  const {
    currentUser,
    navItems,
    adminItems,
    companyInfo,
    isSuperAdmin,
    isCompanyAdmin,
    loading,
  } = useSidebarData({ 
    companyBranding, 
    serverUser, 
    userPermissions 
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher 
          company={companyInfo}
          availableCompanies={isSuperAdmin ? availableCompanies : null}
          isSuperAdmin={isSuperAdmin}
        />
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={navItems} />
        {(isSuperAdmin || isCompanyAdmin) && <NavProjects projects={adminItems} />}
      </SidebarContent>
      
      <SidebarFooter>
        {loading ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            Cargando usuario...
          </div>
        ) : (
          <NavUser user={currentUser} />
        )}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
