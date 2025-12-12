import { DateRange } from "react-day-picker"
import { DatePeriod } from "@/components/dashboard/shared/dashboard-filters"

export function getDateRangeFromPeriod(period: DatePeriod): DateRange | undefined {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  switch (period) {
    case "today":
      return {
        from: today,
        to: endOfToday
      }

    case "this_week": {
      const startOfWeek = new Date(today)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      return {
        from: startOfWeek,
        to: endOfWeek
      }
    }

    case "this_month": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      startOfMonth.setHours(0, 0, 0, 0)

      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      endOfMonth.setHours(23, 59, 59, 999)

      return {
        from: startOfMonth,
        to: endOfMonth
      }
    }

    case "last_month": {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      startOfLastMonth.setHours(0, 0, 0, 0)

      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      endOfLastMonth.setHours(23, 59, 59, 999)

      return {
        from: startOfLastMonth,
        to: endOfLastMonth
      }
    }

    case "last_3_months": {
      const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      endDate.setHours(23, 59, 59, 999)

      return {
        from: startDate,
        to: endDate
      }
    }

    case "this_year": {
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      startOfYear.setHours(0, 0, 0, 0)

      const endOfYear = new Date(today.getFullYear(), 11, 31)
      endOfYear.setHours(23, 59, 59, 999)

      return {
        from: startOfYear,
        to: endOfYear
      }
    }

    case "last_year": {
      const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1)
      startOfLastYear.setHours(0, 0, 0, 0)

      const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31)
      endOfLastYear.setHours(23, 59, 59, 999)

      return {
        from: startOfLastYear,
        to: endOfLastYear
      }
    }

    case "custom":
      return undefined

    default:
      return undefined
  }
}

export function formatDateRange(range: DateRange | undefined): string {
  if (!range?.from) return ""

  if (!range.to) {
    return range.from.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return `${range.from.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })} - ${range.to.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })}`
}
