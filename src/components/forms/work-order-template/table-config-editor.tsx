"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Table as TableIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { TableConfig, TableColumn, TableRow } from "@/schemas/work-order-template"

interface TableConfigEditorProps {
  config: TableConfig | undefined
  onChange: (config: TableConfig) => void
}

export function TableConfigEditor({ config, onChange }: TableConfigEditorProps) {
  const [newColumnLabel, setNewColumnLabel] = useState("")

  const columns = config?.columns || []
  const rows = config?.rows || []

  const addColumn = () => {
    if (!newColumnLabel.trim()) return

    const newColumn: TableColumn = {
      id: `col_${Date.now()}`,
      label: newColumnLabel.trim(),
      type: "text",
      readonly: false,
      required: false
    }

    onChange({
      ...config,
      columns: [...columns, newColumn]
    } as TableConfig)

    setNewColumnLabel("")
  }

  const updateColumn = (index: number, updates: Partial<TableColumn>) => {
    const updatedColumns = [...columns]
    updatedColumns[index] = { ...updatedColumns[index], ...updates }

    onChange({
      ...config,
      columns: updatedColumns
    } as TableConfig)
  }

  const removeColumn = (index: number) => {
    const updatedColumns = columns.filter((_, i) => i !== index)

    onChange({
      ...config,
      columns: updatedColumns
    } as TableConfig)
  }

  const addRow = () => {
    const newRow: TableRow = {}
    columns.forEach(col => {
      newRow[col.id] = col.readonly ? col.label : ""
    })

    onChange({
      ...config,
      rows: [...rows, newRow]
    } as TableConfig)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateRow = (rowIndex: number, columnId: string, value: any) => {
    const updatedRows = [...rows]
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [columnId]: value
    }

    onChange({
      ...config,
      rows: updatedRows
    } as TableConfig)
  }

  const removeRow = (index: number) => {
    const updatedRows = rows.filter((_, i) => i !== index)

    onChange({
      ...config,
      rows: updatedRows
    } as TableConfig)
  }

  return (
    <div className="space-y-6">
      {/* Columnas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TableIcon className="h-4 w-4" />
          <Label className="text-base">Columnas de la Tabla</Label>
        </div>

        {/* Agregar columna */}
        <div className="flex gap-2">
          <Input
            placeholder="Nombre de la columna"
            value={newColumnLabel}
            onChange={(e) => setNewColumnLabel(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColumn())}
          />
          <Button type="button" onClick={addColumn} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        {/* Lista de columnas */}
        {columns.length > 0 && (
          <div className="space-y-2">
            {columns.map((column, index) => (
              <div key={column.id} className="flex gap-2 items-center p-2 border rounded-md">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Etiqueta"
                    value={column.label}
                    onChange={(e) => updateColumn(index, { label: e.target.value })}
                  />
                  <Select
                    value={column.type}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onValueChange={(value) => updateColumn(index, { type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={column.readonly}
                    onCheckedChange={(checked) => updateColumn(index, { readonly: !!checked })}
                  />
                  <span className="text-xs">Solo lectura</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeColumn(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Filas predefinidas */}
      {columns.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base">Filas Predefinidas (Opcional)</Label>
            <Button type="button" onClick={addRow} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Agregar Fila
            </Button>
          </div>

          {rows.length > 0 && (
            <div className="space-y-2">
              {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2 items-center p-2 border rounded-md">
                  <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
                    {columns.map((col) => (
                      <Input
                        key={col.id}
                        placeholder={col.label}
                        value={row[col.id] || ""}
                        onChange={(e) => updateRow(rowIndex, col.id, e.target.value)}
                        disabled={col.readonly}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(rowIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
