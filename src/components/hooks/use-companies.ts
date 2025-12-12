import { useState, useEffect } from "react"
import { Company } from "@/components/forms/user/user-form-schema"

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  return { companies, loading, refetch: fetchCompanies }
}