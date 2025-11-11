'use client'

import { useState, useEffect } from 'react'
import { StatCard } from '@/components/dashboard/stat-card'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { PlatformChart } from '@/components/dashboard/platform-chart'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { TopProducts } from '@/components/dashboard/top-products'
import { mockAnalytics, getPerformanceMetrics } from '@/lib/mock-data/analytics'
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react'

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    // Simulate data loading
    const loadDashboardData = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const performanceMetrics = getPerformanceMetrics()
      setMetrics(performanceMetrics)
      setIsLoading(false)
    }

    loadDashboardData()
  }, [selectedPeriod])

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        {/* Loading skeleton for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Period:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={metrics.products.total}
          icon={<Package className="h-6 w-6" />}
          trend={{
            value: 8.2,
            isPositive: true,
          }}
          description="Active products"
        />
        
        <StatCard
          title="Active Orders"
          value={metrics.orders.total}
          icon={<ShoppingCart className="h-6 w-6" />}
          trend={{
            value: 12.5,
            isPositive: true,
          }}
          description={`${metrics.orders.delivered} delivered`}
        />
        
        <StatCard
          title="Revenue (This Month)"
          value={`Rp ${(metrics.revenue.thisMonth / 1000000).toFixed(1)}M`}
          icon={<DollarSign className="h-6 w-6" />}
          trend={{
            value: metrics.revenue.monthGrowth,
            isPositive: metrics.revenue.monthGrowth >= 0,
          }}
          description={`${metrics.revenue.monthGrowth >= 0 ? '+' : ''}${metrics.revenue.monthGrowth.toFixed(1)}% vs last month`}
        />
        
        <StatCard
          title="Low Stock Alerts"
          value={metrics.products.lowStock}
          icon={<AlertTriangle className="h-6 w-6" />}
          trend={{
            value: -5.1,
            isPositive: false,
          }}
          description="Products need restocking"
          className={metrics.products.lowStock > 10 ? 'border-red-200 bg-red-50' : ''}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sales Trend</h2>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              Last {selectedPeriod}
            </div>
          </div>
          <SalesChart period={selectedPeriod} />
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Platform Performance</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              Revenue by platform
            </div>
          </div>
          <PlatformChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <a 
              href="/orders" 
              className="text-sm text-primary-500 hover:text-primary-600"
            >
              View all
            </a>
          </div>
          <RecentOrders />
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            <a 
              href="/products" 
              className="text-sm text-primary-500 hover:text-primary-600"
            >
              View all
            </a>
          </div>
          <TopProducts />
        </div>
      </div>
    </div>
  )
}