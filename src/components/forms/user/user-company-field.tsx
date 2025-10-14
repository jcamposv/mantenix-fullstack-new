import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Control } from "react-hook-form"
import { UserFormData, Company } from "./user-form-schema"

interface UserCompanyFieldProps {
  control: Control<UserFormData>
  companies: Company[]
  loadingCompanies: boolean
  needsCompany: boolean
  readOnly?: boolean
}

export function UserCompanyField({ 
  control, 
  companies, 
  loadingCompanies, 
  needsCompany,
  readOnly = false 
}: UserCompanyFieldProps) {
  if (!needsCompany) {
    return null
  }

  return (
    <FormField<UserFormData>
      control={control}
      name="companyId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            disabled={loadingCompanies || readOnly}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingCompanies ? "Loading companies..." : "Select company"
                } />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex flex-col">
                    <span>{company.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {company.subdomain}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Assign user to a specific company. Required for non-Super Admin roles.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}