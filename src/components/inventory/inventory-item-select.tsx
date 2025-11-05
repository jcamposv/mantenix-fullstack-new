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
import { useInventoryItems } from "@/components/hooks/use-inventory-items"

interface InventoryItemSelectProps {
  value?: string
  onValueChange: (value: string) => void
  companyId?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function InventoryItemSelect({
  value,
  onValueChange,
  companyId,
  placeholder = "Selecciona un ítem...",
  className,
  disabled
}: InventoryItemSelectProps) {
  const [open, setOpen] = React.useState(false)
  const { items, loading } = useInventoryItems(companyId)

  const selectedItem = items.find((item) => item.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || loading}
        >
          {selectedItem ? (
            <div className="flex items-center gap-2 truncate">
              <Package className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {selectedItem.code} - {selectedItem.name}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{loading ? "Cargando..." : placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar ítem..." />
          <CommandList>
            <CommandEmpty>No se encontraron ítems.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.code} ${item.name}`}
                  onSelect={() => {
                    onValueChange(item.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.code}</span>
                      <span className="text-muted-foreground">-</span>
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {item.category && <span>Categoría: {item.category}</span>}
                      <span>Unidad: {item.unit}</span>
                      {typeof item.totalAvailable === 'number' && (
                        <span className={cn(
                          "font-semibold",
                          item.totalAvailable > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          Disponible: {item.totalAvailable}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
