'use client'

import { useState, useEffect } from 'react'
import { mockAnalytics } from '@/lib/mock-data/analytics'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const platformColors = {
  shopee: 'bg-orange-100 text-orange-800',
  tiktok: 'bg-gray-100 text-gray-800',
  tokopedia: 'bg-green-100 text-green-800',
  lazada: 'bg-blue-100 text-blue-800',
}

const platformNames = {
  shopee: 'Shopee',
  tiktok: 'TikTok',
  tokopedia: 'Tokopedia',
  lazada: 'Lazada',
}

export function TopProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTopProducts = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get top 5 products by revenue
      const topProducts = mockAnalytics.topProducts
        .slice(0, 5)
        .map(product => ({
          ...product,
          // Mock platform data (since it's not in the top products data)
          platforms: ['shopee', 'tiktok'].filter(() => Math.random() > 0.5),
        }))
      
      setProducts(topProducts)
      setIsLoading(false)
    }

    loadTopProducts()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={product.productId} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
              {product.productImage ? (
                <img 
                  src={product.productImage} 
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-gray-400">No Image</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Link 
              href={`/products/${product.productId}`}
              className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
            >
              {product.productName}
            </Link>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm text-gray-600">{product.salesCount} sold</p>
              <span className="text-gray-400">•</span>
              <p className="text-sm font-semibold text-gray-900">
                Rp {product.revenue.toLocaleString()}
              </p>
            </div>
            {product.platforms.length > 0 && (
              <div className="flex items-center space-x-1 mt-2">
                {product.platforms.map((platform: string) => (
                  <Badge 
                    key={platform}
                    variant="secondary" 
                    className={`text-xs ${platformColors[platform as keyof typeof platformColors]}`}
                  >
                    {platformNames[platform as keyof typeof platformNames]}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">#{index + 1}</p>
              <p className="text-xs text-gray-500">Top product</p>
            </div>
          </div>
        </div>
      ))}
      
      {products.length >= 5 && (
        <div className="text-center pt-3">
          <Link 
            href="/products" 
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            View all products →
          </Link>
        </div>
      )}
    </div>
  )
}