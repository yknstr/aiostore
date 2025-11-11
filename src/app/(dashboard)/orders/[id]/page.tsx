'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  ExternalLink, 
  Calendar, 
  Package, 
  Phone,
  Mail,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Download,
  MessageCircle
} from 'lucide-react'
import { getOrderById, updateOrderStatus } from '@/lib/mock-data/orders'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import { toast } from 'sonner'
import { Order } from '@/types/order'
import { format, formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedOrder, setEditedOrder] = useState<Order | null>(null)

  const orderId = params.id as string

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrderById(orderId)
      if (foundOrder) {
        setOrder(foundOrder)
        setEditedOrder(foundOrder)
      } else {
        toast.error('Order not found')
        router.push('/orders')
      }
      setIsLoading(false)
    }
  }, [orderId, router])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedOrder(order)
  }

  const handleSave = async () => {
    if (!editedOrder) return

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updated = updateOrderStatus(editedOrder.id, editedOrder.orderStatus)
      if (updated) {
        setOrder(updated)
        setIsEditing(false)
        toast.success('Order updated successfully!')
      } else {
        toast.error('Failed to update order')
      }
    } catch (error) {
      toast.error('An error occurred while updating the order')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedOrder(order)
    setIsEditing(false)
  }

  const handleStatusChange = (newStatus: Order['orderStatus']) => {
    if (editedOrder) {
      setEditedOrder({
        ...editedOrder,
        orderStatus: newStatus,
      })
    }
  }

  const handlePrintInvoice = () => {
    if (!order) return
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-info { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AIOStore Invoice</h1>
            <h2>${order.orderNumber}</h2>
          </div>
          <div class="order-info">
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Date:</strong> ${format(new Date(order.orderDate), 'PPP', { locale: id })}</p>
            <p><strong>Total:</strong> Rp ${order.total.toLocaleString('id-ID')}</p>
          </div>
          <table class="items">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                  <td>Rp ${item.subtotal.toLocaleString('id-ID')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: Rp ${order.subtotal.toLocaleString('id-ID')}</p>
            <p>Shipping: Rp ${order.shippingCost.toLocaleString('id-ID')}</p>
            <p>Total: Rp ${order.total.toLocaleString('id-ID')}</p>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handlePrintShipping = () => {
    if (!order?.trackingNumber) return
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Shipping Label - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .label { border: 2px solid #000; padding: 20px; margin: 20px 0; }
            .from { margin-bottom: 20px; }
            .to { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="from">
              <strong>From:</strong><br>
              AIOStore<br>
              Jl. Sudirman No. 123<br>
              Jakarta Pusat 10110<br>
              Indonesia
            </div>
            <div class="to">
              <strong>To:</strong><br>
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.phone}<br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}<br>
              Indonesia
            </div>
            <div style="margin-top: 20px;">
              <strong>Order:</strong> ${order.orderNumber}<br>
              <strong>Courier:</strong> ${order.shippingCourier}<br>
              <strong>Tracking:</strong> ${order.trackingNumber}
            </div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Package className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900">Order Not Found</h2>
        <p className="text-gray-600 text-center max-w-md">
          The order you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push('/orders')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    )
  }

  const currentOrder = isEditing ? editedOrder! : order

  const getOrderTimeline = (order: Order) => {
    const events = []
    
    // Order created
    events.push({
      status: 'Order Placed',
      date: order.orderDate,
      icon: Package,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100'
    })
    
    // Payment status
    if (order.paidAt) {
      events.push({
        status: 'Payment Received',
        date: order.paidAt,
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-100'
      })
    }
    
    // Shipping status
    if (order.shippedAt) {
      events.push({
        status: 'Shipped',
        date: order.shippedAt,
        icon: Truck,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100'
      })
    }
    
    // Delivered status
    if (order.deliveredAt) {
      events.push({
        status: 'Delivered',
        date: order.deliveredAt,
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-100'
      })
    }
    
    // Cancelled
    if (order.orderStatus === 'cancelled') {
      events.push({
        status: 'Cancelled',
        date: order.updatedAt,
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100'
      })
    }
    
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const timeline = getOrderTimeline(currentOrder)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/orders')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Order' : 'Order Details'}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentOrder.orderNumber} • {format(new Date(currentOrder.orderDate), 'dd MMM yyyy', { locale: id })}
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
            <>
              <Button variant="outline" onClick={handlePrintInvoice}>
                <Printer className="w-4 h-4 mr-2" />
                Print Invoice
              </Button>
              {currentOrder.trackingNumber && (
                <Button variant="outline" onClick={handlePrintShipping}>
                  <Truck className="w-4 h-4 mr-2" />
                  Print Shipping
                </Button>
              )}
              <Button onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Order
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Order Status</label>
                    <Select
                      value={currentOrder.orderStatus}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-gray-600">
                    Changing the order status will update the order timeline and trigger appropriate notifications.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <OrderStatusBadge status={currentOrder.orderStatus} />
                    <Badge variant="outline" className="capitalize">
                      {currentOrder.platform}
                    </Badge>
                  </div>
                  
                  {/* Timeline */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Order Timeline</h4>
                    <div className="space-y-3">
                      {timeline.map((event, index) => {
                        const Icon = event.icon
                        return (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={`${event.bgColor} ${event.color} p-2 rounded-full`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{event.status}</p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(event.date), 'dd MMM yyyy, HH:mm', { locale: id })}
                              </p>
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: id })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {currentOrder.items.length} item{currentOrder.items.length !== 1 ? 's' : ''} in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rp {item.price.toLocaleString('id-ID')} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    Rp {currentOrder.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    Rp {currentOrder.shippingCost.toLocaleString('id-ID')}
                  </span>
                </div>
                {currentOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">
                      -Rp {currentOrder.discount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>Rp {currentOrder.total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="text-gray-900">{currentOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                    <Badge
                      variant={currentOrder.paymentStatus === 'paid' ? 'default' : 'destructive'}
                    >
                      {currentOrder.paymentStatus}
                    </Badge>
                  </div>
                </div>
                {currentOrder.paidAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Paid At</p>
                    <p className="text-gray-900">
                      {format(new Date(currentOrder.paidAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900">{currentOrder.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{currentOrder.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-gray-900">{currentOrder.customerPhone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{currentOrder.shippingAddress.name}</p>
                <p className="text-sm text-gray-600">{currentOrder.shippingAddress.phone}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{currentOrder.shippingAddress.address}</p>
                  <p>
                    {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.province} {currentOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          {currentOrder.shippingCourier && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Courier</p>
                  <p className="text-gray-900">{currentOrder.shippingCourier}</p>
                </div>
                {currentOrder.trackingNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                    <p className="text-gray-900 font-mono text-sm">{currentOrder.trackingNumber}</p>
                  </div>
                )}
                {currentOrder.shippedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Shipped At</p>
                    <p className="text-gray-900">
                      {format(new Date(currentOrder.shippedAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </p>
                  </div>
                )}
                {currentOrder.deliveredAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Delivered At</p>
                    <p className="text-gray-900">
                      {format(new Date(currentOrder.deliveredAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Platform Information */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Platform</p>
                <Badge variant="outline" className="capitalize">
                  {currentOrder.platform}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Platform Order ID</p>
                <p className="text-gray-900 font-mono text-sm">{currentOrder.platformOrderId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {(currentOrder.customerNotes || currentOrder.internalNotes) && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentOrder.customerNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer Notes</p>
                    <p className="text-gray-900 text-sm">{currentOrder.customerNotes}</p>
                  </div>
                )}
                {currentOrder.internalNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Internal Notes</p>
                    <p className="text-gray-900 text-sm">{currentOrder.internalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}