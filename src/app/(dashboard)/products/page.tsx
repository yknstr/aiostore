'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Search, Download, RefreshCw, Filter, Eye, Edit, Trash2 } from 'lucide-react'
import { mockProducts } from '@/lib/mock-data/products'
import { PlatformBadge } from '@/components/products/platform-badge'
import { ProductFilters } from '@/components/products/product-filters'
import { ProductFormModal } from '@/components/products/product-form-modal'
import { BulkActionsBar } from '@/components/products/bulk-actions-bar'
import { Product } from '@/types/product'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filters, setFilters] = useState({
    platform: 'all' as 'all' | 'shopee' | 'tiktok' | 'tokopedia' | 'lazada',
    status: 'all' as 'all' | 'active' | 'inactive' | 'out_of_stock',
    category: 'all',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
      )
    }

    // Platform filter
    if (filters.platform !== 'all') {
      filtered = filtered.filter((product) =>
        product.platforms.some(
          (platform) => platform.platform === filters.platform && platform.isPublished
        )
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((product) => product.status === filters.status)
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter((product) => product.category === filters.category)
    }

    return filtered
  }, [products, searchQuery, filters])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  // Event handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSelectProduct = (productId: string, selected: boolean) => {
    if (selected) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedProducts(paginatedProducts.map((p) => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowProductModal(true)
  }

  const handleViewProduct = (product: Product) => {
    router.push(`/products/${product.id}`)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowProductModal(true)
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId))
    setSelectedProducts(selectedProducts.filter((id) => id !== productId))
  }

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? { ...productData, id: p.id, createdAt: p.createdAt, updatedAt: new Date() }
            : p
        )
      )
    } else {
      // Add new product
      const newProduct: Product = {
        ...productData,
        id: `prod_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setProducts([newProduct, ...products])
    }
    setShowProductModal(false)
    setEditingProduct(null)
  }

  const handleBulkPublish = (platform: string) => {
    // Mock bulk publish action
    console.log(`Publishing ${selectedProducts.length} products to ${platform}`)
    setSelectedProducts([])
  }

  const handleBulkDelete = () => {
    setProducts(products.filter((p) => !selectedProducts.includes(p.id)))
    setSelectedProducts([])
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your product catalog across all platforms
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
          <Button onClick={handleAddProduct} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Other Filters */}
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            products={products}
          />
        </div>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedProducts.length}
          onBulkPublish={handleBulkPublish}
          onBulkDelete={handleBulkDelete}
        />
      )}

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <Checkbox
                    checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                    onCheckedChange={handleSelectAll}
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
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
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
                          {product.name}
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
                    Rp {product.price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`${
                        product.stock <= product.lowStockThreshold
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {product.stock}
                    </span>
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
                        onClick={() => handleViewProduct(product)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 bg-white border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Product Form Modal */}
      {showProductModal && (
        <ProductFormModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowProductModal(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}