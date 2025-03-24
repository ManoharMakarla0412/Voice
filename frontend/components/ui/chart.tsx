"use client"

import * as React from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from "recharts"
import { cn } from "../../lib/utils"

interface ChartData {
  name: string
  value: number
}

interface ChartProps {
  data: ChartData[]
  colors: string[]
  showLabel?: boolean
  className?: string
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {value}
    </text>
  )
}

export function Chart({ data, colors, showLabel = true, className }: ChartProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabel ? renderCustomizedLabel : undefined}
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                className="stroke-[#1a1a1a] stroke-2"
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#2a2a2a] px-3 py-2 rounded-sm shadow-md border border-gray-800">
                    <p className="text-white text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              paddingTop: "20px"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChartContainer({ className, ...props }: ChartProps) {
  return (
    <div className={cn("w-full aspect-square", className)}>
      <Chart {...props} />
    </div>
  )
}

export const ChartPie = Chart

