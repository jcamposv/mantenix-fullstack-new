"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useInventorySearch } from "@/components/hooks/use-inventory-search"
import { Loader2 } from "lucide-react"

interface InventoryItemSearchMobileProps {
  value?: string
  onValueChange: (value: string) => void
  onItemSelect?: (item: { id: string; code: string; name: string; unit: string; company: { name: string } } | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function InventoryItemSearchMobile({
  value,
  onValueChange,
  onItemSelect,
  placeholder = "Buscar repuesto...",
  className,
  disabled
}: InventoryItemSearchMobileProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedItem, setSelectedItem] = React.useState<{
    id: string
    code: string
    name: string
    unit: string
    company: { name: string }
  } | null>(null)

  const { items, loading, search } = useInventorySearch()

  // Handle search input change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    search(query)
  }

  // Handle item selection
  const handleSelect = (currentValue: string) => {
    const item = items.find(i => i.id === currentValue)
    if (!item) return

    setSelectedItem(item)
    onValueChange(item.id)
    onItemSelect?.(item)
    setOpen(false)
    setSearchQuery("") // Clear search after selection
  }

  // Fetch selected item details if value changes externally
  React.useEffect(() => {
    if (value && !selectedItem) {
      const found = items.find(item => item.id === value)
      if (found) {
        setSelectedItem(found)
      }
    } else if (!value && selectedItem) {
      setSelectedItem(null)
      onItemSelect?.(null)
    }
  }, [value, items, selectedItem, onItemSelect])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedItem && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedItem ? (
            <span className="truncate">{selectedItem.code} - {selectedItem.name}</span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar por código o nombre..."
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : searchQuery.length < 2 ? (
              <CommandEmpty>Escribe al menos 2 caracteres...</CommandEmpty>
            ) : items.length === 0 ? (
              <CommandEmpty>No se encontraron repuestos.</CommandEmpty>
            ) : (
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.code}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-sm truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{item.company.name}</span>
                        <span>•</span>
                        <span>{item.unit}</span>
                        {typeof item.totalAvailable === 'number' && (
                          <>
                            <span>•</span>
                            <span className={cn(
                              "font-medium",
                              item.totalAvailable > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                            )}>
                              Disp: {item.totalAvailable}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
