'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'
import { Product } from '@/types/product'
import { PlatformType } from '@/types/product'

interface ProductFiltersProps {
  filters: {
    platform: 'all' | PlatformType
    status: 'all' | 'active' | 'inactive' | 'out_of_stock'
    category: 'all' | string
  }
  onFiltersChange: (filters: any) => void
  products: Product[]
}

const platformOptions = [
  { value: 'all', label: 'All Platforms' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'tiktok', label: 'TikTok Shop' },
  { value: 'tokopedia', label: 'Tokopedia' },
  { value: 'lazada', label: 'Lazada' },
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

export function ProductFilters({ filters, onFiltersChange, products }: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  // Get unique categories from products
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  ).sort()

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((category) => ({ value: category, label: category })),
  ]

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      platform: 'all',
      status: 'all',
      category: 'all',
    })
  }

  const hasActiveFilters = filters.platform !== 'all' || filters.status !== 'all' || filters.category !== 'all'

  return (
    <div className="flex items-center space-x-4">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:flex items-center space-x-4">
        {/* Platform Filter */}
        <Select
          value={filters.platform}
          onValueChange={(value) => handleFilterChange('platform', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {platformOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 z-50 lg:hidden">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Platform
                </label>
                <Select
                  value={filters.platform}
                  onValueChange={(value) => handleFilterChange('platform', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platformOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && !showFilters && (
        <div className="hidden lg:flex items-center space-x-2">
          {filters.platform !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Platform: {platformOptions.find(p => p.value === filters.platform)?.label}</span>
              <button
                onClick={() => handleFilterChange('platform', 'all')}
                className="ml-1 hover:text-red-500"
                title={`Remove platform filter: ${platformOptions.find(p => p.value === filters.platform)?.label}`}
              >
                <X className="w-3 h-3" />
                <span className="sr-only">Remove platform filter</span>
              </button>
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {statusOptions.find(s => s.value === filters.status)?.label}</span>
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className="ml-1 hover:text-red-500"
                title={`Remove status filter: ${statusOptions.find(s => s.value === filters.status)?.label}`}
              >
                <X className="w-3 h-3" />
                <span className="sr-only">Remove status filter</span>
              </button>
            </Badge>
          )}
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Category: {categoryOptions.find(c => c.value === filters.category)?.label}</span>
              <button
                onClick={() => handleFilterChange('category', 'all')}
                className="ml-1 hover:text-red-500"
                title={`Remove category filter: ${categoryOptions.find(c => c.value === filters.category)?.label}`}
              >
                <X className="w-3 h-3" />
                <span className="sr-only">Remove category filter</span>
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}