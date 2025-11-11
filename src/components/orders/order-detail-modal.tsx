'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Printer, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  CreditCard,
  ShoppingBag,
  FileText,
  MessageSquare,
  Edit,
  Save
} from 'lucide-react'
import { Order, OrderStatus } from '@/types/order'
import { OrderStatusBadge } from './order-status-badge'
import { format, formatDistanceToNow } from 'date-fns'
import { ProgressBar } from '@/components/ui/progress-bar'
import { id } from 'date-fns/locale'

interface OrderDetailModalProps {
  order: Order
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void
  onPrintInvoice: () => void
  onPrintShipping: () => void
  onClose: () => void
}

const statusOptions: { value: OrderStatus; label: string; description: string }[] = [
  { value: 'pending', label: 'Pending', description: 'Waiting for payment' },
  { value: 'paid', label: 'Paid', description: 'Payment confirmed' },
  { value: 'processing', label: 'Processing', description: 'Preparing the order' },
  { value: 'shipped', label: 'Shipped', description: 'Order has been shipped' },
  { value: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
  { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' },
  { value: 'refunded', label: 'Refunded', description: 'Payment has been refunded' },
]

const timelineEvents = (order: Order) => {
  const events = [
    {
      status: 'pending',
      title: 'Order Placed',
      description: 'Order has been created',
      time: order.orderDate,
      icon: ShoppingBag,
    }
  ]

  if (order.paidAt) {
    events.push({
      status: 'paid',
      title: 'Payment Confirmed',
      description: `Payment via ${order.paymentMethod}`,
      time: order.paidAt,
      icon: CreditCard,
    })
  }

  if (order.orderStatus === 'processing' || 
      order.orderStatus === 'shipped' || 
      order.orderStatus === 'delivered') {
    events.push({
      status: 'processing',
      title: 'Order Processing',
      description: 'Order is being prepared',
      time: new Date(order.orderDate),
      icon: Package,
    })
  }

  if (order.shippedAt) {
    events.push({
      status: 'shipped',
      title: 'Order Shipped',
      description: `Via ${order.shippingCourier}${order.trackingNumber ? ` (${order.trackingNumber})` : ''}`,
      time: order.shippedAt,
      icon: Truck,
    })
  }

  if (order.deliveredAt) {
    events.push({
      status: 'delivered',
      title: 'Order Delivered',
      description: 'Order has been delivered to customer',
      time: order.deliveredAt,
      icon: CheckCircle,
    })
  }

  if (order.orderStatus === 'cancelled') {
    events.push({
      status: 'cancelled',
      title: 'Order Cancelled',
      description: 'Order has been cancelled',
      time: new Date(order.orderDate),
      icon: X,
    })
  }

  return events
}

export function OrderDetailModal({
  order,
  onStatusUpdate,
  onPrintInvoice,
  onPrintShipping,
  onClose,
}: OrderDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.orderStatus)
  const [internalNotes, setInternalNotes] = useState(order.internalNotes || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleStatusUpdate = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onStatusUpdate(order.id, newStatus)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getOrderProgress = () => {
    const statusOrder: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered']
    const currentIndex = statusOrder.indexOf(order.orderStatus)
    return {
      current: currentIndex + 1,
      total: statusOrder.length,
      percentage: ((currentIndex + 1) / statusOrder.length) * 100
    }
  }

  const progress = getOrderProgress()

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Created {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true, locale: id })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrintInvoice}
              >
                <Printer className="w-4 h-4 mr-2" />
                Invoice
              </Button>
              {order.trackingNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrintShipping}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Shipping Label
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Progress */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Order Progress</h3>
              <div className="text-sm text-gray-600">
                {progress.current} of {progress.total} steps
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                {timelineEvents(order).map((event, index) => {
                  const Icon = event.icon
                  const isCompleted = index < timelineEvents(order).length
                  return (
                    <div key={index} className="flex flex-col items-center relative">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-2
                          ${isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'bg-gray-200 border-gray-300 text-gray-400'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-center mt-2 max-w-20">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-gray-500 text-xs">
                          {format(new Date(event.time), 'dd MMM', { locale: id })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-10">
                <ProgressBar
                  current={progress.current}
                  total={progress.total}
                  className=""
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Summary */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <Badge variant="outline" className="capitalize">
                    {order.platform}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span>{format(new Date(order.orderDate), 'PPP', { locale: id })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center space-x-2">
                    <OrderStatusBadge status={order.orderStatus} />
                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="mt-3 space-y-2">
                    <Select value={newStatus} onValueChange={(value: OrderStatus) => setNewStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label} - {status.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleStatusUpdate}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                        ) : (
                          <Save className="w-3 h-3 mr-1" />
                        )}
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false)
                          setNewStatus(order.orderStatus)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Customer Information */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">{order.customerName}</div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Phone className="w-4 h-4 mr-1" />
                    {order.customerPhone}
                  </div>
                  {order.customerEmail && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Mail className="w-4 h-4 mr-1" />
                      {order.customerEmail}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Shipping Address
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>

                {order.shippingCourier && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Details</h4>
                    <div className="text-sm text-gray-600">
                      <p>Courier: {order.shippingCourier}</p>
                      {order.trackingNumber && (
                        <p>Tracking: {order.trackingNumber}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Items ({order.items.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">SKU</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium text-sm">{item.productName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {item.sku}
                      </td>
                      <td className="py-3 text-sm text-right">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-sm text-right">
                        Rp {item.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 text-sm text-right font-medium">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Order Totals */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span>Rp {order.shippingCost.toLocaleString('id-ID')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-Rp {order.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>Rp {order.tax.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
              <div className="text-sm text-gray-600">
                Payment Method: {order.paymentMethod}
              </div>
              {order.paymentStatus !== 'unpaid' && (
                <div className="text-sm">
                  <span className="text-gray-600">Payment Status: </span>
                  <Badge 
                    variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                    className="ml-1"
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Internal Notes */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Internal Notes
            </h3>
            {order.internalNotes ? (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{order.internalNotes}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No internal notes</p>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}