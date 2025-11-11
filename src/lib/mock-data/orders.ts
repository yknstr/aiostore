import { Order, OrderItem } from '@/types/order'
import { mockProducts } from './products'

// Generate realistic order data
const generateOrderItems = (productIds: string[]): OrderItem[] => {
  const items: OrderItem[] = []
  const itemCount = Math.floor(Math.random() * 3) + 1 // 1-3 items per order
  
  for (let i = 0; i < itemCount; i++) {
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
    const quantity = Math.floor(Math.random() * 3) + 1
    
    items.push({
      id: `item-${Date.now()}-${i}`,
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      sku: product.sku,
      quantity,
      price: product.price,
      subtotal: product.price * quantity,
    })
  }
  
  return items
}

const sampleOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-20250115-001',
    platform: 'shopee',
    platformOrderId: 'SP-ORD-123456',
    customerName: 'Budi Santoso',
    customerEmail: 'budi@email.com',
    customerPhone: '081234567890',
    items: [
      {
        id: 'item-1',
        productId: '1',
        productName: 'Sepatu Sneakers Nike Air Max 270',
        productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        sku: 'SHOE-001',
        quantity: 1,
        price: 850000,
        subtotal: 850000,
      },
    ],
    subtotal: 850000,
    shippingCost: 15000,
    discount: 0,
    tax: 0,
    total: 865000,
    orderStatus: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'Transfer Bank',
    shippingAddress: {
      name: 'Budi Santoso',
      phone: '081234567890',
      address: 'Jl. Sudirman No. 123',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12190',
    },
    shippingCourier: 'JNE',
    trackingNumber: 'JNE1234567890',
    orderDate: new Date('2025-01-15T09:00:00'),
    paidAt: new Date('2025-01-15T09:05:00'),
    createdAt: new Date('2025-01-15T09:00:00'),
    updatedAt: new Date('2025-01-15T10:00:00'),
  },
  {
    id: '2',
    orderNumber: 'ORD-20250115-002',
    platform: 'tiktok',
    platformOrderId: 'TT-ORD-789012',
    customerName: 'Siti Nurhaliza',
    customerEmail: 'siti@email.com',
    customerPhone: '081234567891',
    items: [
      {
        id: 'item-2-1',
        productId: '2',
        productName: 'Kaos Polos Cotton Combed 30s',
        productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        sku: 'TSHIRT-001',
        quantity: 2,
        price: 75000,
        subtotal: 150000,
      },
    ],
    subtotal: 150000,
    shippingCost: 12000,
    discount: 15000,
    tax: 0,
    total: 147000,
    orderStatus: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'E-wallet',
    shippingAddress: {
      name: 'Siti Nurhaliza',
      phone: '081234567891',
      address: 'Jl. Malioboro No. 456',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      postalCode: '55271',
    },
    shippingCourier: 'SiCepat',
    trackingNumber: 'SC1234567890',
    orderDate: new Date('2025-01-14T14:30:00'),
    paidAt: new Date('2025-01-14T14:35:00'),
    shippedAt: new Date('2025-01-15T08:00:00'),
    createdAt: new Date('2025-01-14T14:30:00'),
    updatedAt: new Date('2025-01-15T08:00:00'),
  },
  {
    id: '3',
    orderNumber: 'ORD-20250115-003',
    platform: 'tokopedia',
    platformOrderId: 'TP-ORD-345678',
    customerName: 'Ahmad Wijaya',
    customerEmail: 'ahmad@email.com',
    customerPhone: '081234567892',
    items: [
      {
        id: 'item-3-1',
        productId: '3',
        productName: 'Tas Ransel Anti Air Laptop 15.6',
        productImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        sku: 'BAG-001',
        quantity: 1,
        price: 320000,
        subtotal: 320000,
      },
    ],
    subtotal: 320000,
    shippingCost: 18000,
    discount: 0,
    tax: 0,
    total: 338000,
    orderStatus: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'COD',
    shippingAddress: {
      name: 'Ahmad Wijaya',
      phone: '081234567892',
      address: 'Jl. Braga No. 789',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40111',
    },
    shippingCourier: 'J&T',
    trackingNumber: 'JT1234567890',
    orderDate: new Date('2025-01-13T11:15:00'),
    paidAt: new Date('2025-01-13T11:20:00'),
    shippedAt: new Date('2025-01-13T16:00:00'),
    deliveredAt: new Date('2025-01-14T09:30:00'),
    createdAt: new Date('2025-01-13T11:15:00'),
    updatedAt: new Date('2025-01-14T09:30:00'),
  },
  {
    id: '4',
    orderNumber: 'ORD-20250115-004',
    platform: 'shopee',
    platformOrderId: 'SP-ORD-567890',
    customerName: 'Maya Putri',
    customerEmail: 'maya@email.com',
    customerPhone: '081234567893',
    items: [
      {
        id: 'item-4-1',
        productId: '6',
        productName: 'Jaket Hoodie Premium Cotton',
        productImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
        sku: 'JACKET-001',
        quantity: 1,
        price: 280000,
        subtotal: 280000,
      },
    ],
    subtotal: 280000,
    shippingCost: 15000,
    discount: 28000,
    tax: 0,
    total: 267000,
    orderStatus: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'Transfer Bank',
    shippingAddress: {
      name: 'Maya Putri',
      phone: '081234567893',
      address: 'Jl. Pahlawan No. 321',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60274',
    },
    shippingCourier: 'JNE',
    orderDate: new Date('2025-01-15T16:45:00'),
    createdAt: new Date('2025-01-15T16:45:00'),
    updatedAt: new Date('2025-01-15T16:45:00'),
  },
]

// Add more orders to reach 30-100 orders
const orderStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const
const platforms = ['shopee', 'tiktok', 'tokopedia'] as const
const paymentMethods = ['Transfer Bank', 'E-wallet', 'COD', 'Credit Card']

const customerNames = [
  'Andi Pratama', 'Rina Sari', 'Doni Kurniawan', 'Indah Pertiwi', 'Fajar Nugroho',
  'Lestari Wati', 'Hadi Santoso', 'Dewi Maharani', 'Bagas Setiawan', 'Ratna Sari',
  'Rio Permana', 'Sari Indrawati', 'Agus Setiawan', 'Mila Sari', 'Diki Firmansyah',
  'Nina Wulandari', 'Yoga Pratama', 'Sinta Dewi', 'Deden Sopian', 'Lia Marlina'
]

for (let i = 5; i <= 50; i++) {
  const platform = platforms[Math.floor(Math.random() * platforms.length)]
  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)]
  const orderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
  const items = generateOrderItems([])
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const shippingCost = Math.floor(Math.random() * 30000) + 10000
  const discount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0
  const total = subtotal + shippingCost - discount
  
  const orderDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
  const paidAt = ['pending', 'unpaid'].includes(orderStatus) ? undefined : 
                new Date(orderDate.getTime() + Math.random() * 60 * 60 * 1000)
  const shippedAt = ['delivered', 'shipped', 'processing'].includes(orderStatus) ? 
                   new Date((paidAt || orderDate).getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined
  const deliveredAt = orderStatus === 'delivered' ? 
                     new Date((shippedAt || paidAt || orderDate).getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined

  sampleOrders.push({
    id: i.toString(),
    orderNumber: `ORD-20250115-${i.toString().padStart(3, '0')}`,
    platform,
    platformOrderId: `${platform.toUpperCase()}-ORD-${Math.floor(Math.random() * 999999)}`,
    customerName,
    customerEmail: `${customerName.toLowerCase().replace(' ', '')}@email.com`,
    customerPhone: `081${Math.floor(Math.random() * 900000000) + 100000000}`,
    items,
    subtotal,
    shippingCost,
    discount,
    tax: 0,
    total,
    orderStatus,
    paymentStatus: orderStatus === 'pending' ? 'unpaid' : 'paid',
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    shippingAddress: {
      name: customerName,
      phone: `081${Math.floor(Math.random() * 900000000) + 100000000}`,
      address: `Jl. ${['Sudirman', 'Thamrin', 'Gatot Subroto', 'Diponegoro', 'Ahmad Yani'][Math.floor(Math.random() * 5)]} No. ${Math.floor(Math.random() * 999) + 1}`,
      city: ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan'][Math.floor(Math.random() * 6)],
      province: ['DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'DI Yogyakarta', 'Jawa Tengah', 'Sumatera Utara'][Math.floor(Math.random() * 6)],
      postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
    },
    shippingCourier: ['JNE', 'SiCepat', 'J&T', 'Pos Indonesia'][Math.floor(Math.random() * 4)],
    trackingNumber: shippedAt ? `${['JNE', 'SC', 'JT', 'POS'][Math.floor(Math.random() * 4)]}${Math.floor(Math.random() * 9999999999)}` : undefined,
    orderDate,
    paidAt,
    shippedAt,
    deliveredAt,
    customerNotes: Math.random() > 0.8 ? 'Please handle with care' : undefined,
    internalNotes: Math.random() > 0.9 ? 'Customer VIP' : undefined,
    createdAt: orderDate,
    updatedAt: deliveredAt || shippedAt || paidAt || orderDate,
  })
}

export const mockOrders: Order[] = sampleOrders

// Mock data utilities
export const getOrderById = (id: string) => {
  return mockOrders.find(o => o.id === id)
}

export const filterOrders = (filters: {
  search?: string;
  platform?: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada';
  status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  dateFrom?: Date;
  dateTo?: Date;
}) => {
  let filtered = [...mockOrders]
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(o => 
      o.orderNumber.toLowerCase().includes(search) ||
      o.customerName.toLowerCase().includes(search) ||
      o.platformOrderId.toLowerCase().includes(search)
    )
  }
  
  if (filters.platform) {
    filtered = filtered.filter(o => o.platform === filters.platform)
  }
  
  if (filters.status) {
    filtered = filtered.filter(o => o.orderStatus === filters.status)
  }
  
  if (filters.dateFrom) {
    filtered = filtered.filter(o => o.orderDate >= filters.dateFrom!)
  }
  
  if (filters.dateTo) {
    filtered = filtered.filter(o => o.orderDate <= filters.dateTo!)
  }
  
  return filtered
}

export const updateOrderStatus = (id: string, status: Order['orderStatus']) => {
  const order = mockOrders.find(o => o.id === id)
  if (order) {
    order.orderStatus = status
    order.updatedAt = new Date()
    
    // Set appropriate timestamps
    if (status === 'paid' && !order.paidAt) {
      order.paidAt = new Date()
    } else if (status === 'shipped' && !order.shippedAt) {
      order.shippedAt = new Date()
    } else if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date()
    }
    
    return order
  }
  return null
}