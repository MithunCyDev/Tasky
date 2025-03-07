"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartData {
  name: string
  value: number
}

interface DashboardChartProps {
  data: ChartData[]
  isLoading: boolean
}

export function DashboardChart({ data, isLoading }: DashboardChartProps) {
  const COLORS = ["#3b82f6", "#f59e0b", "#10b981"]

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (data.length === 0 || data.every((item) => item.value === 0)) {
    return <div className="h-[300px] w-full flex items-center justify-center text-gray-500">No data to display</div>
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

