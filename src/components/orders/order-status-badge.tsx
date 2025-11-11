import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/types/order'
import { CheckCircle, Clock, Package, Truck, XCircle, RefreshCw } from 'lucide-react'

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md'
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Waiting for payment'
  },
  paid: {
    label: 'Paid',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    description: 'Payment confirmed'
  },
  processing: {
    label: 'Processing',
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
    description: 'Being prepared'
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Truck,
    description: 'In transit'
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Completed'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Order cancelled'
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-orange-100 text-orange-800',
    icon: RefreshCw,
    description: 'Payment refunded'
  }
}

export function OrderStatusBadge({ status, size = 'sm' }: OrderStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant="secondary"
      className={`
        ${config.color}
        ${size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'}
        flex items-center space-x-1
      `}
      title={config.description}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </Badge>
  )
}