'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Search, 
  Download, 
  Filter, 
  Eye, 
  Edit, 
  Printer, 
  MessageCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package
} from 'lucide-react'
import { mockOrders } from '@/lib/mock-data/orders'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import { OrderFilters } from '@/components/orders/order-filters'
import { OrderDetailModal } from '@/components/orders/order-detail-modal'
import { Order } from '@/types/order'
import { PlatformType } from '@/types/product'
import { format, formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filters, setFilters] = useState({
    platform: 'all' as PlatformType | 'all',
    status: 'all' as Order['orderStatus'] | 'all',
    dateRange: 'all' as 'today' | 'week' | 'month' | 'all',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.platformOrderId.toLowerCase().includes(query)
      )
    }

    // Platform filter
    if (filters.platform !== 'all') {
      filtered = filtered.filter((order) => order.platform === filters.platform)
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((order) => order.orderStatus === filters.status)
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate)
        switch (filters.dateRange) {
          case 'today':
            return orderDate >= today
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return orderDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            return orderDate >= monthAgo
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
  }, [orders, searchQuery, filters])

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  // Event handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSelectOrder = (orderId: string, selected: boolean) => {
    if (selected) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedOrders(paginatedOrders.map((o) => o.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleViewOrder = (order: Order) => {
    router.push(`/orders/${order.id}`)
  }

  const handleViewOrderModal = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const handleStatusUpdate = (orderId: string, newStatus: Order['orderStatus']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            orderStatus: newStatus,
            updatedAt: new Date(),
            shippedAt: newStatus === 'shipped' ? new Date() : order.shippedAt,
            deliveredAt: newStatus === 'delivered' ? new Date() : order.deliveredAt
          }
        : order
    ))
  }

  const handlePrintInvoice = (order: Order) => {
    // Open print dialog for invoice
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

  const handlePrintShipping = (order: Order) => {
    // Open print dialog for shipping label
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
              ${order.trackingNumber ? `<strong>Tracking:</strong> ${order.trackingNumber}` : ''}
            </div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track orders from all platforms
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, color: 'bg-blue-500' },
          { label: 'Pending', value: orders.filter(o => o.orderStatus === 'pending').length, color: 'bg-yellow-500' },
          { label: 'Processing', value: orders.filter(o => o.orderStatus === 'processing').length, color: 'bg-purple-500' },
          { label: 'Shipped', value: orders.filter(o => o.orderStatus === 'shipped').length, color: 'bg-green-500' },
        ].map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg mr-4`}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders by number, customer name, or order ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Other Filters */}
          <OrderFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            orders={orders}
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                      title="Select all orders on this page"
                      aria-label="Select all orders on this page"
                    />
                    <span className="sr-only">Select all orders</span>
                  </label>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                        className="rounded"
                        title={`Select order ${order.orderNumber}`}
                        aria-label={`Select order ${order.orderNumber}`}
                      />
                      <span className="sr-only">Select this order</span>
                    </label>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {order.orderNumber}
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customerName}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {order.customerPhone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="capitalize">
                      {order.platform}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Rp {order.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.orderStatus} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>
                      {format(new Date(order.orderDate), 'dd MMM yyyy', { locale: id })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(order.orderDate), {
                        addSuffix: true,
                        locale: id
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintInvoice(order)}
                        title="Print invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      {order.trackingNumber && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintShipping(order)}
                          title="Print shipping label"
                        >
                          <Truck className="w-4 h-4" />
                        </Button>
                      )}
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} results
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

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onStatusUpdate={handleStatusUpdate}
          onPrintInvoice={() => handlePrintInvoice(selectedOrder)}
          onPrintShipping={() => handlePrintShipping(selectedOrder)}
          onClose={() => {
            setShowOrderDetail(false)
            setSelectedOrder(null)
          }}
        />
      )}
    </div>
  )
}