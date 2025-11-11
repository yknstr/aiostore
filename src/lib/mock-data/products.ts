import { Product, PlatformProduct } from '@/types/product'

// Generate realistic product data
const generatePlatformProduct = (platform: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada', isPublished: boolean = true): PlatformProduct => {
  const platformIds = {
    shopee: `SP-${Math.floor(Math.random() * 99999)}`,
    tiktok: `TT-${Math.floor(Math.random() * 99999)}`,
    tokopedia: `TP-${Math.floor(Math.random() * 99999)}`,
    lazada: `LZ-${Math.floor(Math.random() * 99999)}`,
  }

  return {
    platform,
    platformProductId: platformIds[platform],
    platformUrl: `https://${platform}.co.id/product/${platformIds[platform]}`,
    isPublished,
    lastSynced: isPublished ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
    title: isPublished ? `${platform} - Custom Title` : undefined,
    price: isPublished ? Math.floor(Math.random() * 500000) + 100000 : undefined,
  }
}

const sampleProducts: Product[] = [
  {
    id: '1',
    sku: 'SHOE-001',
    name: 'Sepatu Sneakers Nike Air Max 270',
    description: 'Sepatu sneakers original Nike Air Max 270 dengan teknologi terbaru untuk kenyamanan maksimal saat olahraga dan aktivitas sehari-hari.',
    category: 'Footwear',
    price: 850000,
    compareAtPrice: 1200000,
    stock: 25,
    lowStockThreshold: 10,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
    ],
    status: 'active',
    platforms: [
      generatePlatformProduct('shopee'),
      generatePlatformProduct('tiktok'),
      generatePlatformProduct('tokopedia', false),
    ],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    sku: 'TSHIRT-001',
    name: 'Kaos Polos Cotton Combed 30s',
    description: 'Kaos polo dengan bahan cotton combed 30s yang nyaman dan berkualitas tinggi. Cocok untuk aktivitas sehari-hari.',
    category: 'Apparel',
    price: 75000,
    compareAtPrice: 95000,
    stock: 150,
    lowStockThreshold: 20,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    ],
    status: 'active',
    platforms: [
      generatePlatformProduct('shopee'),
      generatePlatformProduct('tiktok'),
      generatePlatformProduct('tokopedia'),
    ],
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-14'),
  },
  {
    id: '3',
    sku: 'BAG-001',
    name: 'Tas Ransel Anti Air Laptop 15.6',
    description: 'Tas ransel multifungsi anti air dengan compartment khusus laptop 15.6 inch. Dilengkapi dengan USB charging port.',
    category: 'Bags',
    price: 320000,
    compareAtPrice: 450000,
    stock: 8,
    lowStockThreshold: 5,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    ],
    status: 'active',
    platforms: [
      generatePlatformProduct('shopee'),
      generatePlatformProduct('tiktok'),
    ],
    createdAt: new Date('2025-01-03'),
    updatedAt: new Date('2025-01-13'),
  },
  {
    id: '4',
    sku: 'WATCH-001',
    name: 'Smart Watch Apple Watch Series 9',
    description: 'Apple Watch Series 9 dengan fitur health monitoring, GPS, dan waterproof. Layar Retina Always-On yang cerah.',
    category: 'Electronics',
    price: 5200000,
    compareAtPrice: 5800000,
    stock: 3,
    lowStockThreshold: 2,
    images: [
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500',
    ],
    status: 'active',
    platforms: [
      generatePlatformProduct('shopee'),
      generatePlatformProduct('tokopedia'),
    ],
    createdAt: new Date('2025-01-04'),
    updatedAt: new Date('2025-01-12'),
  },
  {
    id: '5',
    sku: 'PHONE-001',
    name: 'Handphone Samsung Galaxy A54 5G',
    description: 'Smartphone Samsung Galaxy A54 5G dengan kamera 50MP, layar Super AMOLED 6.4 inch, dan baterai 5000mAh.',
    category: 'Electronics',
    price: 4800000,
    compareAtPrice: 5300000,
    stock: 0,
    lowStockThreshold: 5,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    ],
    status: 'out_of_stock',
    platforms: [
      generatePlatformProduct('shopee', false),
      generatePlatformProduct('tiktok', false),
      generatePlatformProduct('tokopedia', false),
    ],
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-11'),
  },
  {
    id: '6',
    sku: 'JACKET-001',
    name: 'Jaket Hoodie Premium Cotton',
    description: 'Jaket hoodie premium dengan bahan cotton berkualitas tinggi. Cocok untuk cuaca dingin dan aktivitas outdoor.',
    category: 'Apparel',
    price: 280000,
    compareAtPrice: 350000,
    stock: 45,
    lowStockThreshold: 10,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
    ],
    status: 'active',
    platforms: [
      generatePlatformProduct('shopee'),
      generatePlatformProduct('tiktok'),
    ],
    createdAt: new Date('2025-01-06'),
    updatedAt: new Date('2025-01-10'),
  },
]

// Add more products to reach 25-50 products
for (let i = 7; i <= 25; i++) {
  const categories = ['Footwear', 'Apparel', 'Bags', 'Electronics', 'Accessories', 'Sports', 'Books', 'Home & Garden']
  const category = categories[Math.floor(Math.random() * categories.length)]
  const basePrice = Math.floor(Math.random() * 1000000) + 50000
  
  sampleProducts.push({
    id: i.toString(),
    sku: `PROD-${i.toString().padStart(3, '0')}`,
    name: `${category} Product ${i}`,
    description: `High-quality ${category.toLowerCase()} product with excellent features and durability.`,
    category,
    price: basePrice,
    compareAtPrice: Math.floor(basePrice * 1.2),
    stock: Math.floor(Math.random() * 200),
    lowStockThreshold: Math.floor(Math.random() * 20) + 5,
    images: [
      `https://images.unsplash.com/photo-${1500000000000 + i}?w=500`,
    ],
    status: Math.random() > 0.1 ? 'active' : 'inactive',
    platforms: [
      generatePlatformProduct('shopee', Math.random() > 0.3),
      generatePlatformProduct('tiktok', Math.random() > 0.4),
      generatePlatformProduct('tokopedia', Math.random() > 0.5),
    ],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  })
}

export const mockProducts: Product[] = sampleProducts

// Mock data utilities
export const getProductById = (id: string) => {
  return mockProducts.find(p => p.id === id)
}

export const filterProducts = (filters: {
  search?: string;
  platform?: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada';
  status?: 'active' | 'inactive' | 'out_of_stock';
  category?: string;
}) => {
  let filtered = [...mockProducts]
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search)
    )
  }
  
  if (filters.platform) {
    filtered = filtered.filter(p =>
      p.platforms.some(pl => pl.platform === filters.platform && pl.isPublished)
    )
  }
  
  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status)
  }
  
  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category)
  }
  
  return filtered
}

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newProduct: Product = {
    ...product,
    id: `${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mockProducts.unshift(newProduct)
  return newProduct
}

export const updateProduct = (id: string, updates: Partial<Product>) => {
  const index = mockProducts.findIndex(p => p.id === id)
  if (index !== -1) {
    mockProducts[index] = {
      ...mockProducts[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockProducts[index]
  }
  return null
}

export const deleteProduct = (id: string) => {
  const index = mockProducts.findIndex(p => p.id === id)
  if (index !== -1) {
    mockProducts.splice(index, 1)
    return true
  }
  return false
}