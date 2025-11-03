"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { BarChart3, TrendingUp } from "lucide-react"

interface StatusData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface StatusDistributionChartProps {
  data: StatusData[]
  loading?: boolean
}

const RADIAN = Math.PI / 180;

interface CustomPieLabelProps {
  cx?: string | number
  cy?: string | number
  midAngle?: number
  innerRadius?: string | number
  outerRadius?: string | number
  percent?: number
  [key: string]: unknown
}

const renderCustomizedLabel = ({
  cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0
}: CustomPieLabelProps) => {
  const cxNum = typeof cx === 'string' ? parseFloat(cx) : cx
  const cyNum = typeof cy === 'string' ? parseFloat(cy) : cy
  const innerRadiusNum = typeof innerRadius === 'string' ? parseFloat(innerRadius) : innerRadius
  const outerRadiusNum = typeof outerRadius === 'string' ? parseFloat(outerRadius) : outerRadius
  const radius = innerRadiusNum + (outerRadiusNum - innerRadiusNum) * 0.5;
  const x = cxNum + radius * Math.cos(-midAngle * RADIAN);
  const y = cyNum + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cxNum ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function StatusDistributionChart({ data, loading = false }: StatusDistributionChartProps) {
  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribución por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // Calculate total for display
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Filter out items with 0 value for cleaner chart
  const chartData = data.filter(item => item.value > 0)

  // Check if there's any data to display
  const hasData = chartData.length > 0 && total > 0

  return (
    <Card className="overflow-hidden shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribución por Estado
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Vista de órdenes por estado actual
            </p>
          </div>
          <Badge variant="secondary" className="h-fit">
            <TrendingUp className="h-3 w-3 mr-1" />
            {total} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No hay datos para mostrar
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={90}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="transition-all hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: '10px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Quick Stats Below Chart */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}