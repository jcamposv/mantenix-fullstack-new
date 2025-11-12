import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2 } from "lucide-react"

interface Company {
  id: string
  name: string
  tier: string
}

interface CompanySelectorProps {
  companies: Company[]
  selectedCompanyId: string | null
  onCompanyChange: (companyId: string) => void
  title?: string
  className?: string
}

export function CompanySelector({
  companies,
  selectedCompanyId,
  onCompanyChange,
  title = "Seleccionar Empresa",
  className = ""
}: CompanySelectorProps) {
  if (companies.length === 0) return null

  return (
    <Card className={`shadow-none ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg mb-3">{title}</CardTitle>
        <Select
          value={selectedCompanyId || undefined}
          onValueChange={onCompanyChange}
        >
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Selecciona una empresa" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{company.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {company.tier}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
    </Card>
  )
}
