"use client"

import { MediaDisplay } from "./media-display"
import { normalizeMediaValue } from "@/types/media.types"
import type { CustomField, TableRow } from "@/schemas/work-order-template"

interface CustomFieldValueProps {
  field: CustomField
  value: unknown
}

export function CustomFieldValue({ field, value }: CustomFieldValueProps) {
  if (!value) return <span className="text-sm text-muted-foreground">N/A</span>

  switch (field.type) {
    case "IMAGE_BEFORE":
    case "IMAGE_AFTER":
    case "VIDEO_BEFORE":
    case "VIDEO_AFTER":
      const mediaItems = normalizeMediaValue(value)
      return (
        <div className="flex flex-wrap gap-2">
          {mediaItems.map((item, index) => (
            <MediaDisplay
              key={index}
              url={item.url}
              isVideo={field.type.includes("VIDEO")}
              fieldLabel={`${field.label} ${mediaItems.length > 1 ? `(${index + 1})` : ''}`}
              note={item.note}
            />
          ))}
        </div>
      )
    
    case "CHECKLIST":
      const checkedItems = Array.isArray(value) ? value : []
      return (
        <div className="space-y-1">
          {field.options?.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                checkedItems.includes(option) ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={`text-sm ${
                checkedItems.includes(option) ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {option}
              </span>
            </div>
          ))}
        </div>
      )
    
    case "CHECKBOX":
      return (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            value ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <span className="text-sm">
            {value ? (field.options?.[0] || 'Sí') : 'No'}
          </span>
        </div>
      )
    
    case "SELECT":
    case "RADIO":
      return <span className="text-sm">{value.toString()}</span>
    
    case "DATE":
      const date = new Date(value as string)
      return <span className="text-sm">{date.toLocaleDateString()}</span>
    
    case "DATETIME":
      const datetime = new Date(value as string)
      return <span className="text-sm">{datetime.toLocaleString()}</span>
    
    case "TIME":
      return <span className="text-sm">{value.toString()}</span>

    case "TABLE":
      if (!field.tableConfig || !Array.isArray(value)) {
        return <span className="text-sm text-muted-foreground">N/A</span>
      }

      const tableRows = value as TableRow[]
      const columns = field.tableConfig.columns

      return (
        <div className="w-full">
          {/* Table View - Shows on desktop but not when printing */}
          <div className="hidden md:block print:hidden border rounded-lg overflow-x-auto">
            <table className="w-full min-w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {columns.map((col) => (
                    <th key={col.id} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-4 text-center text-muted-foreground">
                      Sin datos
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t hover:bg-muted/50">
                      {columns.map((col) => (
                        <td key={col.id} className="px-3 py-2">
                          {col.type === "checkbox" ? (
                            <div className="flex items-center justify-center">
                              <div className={`w-3 h-3 rounded-full ${
                                row[col.id] ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                            </div>
                          ) : (
                            <span className="block break-words">{row[col.id]?.toString() || '-'}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Print-optimized Table */}
          <table className="hidden print:table print:w-full print:border-collapse print:text-xs">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.id} className="print:border print:border-gray-200 print:px-2 print:py-1 print:text-left print:bg-gray-100 print:font-semibold">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="print:border print:border-gray-200 print:px-2 print:py-1 print:text-center">Sin datos</td>
                </tr>
              ) : (
                tableRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col) => (
                      <td key={col.id} className="print:border print:border-gray-200 print:px-2 print:py-1 print:text-left">
                        {col.type === "checkbox" ? (
                          row[col.id] ? '✓' : '✗'
                        ) : (
                          row[col.id]?.toString() || '-'
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden print:hidden space-y-3">
            {tableRows.length === 0 ? (
              <div className="border rounded-lg p-6 text-center text-sm text-muted-foreground">
                Sin datos
              </div>
            ) : (
              tableRows.map((row, rowIndex) => (
                <div key={rowIndex} className="border rounded-lg p-4 space-y-3 bg-card">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Fila {rowIndex + 1}
                  </div>
                  <div className="space-y-2">
                    {columns.map((col) => (
                      <div key={col.id} className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {col.label}:
                        </span>
                        {col.type === "checkbox" ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              row[col.id] ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className="text-sm">{row[col.id] ? 'Sí' : 'No'}</span>
                          </div>
                        ) : (
                          <span className="text-sm break-words">{row[col.id]?.toString() || '-'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )

    default:
      return <span className="text-sm">{value.toString()}</span>
  }
}