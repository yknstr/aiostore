'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { mockAnalytics } from '@/lib/mock-data/analytics'

const PLATFORM_COLORS = {
  shopee: '#ff6b35',
  tiktok: '#000000',
  tokopedia: '#00aa45',
  lazada: '#0f1470',
}

const PLATFORM_NAMES = {
  shopee: 'Shopee',
  tiktok: 'TikTok Shop',
  tokopedia: 'Tokopedia',
  lazada: 'Lazada',
}

export function PlatformChart() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadChartData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Transform platform stats for chart
      const chartData = mockAnalytics.platformStats.map(platform => ({
        name: PLATFORM_NAMES[platform.platform as keyof typeof PLATFORM_NAMES],
        value: platform.revenue / 1000000, // Convert to millions
        platform: platform.platform,
        orders: platform.orders,
        percentage: ((platform.revenue / mockAnalytics.platformStats.reduce((sum, p) => sum + p.revenue, 0)) * 100).toFixed(1),
      }))
      
      setData(chartData)
      setIsLoading(false)
    }

    loadChartData()
  }, [])

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `Rp ${value}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number, name: string) => [
                `Rp ${value.toFixed(1)}M`,
                'Revenue'
              ]}
              labelStyle={{ color: '#6b7280' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PLATFORM_COLORS[entry.platform as keyof typeof PLATFORM_COLORS]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Platform Legend */}
      <div className="grid grid-cols-2 gap-4">
        {data.map((platform) => (
          <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  platform.platform === 'shopee' ? 'bg-orange-500' :
                  platform.platform === 'tiktok' ? 'bg-black' :
                  platform.platform === 'tokopedia' ? 'bg-green-500' :
                  platform.platform === 'lazada' ? 'bg-blue-600' : 'bg-gray-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-900">{platform.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Rp {platform.value.toFixed(1)}M</p>
              <p className="text-xs text-gray-500">{platform.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}