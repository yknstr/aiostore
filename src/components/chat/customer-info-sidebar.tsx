'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  Calendar, 
  Star, 
  MessageSquare,
  Eye,
  ShoppingCart,
  TrendingUp,
  Clock,
  DollarSign,
  Package
} from 'lucide-react'
import { Conversation } from '@/types/message'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface CustomerInfoSidebarProps {
  conversation: Conversation
  onMobileBack: () => void
}

// Mock customer data - in real app this would come from API
const customerDetails = {
  totalOrders: 12,
  totalSpent: 2850000,
  averageOrderValue: 237500,
  memberSince: new Date('2024-03-15'),
  lastOrderDate: new Date('2025-11-08'),
  rating: 4.8,
  completedOrders: 10,
  pendingOrders: 2,
  canceledOrders: 0,
  platformAccounts: {
    shopee: { connected: true, memberSince: new Date('2024-03-15') },
    tiktok: { connected: true, memberSince: new Date('2024-06-20') },
    tokopedia: { connected: false, memberSince: null },
    lazada: { connected: true, memberSince: new Date('2024-08-10') },
  },
  orderHistory: [
    {
      id: 'ORD-20251108-001',
      date: new Date('2025-11-08'),
      total: 450000,
      items: 2,
      status: 'delivered',
      platform: 'shopee',
    },
    {
      id: 'ORD-20251105-002',
      date: new Date('2025-11-05'),
      total: 275000,
      items: 1,
      status: 'delivered',
      platform: 'tiktok',
    },
    {
      id: 'ORD-20251101-003',
      date: new Date('2025-11-01'),
      total: 320000,
      items: 2,
      status: 'processing',
      platform: 'shopee',
    },
  ],
}

export function CustomerInfoSidebar({
  conversation,
  onMobileBack,
}: CustomerInfoSidebarProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'activity'>('overview')

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const platformColors = {
    shopee: 'bg-orange-500',
    tiktok: 'bg-black',
    tokopedia: 'bg-green-500',
    lazada: 'bg-blue-500',
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="xl:hidden"
              onClick={onMobileBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">Customer Info</h2>
          </div>
        </div>
      </div>

      {/* Customer Profile */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarImage src={conversation.customerAvatar} alt={conversation.customerName} />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-lg">
              {getInitials(conversation.customerName)}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold text-gray-900">{conversation.customerName}</h3>
          <p className="text-sm text-gray-500">Customer since March 2024</p>
          
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(customerDetails.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">{customerDetails.rating}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{customerDetails.totalOrders}</div>
            <div className="text-xs text-gray-600">Total Orders</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(customerDetails.totalSpent)}
            </div>
            <div className="text-xs text-gray-600">Total Spent</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 border-b">
        <div className="flex">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'orders', label: 'Orders' },
            { key: 'activity', label: 'Activity' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
                flex-1 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-4 space-y-4">
            {/* Contact Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">+62 812-3456-7890</div>
                    <div className="text-xs text-gray-500">Primary phone</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">customer@example.com</div>
                    <div className="text-xs text-gray-500">Email address</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">Jakarta, Indonesia</div>
                    <div className="text-xs text-gray-500">Default location</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Accounts */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Platform Accounts</h4>
              <div className="space-y-2">
                {Object.entries(customerDetails.platformAccounts).map(([platform, data]) => (
                  <div key={platform} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 ${platformColors[platform as keyof typeof platformColors]} rounded-full`} />
                      <span className="text-sm font-medium capitalize">{platform}</span>
                    </div>
                    <Badge variant={data.connected ? 'default' : 'secondary'}>
                      {data.connected ? 'Connected' : 'Not connected'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Statistics */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Order Statistics</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="text-sm font-medium">{customerDetails.completedOrders}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="text-sm font-medium">{customerDetails.pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Avg. Order Value</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(customerDetails.averageOrderValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-4 space-y-3">
            {customerDetails.orderHistory.map((order) => (
              <div key={order.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${platformColors[order.platform as keyof typeof platformColors]} rounded-full`} />
                    <span className="text-sm font-medium">{order.id}</span>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDistanceToNow(order.date, { addSuffix: true, locale: id })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items:</span>
                    <span>{order.items} item{order.items !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-4 space-y-4">
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Activity Timeline</h3>
              <p className="mt-1 text-sm text-gray-500">
                Customer activity and interaction history
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}