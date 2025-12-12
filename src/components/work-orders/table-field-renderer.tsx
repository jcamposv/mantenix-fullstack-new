"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import type { TableConfig, TableRow } from "@/schemas/work-order-template"

interface TableFieldRendererProps {
  config: TableConfig
  value?: TableRow[]
  onChange: (value: TableRow[]) => void
  disabled?: boolean
}

export function TableFieldRenderer({
  config,
  value = [],
  onChange,
  disabled = false
}: TableFieldRendererProps) {
  const [rows, setRows] = useState<TableRow[]>(() => {
    // Initialize state only once
    if (value && value.length > 0) {
      return value
    } else if (config.rows && config.rows.length > 0) {
      return config.rows
    } else if (config.allowAddRows) {
      return [createEmptyRow(config)]
    }
    return []
  })

  // Track if this is the initial mount to avoid calling onChange on first render
  const isInitialMount = useRef(true)
  const previousRowsRef = useRef<string>("")

  // Notify parent of internal changes (skip initial render and duplicates)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      previousRowsRef.current = JSON.stringify(rows)
      return
    }

    const rowsString = JSON.stringify(rows)
    if (previousRowsRef.current !== rowsString) {
      previousRowsRef.current = rowsString
      onChange(rows)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  const createEmptyRow = (config: TableConfig): TableRow => {
    const newRow: TableRow = {}
    config.columns.forEach(col => {
      newRow[col.id] = col.type === "checkbox" ? false : ""
    })
    return newRow
  }

  const addRow = () => {
    if (config.maxRows && rows.length >= config.maxRows) {
      return
    }
    setRows([...rows, createEmptyRow(config)])
  }

  const removeRow = (index: number) => {
    if (config.minRows && rows.length <= config.minRows) {
      return
    }
    setRows(rows.filter((_, i) => i !== index))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateCell = (rowIndex: number, columnId: string, value: any) => {
    const updatedRows = [...rows]
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [columnId]: value
    }
    setRows(updatedRows)
  }

  const canDeleteRow = (index: number) => {
    if (disabled) return false
    if (!config.allowDeleteRows) return false
    if (config.minRows && rows.length <= config.minRows) return false
    // Don't allow deleting predefined readonly rows
    const row = rows[index]
    const hasReadonlyData = config.columns.some(col => col.readonly && row[col.id])
    return !hasReadonlyData
  }

  const renderField = (row: TableRow, col: typeof config.columns[0], rowIndex: number) => {
    if (col.type === "checkbox") {
      return (
        <Checkbox
          checked={!!row[col.id]}
          onCheckedChange={(checked) => updateCell(rowIndex, col.id, !!checked)}
          disabled={disabled || col.readonly}
        />
      )
    }

    return (
      <Input
        type={col.type === "number" ? "number" : "text"}
        value={row[col.id]?.toString() || ""}
        onChange={(e) => {
          const value = col.type === "number"
            ? (e.target.value ? parseFloat(e.target.value) : "")
            : e.target.value
          updateCell(rowIndex, col.id, value)
        }}
        disabled={disabled || col.readonly}
        className="h-9"
      />
    )
  }

  return (
    <div className="space-y-3">
      {/* Desktop Table View - Hidden on Mobile */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {config.columns.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-2 text-left text-sm font-medium"
                  style={{ width: col.width }}
                >
                  {col.label}
                  {col.required && <span className="text-red-500 ml-1">*</span>}
                </th>
              ))}
              {config.allowDeleteRows && !disabled && (
                <th className="px-4 py-2 w-16"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={config.columns.length + (config.allowDeleteRows ? 1 : 0)}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No hay datos en la tabla
                </td>
              </tr>
            )}
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {config.columns.map((col) => (
                  <td key={col.id} className="px-4 py-2">
                    {renderField(row, col, rowIndex)}
                  </td>
                ))}
                {config.allowDeleteRows && !disabled && (
                  <td className="px-4 py-2">
                    {canDeleteRow(rowIndex) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(rowIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Hidden on Desktop */}
      <div className="md:hidden space-y-3">
        {rows.length === 0 && (
          <div className="border rounded-lg p-6 text-center text-sm text-muted-foreground">
            No hay datos en la tabla
          </div>
        )}
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="border rounded-lg p-4 space-y-3 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Fila {rowIndex + 1}
              </span>
              {config.allowDeleteRows && !disabled && canDeleteRow(rowIndex) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(rowIndex)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>

            {/* Fields in 2-column grid */}
            <div className="grid grid-cols-1 gap-3">
              {config.columns.map((col) => (
                <div key={col.id} className="space-y-1">
                  <label className="text-xs font-medium">
                    {col.label}
                    {col.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(row, col, rowIndex)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Row Button */}
      {config.allowAddRows && !disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={config.maxRows ? rows.length >= config.maxRows : false}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Fila
          {config.maxRows && ` (${rows.length}/${config.maxRows})`}
        </Button>
      )}
    </div>
  )
}
