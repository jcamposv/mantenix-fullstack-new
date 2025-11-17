"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  const pathname = usePathname()
  const { unreadCount } = useAlerts()
  const { pendingApprovalsCount, pendingDeliveriesCount } = useInventoryRequestsCount()

  // Helper function to check if a URL is active
  const isUrlActive = (url: string): boolean => {
    if (url === '/') {
      return pathname === '/'
    }
    return pathname === url || pathname.startsWith(url + '/')
  }

  // Helper function to check if any sub-item is active
  const hasActiveChild = (subItems?: { url: string }[]): boolean => {
    if (!subItems) return false
    return subItems.some(subItem => isUrlActive(subItem.url))
  }

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
          const itemActive = isUrlActive(item.url)
          const childActive = hasActiveChild(item.items)

          // If item has subitems, render collapsible
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={childActive} // Open if any child is active
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={childActive}>
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
                        const subItemActive = isUrlActive(subItem.url)

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={subItemActive}>
                              <Link href={subItem.url} className="flex items-center justify-between w-full">
                                <span>{subItem.title}</span>
                                {badgeCount !== null && badgeCount > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                                  >
                                    {badgeCount > 99 ? '99+' : badgeCount}
                                  </Badge>
                                )}
                              </Link>
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
              <SidebarMenuButton asChild tooltip={item.title} isActive={itemActive}>
                <Link href={item.url}>
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
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
