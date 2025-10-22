"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

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
  index?: number
  [key: string]: unknown
}

const renderCustomizedLabel = ({
  cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0, index = 0
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
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}