'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  ExternalLink, 
  Calendar, 
  Package, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { getProductById, updateProduct } from '@/lib/mock-data/products'
import { PlatformBadge } from '@/components/products/platform-badge'
import { toast } from 'sonner'
import { Product, PlatformProduct } from '@/types/product'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProduct, setEditedProduct] = useState<Product | null>(null)

  const productId = params.id as string

  useEffect(() => {
    if (productId) {
      const foundProduct = getProductById(productId)
      if (foundProduct) {
        setProduct(foundProduct)
        setEditedProduct(foundProduct)
      } else {
        toast.error('Product not found')
        router.push('/products')
      }
      setIsLoading(false)
    }
  }, [productId, router])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProduct(product)
  }

  const handleSave = async () => {
    if (!editedProduct) return

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updated = updateProduct(editedProduct.id, editedProduct)
      if (updated) {
        setProduct(updated)
        setIsEditing(false)
        toast.success('Product updated successfully!')
      } else {
        toast.error('Failed to update product')
      }
    } catch (error) {
      toast.error('An error occurred while updating the product')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProduct(product)
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof Product, value: any) => {
    if (editedProduct) {
      setEditedProduct({
        ...editedProduct,
        [field]: value,
      })
    }
  }

  const handlePlatformUpdate = (platform: PlatformProduct['platform'], updates: Partial<PlatformProduct>) => {
    if (editedProduct) {
      const updatedPlatforms = editedProduct.platforms.map(p => 
        p.platform === platform ? { ...p, ...updates } : p
      )
      setEditedProduct({
        ...editedProduct,
        platforms: updatedPlatforms,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900">Product Not Found</h2>
        <p className="text-gray-600 text-center max-w-md">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push('/products')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </div>
    )
  }

  const currentProduct = isEditing ? editedProduct! : product
  const isLowStock = currentProduct.stock <= currentProduct.lowStockThreshold

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/products')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Product' : 'Product Details'}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentProduct.name} ({currentProduct.sku})
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {currentProduct.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${currentProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={currentProduct.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={currentProduct.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={currentProduct.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={currentProduct.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Footwear">Footwear</SelectItem>
                          <SelectItem value="Apparel">Apparel</SelectItem>
                          <SelectItem value="Bags">Bags</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Books">Books</SelectItem>
                          <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (Rp)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={currentProduct.price}
                        onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compareAtPrice">Compare at Price (Rp)</Label>
                      <Input
                        id="compareAtPrice"
                        type="number"
                        value={currentProduct.compareAtPrice}
                        onChange={(e) => handleInputChange('compareAtPrice', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={currentProduct.status}
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="text-gray-900 mt-1">{currentProduct.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">SKU</Label>
                      <p className="text-gray-900 mt-1">{currentProduct.sku}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Category</Label>
                      <p className="text-gray-900 mt-1">{currentProduct.category}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Management */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Management</CardTitle>
              <CardDescription>
                Manage product publication and sync status across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['shopee', 'tiktok', 'tokopedia'].map((platform) => {
                  const platformProduct = currentProduct.platforms.find(
                    (p) => p.platform === platform
                  )
                  const isPublished = platformProduct?.isPublished || false

                  return (
                    <div key={platform} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <PlatformBadge
                          platform={platform as any}
                          isPublished={isPublished}
                        />
                        <div>
                          <p className="font-medium capitalize">{platform}</p>
                          {isPublished ? (
                            <p className="text-sm text-gray-600">
                              Published • Last synced {format(platformProduct!.lastSynced!, 'dd MMM yyyy', { locale: id })}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">Not published</p>
                          )}
                        </div>
                      </div>
                      {isEditing && (
                        <Button
                          variant={isPublished ? "outline" : "default"}
                          size="sm"
                          onClick={() => handlePlatformUpdate(platform as any, { 
                            isPublished: !isPublished 
                          })}
                        >
                          {isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                      )}
                      {isPublished && platformProduct?.platformUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          title={`View on ${platform}`}
                        >
                          <a
                            href={platformProduct.platformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View product on ${platform}`}
                          >
                            <span className="sr-only">View on {platform}</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Current Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={currentProduct.stock}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={currentProduct.lowStockThreshold}
                      onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {currentProduct.stock}
                      </span>
                      {isLowStock && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Stock Threshold</span>
                    <span className="text-sm font-medium">{currentProduct.lowStockThreshold}</span>
                  </div>
                  {isLowStock && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-700">Low stock alert</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={currentProduct.price}
                      onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compareAtPrice">Compare at Price</Label>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      value={currentProduct.compareAtPrice}
                      onChange={(e) => handleInputChange('compareAtPrice', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="text-xl font-bold text-gray-900">
                      Rp {currentProduct.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {currentProduct.compareAtPrice && currentProduct.compareAtPrice > currentProduct.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Compare at</span>
                      <span className="text-sm text-gray-500 line-through">
                        Rp {currentProduct.compareAtPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  {currentProduct.compareAtPrice && currentProduct.compareAtPrice > currentProduct.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Savings</span>
                      <span className="text-sm font-medium text-green-600">
                        Rp {(currentProduct.compareAtPrice - currentProduct.price).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Product Status</span>
                  <Badge
                    variant={
                      currentProduct.status === 'active'
                        ? 'default'
                        : currentProduct.status === 'inactive'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {currentProduct.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {format(currentProduct.createdAt, 'dd MMM yyyy', { locale: id })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {format(currentProduct.updatedAt, 'dd MMM yyyy', { locale: id })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}