'use client'

import { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import { mockAnalytics } from '@/lib/mock-data/analytics'
import { format, subDays } from 'date-fns'
import { id } from 'date-fns/locale'

type Period = '7d' | '30d' | '90d' | 'custom'

interface AnalyticsContextType {
  selectedPeriod: Period
  setSelectedPeriod: (period: Period) => void
  customDateRange: {
    start: string
    end: string
  }
  setCustomDateRange: (range: { start: string; end: string }) => void
  analyticsData: any
  keyMetrics: any
  getPeriodLabel: (period: Period) => string
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d')
  const [customDateRange, setCustomDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  })

  // Filter data based on selected period
  const analyticsData = useMemo(() => {
    let filteredData = { ...mockAnalytics }

    const now = new Date()
    let startDate: Date

    switch (selectedPeriod) {
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      case 'custom':
        startDate = new Date(customDateRange.start)
        break
      default:
        startDate = subDays(now, 30)
    }

    // Filter daily sales data
    filteredData.dailySales = mockAnalytics.dailySales.filter(sale => {
      const saleDate = new Date(sale.date)
      return saleDate >= startDate && saleDate <= now
    })

    // Filter top products
    filteredData.topProducts = mockAnalytics.topProducts.filter((product, index) => index < 10)

    return filteredData
  }, [selectedPeriod, customDateRange])

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const currentPeriod = analyticsData.dailySales
    const previousPeriod = mockAnalytics.dailySales.filter(sale => {
      const saleDate = new Date(sale.date)
      const now = new Date()
      const currentPeriodStart = selectedPeriod === '7d' ? subDays(now, 7) : 
                                 selectedPeriod === '30d' ? subDays(now, 30) : 
                                 selectedPeriod === '90d' ? subDays(now, 90) : 
                                 new Date(customDateRange.start)
      
      const previousPeriodStart = selectedPeriod === '7d' ? subDays(now, 14) : 
                                  selectedPeriod === '30d' ? subDays(now, 60) : 
                                  selectedPeriod === '90d' ? subDays(now, 180) : 
                                  new Date(customDateRange.start)
      
      return saleDate >= previousPeriodStart && saleDate < currentPeriodStart
    })

    const currentTotalRevenue = currentPeriod.reduce((sum, day) => sum + day.revenue, 0)
    const previousTotalRevenue = previousPeriod.reduce((sum, day) => sum + day.revenue, 0)
    const currentTotalOrders = currentPeriod.reduce((sum, day) => sum + day.orders, 0)
    const previousTotalOrders = previousPeriod.reduce((sum, day) => sum + day.orders, 0)
    const currentAvgOrderValue = currentTotalOrders > 0 ? currentTotalRevenue / currentTotalOrders : 0
    const previousAvgOrderValue = previousTotalOrders > 0 ? previousTotalRevenue / previousTotalOrders : 0

    const revenueChange = previousTotalRevenue > 0 
      ? ((currentTotalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 
      : 0
    const ordersChange = previousTotalOrders > 0 
      ? ((currentTotalOrders - previousTotalOrders) / previousTotalOrders) * 100 
      : 0
    const aovChange = previousAvgOrderValue > 0 
      ? ((currentAvgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100 
      : 0

    return {
      totalRevenue: {
        value: currentTotalRevenue,
        change: revenueChange,
        label: 'Total Revenue'
      },
      totalOrders: {
        value: currentTotalOrders,
        change: ordersChange,
        label: 'Total Orders'
      },
      avgOrderValue: {
        value: currentAvgOrderValue,
        change: aovChange,
        label: 'Avg Order Value'
      },
      conversionRate: {
        value: 3.2, // Mock conversion rate
        change: -0.3,
        label: 'Conversion Rate'
      }
    }
  }, [analyticsData, selectedPeriod, customDateRange])

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case '7d': return 'Last 7 Days'
      case '30d': return 'Last 30 Days'
      case '90d': return 'Last 90 Days'
      case 'custom': return 'Custom Range'
      default: return 'Last 30 Days'
    }
  }

  return (
    <AnalyticsContext.Provider
      value={{
        selectedPeriod,
        setSelectedPeriod,
        customDateRange,
        setCustomDateRange,
        analyticsData,
        keyMetrics,
        getPeriodLabel,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}