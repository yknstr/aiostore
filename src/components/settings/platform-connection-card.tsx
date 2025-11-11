'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  ShoppingCart,
  Package,
  Users,
  Clock
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface PlatformConnectionCardProps {
  platform: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada'
  title: string
  description: string
  connected: boolean
  shopName?: string
  lastSync?: string
  productCount?: number
  orderCount?: number
}

const platformColors = {
  shopee: 'border-orange-200 bg-orange-50',
  tiktok: 'border-gray-200 bg-gray-50',
  tokopedia: 'border-green-200 bg-green-50',
  lazada: 'border-blue-200 bg-blue-50',
}

const platformIcons = {
  shopee: '🛒',
  tiktok: '🎵',
  tokopedia: '🛍️',
  lazada: '📦',
}

export function PlatformConnectionCard({
  platform,
  title,
  description,
  connected,
  shopName,
  lastSync,
  productCount = 0,
  orderCount = 0,
}: PlatformConnectionCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnecting(false)
  }

  const handleDisconnect = () => {
    // In a real app, this would disconnect the platform
    console.log(`Disconnecting from ${platform}`)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsSyncing(false)
  }

  const handleViewStore = () => {
    // In a real app, this would open the platform store
    console.log(`Viewing ${platform} store`)
  }

  return (
    <Card className={`p-6 border-2 transition-all duration-200 hover:shadow-md ${
      connected ? platformColors[platform] : 'border-gray-200 bg-white'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{platformIcons[platform]}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {connected ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="w-3 h-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>
      </div>

      {/* Connection Details */}
      {connected && shopName && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Store: {shopName}</span>
          </div>
          
          {lastSync && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Last sync: {formatDistanceToNow(new Date(lastSync), { 
                  addSuffix: true, 
                  locale: id 
                })}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-600">
                <Package className="w-4 h-4" />
                <span className="text-lg font-semibold">{productCount}</span>
              </div>
              <p className="text-xs text-gray-500">Products</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-600">
                <Users className="w-4 h-4" />
                <span className="text-lg font-semibold">{orderCount}</span>
              </div>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col space-y-2">
        {!connected ? (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect {title}
              </>
            )}
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              className="flex-1"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
            <Button
              onClick={handleViewStore}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Store
            </Button>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>

      {/* Connection Instructions */}
      {!connected && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How to connect:</strong> Click "Connect {title}" and follow the authentication process. 
            You'll be redirected to {title} to authorize the connection.
          </p>
        </div>
      )}
    </Card>
  )
}