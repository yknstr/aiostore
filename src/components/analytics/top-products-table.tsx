'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Eye, 
  ShoppingCart,
  DollarSign
} from 'lucide-react'
import { TopProduct } from '@/types/analytics'

interface TopProductsTableProps {
  data: TopProduct[]
}

export function TopProductsTable({ data }: TopProductsTableProps) {
  const [sortField, setSortField] = useState<keyof TopProduct>('revenue')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof TopProduct) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    return 0
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getSortIcon = (field: keyof TopProduct) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products data</h3>
          <p className="mt-1 text-sm text-gray-500">
            No product performance data available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {sortedData.map((product, index) => (
          <div
            key={product.productId}
            className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 text-center">
              <span className={`text-sm font-semibold ${
                index < 3 ? 'text-blue-600' : 'text-gray-600'
              }`}>
                #{index + 1}
              </span>
            </div>

            {/* Product Image */}
            <div className="flex-shrink-0">
              <Avatar className="w-12 h-12">
                <AvatarImage src={product.productImage} alt={product.productName} />
                <AvatarFallback className="bg-gray-200 text-gray-600">
                  {getInitials(product.productName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {product.productName}
                </h4>
                {index === 0 && <Badge variant="default" className="text-xs">Best Seller</Badge>}
                {index === 1 && <Badge variant="secondary" className="text-xs">Top 2</Badge>}
                {index === 2 && <Badge variant="outline" className="text-xs">Top 3</Badge>}
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <ShoppingCart className="w-3 h-3" />
                  <span>{product.salesCount} sold</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>{formatCurrency(product.revenue)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={sortField === 'revenue' ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort('revenue')}
          className="text-xs"
        >
          <ArrowUpDown className="w-3 h-3 mr-1" />
          Sort by Revenue
          {getSortIcon('revenue')}
        </Button>
        <Button
          variant={sortField === 'salesCount' ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort('salesCount')}
          className="text-xs"
        >
          <ArrowUpDown className="w-3 h-3 mr-1" />
          Sort by Sales
          {getSortIcon('salesCount')}
        </Button>
        <Button
          variant={sortField === 'productName' ? "default" : "outline"}
          size="sm"
          onClick={() => handleSort('productName')}
          className="text-xs"
        >
          <ArrowUpDown className="w-3 h-3 mr-1" />
          Sort by Name
          {getSortIcon('productName')}
        </Button>
      </div>
    </div>
  )
}