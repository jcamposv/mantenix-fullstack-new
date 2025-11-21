"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  role?: string | {
    id: string
    key: string | null
    name: string
    color: string
  }
}

interface UserMultiSelectProps {
  users: User[]
  selectedUserIds: string[]
  onUserIdsChange: (userIds: string[]) => void
  placeholder?: string
  emptyText?: string
}

/**
 * UserMultiSelect
 * Reusable multi-select component for users
 * Uses shadcn Command + Popover pattern
 * Same UX as work order creation form
 * Max 200 lines per nextjs-expert standards
 */
export function UserMultiSelect({
  users,
  selectedUserIds,
  onUserIdsChange,
  placeholder = "Seleccionar usuarios...",
  emptyText = "No se encontraron usuarios.",
}: UserMultiSelectProps) {
  const [open, setOpen] = useState(false)

  const toggleUser = (userId: string) => {
    const updated = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId]

    onUserIdsChange(updated)
  }

  const removeUser = (userId: string) => {
    onUserIdsChange(selectedUserIds.filter((id) => id !== userId))
  }

  const selectedUsers = users.filter((user) => selectedUserIds.includes(user.id))

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUserIds.length === 0
              ? placeholder
              : `${selectedUserIds.length} usuario(s) seleccionado(s)`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar usuarios..." />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.name} ${user.email}`}
                    onSelect={() => toggleUser(user.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedUserIds.includes(user.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                    {user.role && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {typeof user.role === 'string'
                          ? user.role.replace("_", " ")
                          : user.role.name
                        }
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected users badges */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
              {user.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => removeUser(user.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
