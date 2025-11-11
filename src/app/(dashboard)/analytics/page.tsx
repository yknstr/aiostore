'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  Package,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { RevenueChart } from '@/components/analytics/revenue-chart'
import { OrdersChart } from '@/components/analytics/orders-chart'
import { PlatformComparisonChart } from '@/components/analytics/platform-comparison-chart'
import { TopProductsTable } from '@/components/analytics/top-products-table'
import { MetricCard } from '@/components/analytics/metric-card'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function AnalyticsPage() {
  const {
    selectedPeriod,
    setSelectedPeriod,
    customDateRange,
    setCustomDateRange,
    analyticsData,
    keyMetrics,
    getPeriodLabel,
  } = useAnalytics()

  const handleExportData = () => {
    // Mock export functionality
    const csvContent = [
      ['Date', 'Revenue', 'Orders', 'Avg Order Value'],
      ...analyticsData.dailySales.map((day: any) => [
        day.date,
        day.revenue.toString(),
        day.orders.toString(),
        day.avgOrderValue.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${selectedPeriod}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
            <p className="text-sm text-gray-600">
              {getPeriodLabel(selectedPeriod)} data
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
            {selectedPeriod === 'custom' && (
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={customDateRange.start}
                  title="Start date"
                  placeholder="Start date"
                  onChange={(e) => setCustomDateRange({ start: e.target.value, end: customDateRange.end })}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="date"
                  value={customDateRange.end}
                  title="End date"
                  placeholder="End date"
                  onChange={(e) => setCustomDateRange({ start: customDateRange.start, end: e.target.value })}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={keyMetrics.totalRevenue.label}
          value={keyMetrics.totalRevenue.value}
          change={keyMetrics.totalRevenue.change}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title={keyMetrics.totalOrders.label}
          value={keyMetrics.totalOrders.value}
          change={keyMetrics.totalOrders.change}
          icon={ShoppingCart}
          format="number"
        />
        <MetricCard
          title={keyMetrics.avgOrderValue.label}
          value={keyMetrics.avgOrderValue.value}
          change={keyMetrics.avgOrderValue.change}
          icon={Target}
          format="currency"
        />
        <MetricCard
          title={keyMetrics.conversionRate.label}
          value={keyMetrics.conversionRate.value}
          change={keyMetrics.conversionRate.change}
          icon={Users}
          format="percentage"
          suffix="%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>{getPeriodLabel(selectedPeriod)}</span>
            </div>
          </div>
          <RevenueChart data={analyticsData.dailySales} />
        </Card>

        {/* Orders Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Orders Trend</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ShoppingCart className="w-4 h-4" />
              <span>{getPeriodLabel(selectedPeriod)}</span>
            </div>
          </div>
          <OrdersChart data={analyticsData.dailySales} />
        </Card>
      </div>

      {/* Platform Comparison & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <PieChart className="w-4 h-4" />
              <span>Revenue Distribution</span>
            </div>
          </div>
          <PlatformComparisonChart data={analyticsData.platformStats} />
        </Card>

        {/* Top Products Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>Best Performers</span>
            </div>
          </div>
          <TopProductsTable data={analyticsData.topProducts} />
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Platform Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
          <div className="space-y-4">
            {analyticsData.platformStats.map((platform: any) => (
              <div key={platform.platform} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    platform.platform === 'shopee' ? 'bg-orange-500' :
                    platform.platform === 'tiktok' ? 'bg-black' :
                    platform.platform === 'tokopedia' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="text-sm font-medium capitalize">{platform.platform}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(platform.revenue)}
                  </div>
                  <div className="text-xs text-gray-500">{platform.orders} orders</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Customer Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Customers</span>
              <div className="flex items-center space-x-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-600">+12%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Returning Customers</span>
              <div className="flex items-center space-x-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-600">+8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm font-semibold ml-1">4.8</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Sales peak detected</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">New product trend</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Platform sync completed</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}