import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatItem {
  label: string
  value: number
  color?: string
}

interface DetailedStatsCardProps {
  title: string
  description?: string
  icon: LucideIcon
  items: StatItem[]
  className?: string
}

export function DetailedStatsCard({
  title,
  description,
  icon: Icon,
  items,
  className
}: DetailedStatsCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  "font-semibold",
                  item.color && item.color
                )}
              >
                {item.value}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
