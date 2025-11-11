'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Edit, 
  Trash2, 
  Eye, 
  ExternalLink 
} from 'lucide-react'
import { Product } from '@/types/product'
import { PlatformBadge } from './platform-badge'
import { useRouter } from 'next/navigation'

interface ProductTableProps {
  products: Product[]
  selectedProducts: string[]
  onSelectProduct: (productId: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onViewDetail?: (product: Product) => void
}

export function ProductTable({
  products,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onEdit,
  onDelete,
  onViewDetail
}: ProductTableProps) {
  const router = useRouter()

  const handleViewDetail = (product: Product) => {
    if (onViewDetail) {
      onViewDetail(product)
    } else {
      router.push(`/products/${product.id}`)
    }
  }

  const isAllSelected = products.length > 0 && selectedProducts.length === products.length
  const isPartiallySelected = selectedProducts.length > 0 && selectedProducts.length < products.length

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Platforms
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => {
            const isSelected = selectedProducts.includes(product.id)
            const isLowStock = product.stock <= product.lowStockThreshold

            return (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectProduct(product.id, checked as boolean)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-xs">IMG</div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        <button
                          onClick={() => handleViewDetail(product)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {product.name}
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {product.sku}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">
                      Rp {product.price.toLocaleString('id-ID')}
                    </div>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="text-xs text-gray-500 line-through">
                        Rp {product.compareAtPrice.toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`${
                        isLowStock
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {product.stock}
                    </span>
                    {isLowStock && (
                      <Badge variant="destructive" className="text-xs">
                        Low
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-1">
                    {['shopee', 'tiktok', 'tokopedia'].map((platform) => {
                      const platformProduct = product.platforms.find(
                        (p) => p.platform === platform
                      )
                      return (
                        <PlatformBadge
                          key={platform}
                          platform={platform as any}
                          isPublished={platformProduct?.isPublished || false}
                        />
                      )
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      product.status === 'active'
                        ? 'default'
                        : product.status === 'inactive'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {product.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(product)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(product)}
                      title="Edit product"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try adjusting your filters or add a new product.</p>
          </div>
        </div>
      )}
    </div>
  )
}