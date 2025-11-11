'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { PlatformStats } from '@/types/analytics'

interface PlatformComparisonChartProps {
  data: PlatformStats[]
}

const COLORS = {
  shopee: '#ff6b35',
  tiktok: '#000000',
  tokopedia: '#42b549',
  lazada: '#0066cc',
}

export function PlatformComparisonChart({ data }: PlatformComparisonChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 capitalize">
            {data.platform}
          </p>
          <p className="text-sm text-blue-600">
            Revenue: {formatCurrency(data.revenue)}
          </p>
          <p className="text-sm text-green-600">
            Orders: {data.orders}
          </p>
          <p className="text-sm text-purple-600">
            Products: {data.products}
          </p>
          <p className="text-sm text-orange-600">
            Conversion: {data.conversionRate}%
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="revenue"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.platform as keyof typeof COLORS]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span className="text-sm font-medium capitalize">
                {value} ({formatCurrency(entry.payload?.revenue || 0)})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}