import { DailySales, PlatformStats, TopProduct } from '@/types/analytics'

export const mockAnalytics = {
  dailySales: generateDailySalesData(),
  platformStats: [
    {
      platform: 'shopee' as const,
      revenue: 2450000,
      orders: 156,
      products: 89,
      conversionRate: 3.2,
    },
    {
      platform: 'tiktok' as const,
      revenue: 1850000,
      orders: 142,
      products: 67,
      conversionRate: 4.1,
    },
    {
      platform: 'tokopedia' as const,
      revenue: 1650000,
      orders: 98,
      products: 45,
      conversionRate: 2.8,
    },
    {
      platform: 'lazada' as const,
      revenue: 1250000,
      orders: 78,
      products: 34,
      conversionRate: 2.3,
    },
  ],
  topProducts: [
    {
      productId: '1',
      productName: 'Sepatu Sneakers Nike Air Max 270',
      productImage: '/images/products/shoe-1.jpg',
      salesCount: 45,
      revenue: 38250000,
    },
    {
      productId: '2',
      productName: 'T-Shirt Baseball Cap NY Original',
      productImage: '/images/products/tshirt-1.jpg',
      salesCount: 38,
      revenue: 22800000,
    },
    {
      productId: '3',
      productName: 'Kacamata Rayban Wayfarer Original',
      productImage: '/images/products/glasses-1.jpg',
      salesCount: 32,
      revenue: 48000000,
    },
    {
      productId: '4',
      productName: 'Tas Backpack Herschel Original',
      productImage: '/images/products/bag-1.jpg',
      salesCount: 28,
      revenue: 35000000,
    },
    {
      productId: '5',
      productName: 'Hoodie Champion Original Navy',
      productImage: '/images/products/hoodie-1.jpg',
      salesCount: 25,
      revenue: 18750000,
    },
    {
      productId: '6',
      productName: 'Sneakers Adidas Ultraboost 21',
      productImage: '/images/products/shoe-2.jpg',
      salesCount: 22,
      revenue: 35200000,
    },
    {
      productId: '7',
      productName: 'Jacket Denim Levi\'s 501 Original',
      productImage: '/images/products/jacket-1.jpg',
      salesCount: 20,
      revenue: 24000000,
    },
    {
      productId: '8',
      productName: 'Wristwatch Casio G-Shock DW-5600',
      productImage: '/images/products/watch-1.jpg',
      salesCount: 18,
      revenue: 21600000,
    },
  ],
}

// Helper function to generate daily sales data
function generateDailySalesData(): DailySales[] {
  const data: DailySales[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Generate realistic sales data with some variance
    const baseRevenue = 150000
    const variance = Math.random() * 100000 - 50000 // ±50k variance
    const dayOfWeek = date.getDay()
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1 // Weekend boost
    
    const revenue = Math.floor((baseRevenue + variance) * weekendBoost)
    const orders = Math.floor(revenue / 30000) + Math.floor(Math.random() * 5) // ~30k per order
    const avgOrderValue = orders > 0 ? revenue / orders : 0
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue,
      orders,
      avgOrderValue,
    })
  }
  
  return data
}

// Dashboard performance metrics function
export const getPerformanceMetrics = () => {
  // Calculate metrics from mock data
  const totalRevenue = mockAnalytics.dailySales.reduce((sum, day) => sum + day.revenue, 0)
  const totalOrders = mockAnalytics.dailySales.reduce((sum, day) => sum + day.orders, 0)
  const currentMonthData = mockAnalytics.dailySales.filter(day => {
    const dayDate = new Date(day.date)
    const now = new Date()
    return dayDate.getMonth() === now.getMonth() && dayDate.getFullYear() === now.getFullYear()
  })
  const thisMonthRevenue = currentMonthData.reduce((sum, day) => sum + day.revenue, 0)
  
  // Calculate previous month for growth
  const previousMonthData = mockAnalytics.dailySales.filter(day => {
    const dayDate = new Date(day.date)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return dayDate.getMonth() === lastMonth.getMonth() && dayDate.getFullYear() === lastMonth.getFullYear()
  })
  const lastMonthRevenue = previousMonthData.reduce((sum, day) => sum + day.revenue, 0)
  const monthGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  return {
    products: {
      total: 156, // Mock total products
      lowStock: 8, // Mock low stock count
    },
    orders: {
      total: totalOrders,
      delivered: Math.floor(totalOrders * 0.85), // Mock delivered percentage
      processing: Math.floor(totalOrders * 0.10),
      pending: Math.floor(totalOrders * 0.05),
    },
    revenue: {
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      monthGrowth: monthGrowth,
      total: totalRevenue,
    },
    customers: {
      total: 2847, // Mock total customers
      newThisMonth: 145, // Mock new customers
    },
    platforms: {
      active: 4, // Mock active platforms
      totalRevenue: totalRevenue,
    }
  }
}

// Analytics utility functions
export const getTotalRevenue = (data: DailySales[]): number => {
  return data.reduce((sum, day) => sum + day.revenue, 0)
}

export const getTotalOrders = (data: DailySales[]): number => {
  return data.reduce((sum, day) => sum + day.orders, 0)
}

export const getAverageOrderValue = (data: DailySales[]): number => {
  const totalOrders = getTotalOrders(data)
  return totalOrders > 0 ? getTotalRevenue(data) / totalOrders : 0
}

export const getGrowthRate = (current: number, previous: number): number => {
  return previous > 0 ? ((current - previous) / previous) * 100 : 0
}

export const getBestPerformingDay = (data: DailySales[]): DailySales | null => {
  if (data.length === 0) return null
  return data.reduce((best, current) => 
    current.revenue > best.revenue ? current : best
  )
}

export const getWorstPerformingDay = (data: DailySales[]): DailySales | null => {
  if (data.length === 0) return null
  return data.reduce((worst, current) => 
    current.revenue < worst.revenue ? current : worst
  )
}

// Platform-specific analytics
export const getPlatformRevenuePercentage = (platformStats: PlatformStats[]): Record<string, number> => {
  const totalRevenue = platformStats.reduce((sum, platform) => sum + platform.revenue, 0)
  return platformStats.reduce((acc, platform) => {
    acc[platform.platform] = totalRevenue > 0 ? (platform.revenue / totalRevenue) * 100 : 0
    return acc
  }, {} as Record<string, number>)
}

export const getTopPlatformByRevenue = (platformStats: PlatformStats[]): PlatformStats | null => {
  if (platformStats.length === 0) return null
  return platformStats.reduce((top, platform) => 
    platform.revenue > top.revenue ? platform : top
  )
}

export const getTopPlatformByConversion = (platformStats: PlatformStats[]): PlatformStats | null => {
  if (platformStats.length === 0) return null
  return platformStats.reduce((top, platform) => 
    platform.conversionRate > top.conversionRate ? platform : top
  )
}

// Product analytics
export const getTopProductsByRevenue = (topProducts: TopProduct[], limit: number = 5): TopProduct[] => {
  return [...topProducts]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

export const getTopProductsBySales = (topProducts: TopProduct[], limit: number = 5): TopProduct[] => {
  return [...topProducts]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, limit)
}

export const getAverageProductPrice = (topProducts: TopProduct[]): number => {
  if (topProducts.length === 0) return 0
  const totalRevenue = topProducts.reduce((sum, product) => sum + product.revenue, 0)
  const totalSales = topProducts.reduce((sum, product) => sum + product.salesCount, 0)
  return totalSales > 0 ? totalRevenue / totalSales : 0
}

// Function to get analytics data by period
export const getAnalyticsByPeriod = (period: '7d' | '30d' | '90d') => {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  // Filter daily sales data based on period
  const filteredDailySales = mockAnalytics.dailySales.filter(sale => {
    const saleDate = new Date(sale.date)
    return saleDate >= startDate && saleDate <= now
  })

  return {
    ...mockAnalytics,
    dailySales: filteredDailySales,
  }
}