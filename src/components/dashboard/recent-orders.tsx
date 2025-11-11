'use client'

import { useState, useEffect } from 'react'
import { mockOrders } from '@/lib/mock-data/orders'
import { formatDistanceToNow } from 'date-fns'
import { OrderStatus } from '@/types/order'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
}

const platformIcons = {
  shopee: '🟠',
  tiktok: '⚫',
  tokopedia: '🟢',
  lazada: '🔵',
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Array<any & { timeAgo: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRecentOrders = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get recent orders (latest 5)
      const recentOrders = mockOrders
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, 5)
        .map(order => ({
          ...order,
          timeAgo: formatDistanceToNow(new Date(order.orderDate), { addSuffix: true }),
        }))
      
      setOrders(recentOrders)
      setIsLoading(false)
    }

    loadRecentOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent orders</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg">
                {platformIcons[order.platform as keyof typeof platformIcons]}
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Link 
                href={`/orders/${order.id}`}
                className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate"
              >
                {order.orderNumber}
              </Link>
              <Badge 
                variant="secondary" 
                className={`text-xs ${statusColors[order.orderStatus]}`}
              >
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm text-gray-600 truncate">{order.customerName}</p>
              <span className="text-gray-400">•</span>
              <p className="text-sm text-gray-500">Rp {order.total.toLocaleString()}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">{order.timeAgo}</p>
          </div>
          
          <div className="flex-shrink-0">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {order.items.length} item{order.items.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500">{order.platform}</p>
            </div>
          </div>
        </div>
      ))}
      
      {orders.length >= 5 && (
        <div className="text-center pt-3">
          <Link 
            href="/orders" 
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            View all orders →
          </Link>
        </div>
      )}
    </div>
  )
}