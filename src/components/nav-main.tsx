"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAlerts } from "@/hooks/useAlerts"
import { useInventoryRequestsCount } from "@/hooks/useInventoryRequestsCount"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: boolean
    items?: {
      title: string
      url: string
      badge?: boolean
    }[]
  }[]
}) {
  const { unreadCount } = useAlerts()
  const { pendingApprovalsCount, pendingDeliveriesCount } = useInventoryRequestsCount()

  // Helper function to get badge count for a specific URL
  const getBadgeCount = (url: string): number | null => {
    if (url === '/admin/work-orders/approvals') {
      return pendingApprovalsCount
    }
    if (url === '/admin/inventory/requests') {
      return pendingDeliveriesCount
    }
    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // If item has subitems, render collapsible
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {item.badge && unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto mr-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const badgeCount = subItem.badge ? getBadgeCount(subItem.url) : null
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url} className="flex items-center justify-between w-full">
                                <span>{subItem.title}</span>
                                {badgeCount !== null && badgeCount > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                                  >
                                    {badgeCount > 99 ? '99+' : badgeCount}
                                  </Badge>
                                )}
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }
          
          // If item has no subitems, render direct link
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.badge && unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
