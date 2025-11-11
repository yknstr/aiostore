import { Transaction } from '@/types/transaction'

// Generate realistic transaction data
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    category: 'sales',
    description: 'Sepatu Sneakers Nike Air Max 270 - Order #ORD-20250115-001',
    amount: 850000,
    platform: 'shopee',
    relatedOrderId: '1',
    paymentMethod: 'Transfer Bank',
    date: new Date('2025-01-15T09:00:00'),
    createdAt: new Date('2025-01-15T09:00:00'),
    updatedAt: new Date('2025-01-15T09:00:00'),
  },
  {
    id: '2',
    type: 'expense',
    category: 'platform_fee',
    description: 'Platform fee - Shopee Transaction Fee',
    amount: 51000,
    platform: 'shopee',
    relatedOrderId: '1',
    paymentMethod: 'Automatic Deduction',
    notes: '5% platform fee from sales',
    date: new Date('2025-01-15T09:00:00'),
    createdAt: new Date('2025-01-15T09:00:00'),
    updatedAt: new Date('2025-01-15T09:00:00'),
  },
  {
    id: '3',
    type: 'expense',
    category: 'shipping_cost',
    description: 'JNE Shipping Cost - Order #ORD-20250115-001',
    amount: 15000,
    relatedOrderId: '1',
    paymentMethod: 'Cash',
    date: new Date('2025-01-15T10:00:00'),
    createdAt: new Date('2025-01-15T10:00:00'),
    updatedAt: new Date('2025-01-15T10:00:00'),
  },
  {
    id: '4',
    type: 'income',
    category: 'sales',
    description: 'Kaos Polos Cotton Combed 30s - Order #ORD-20250115-002',
    amount: 147000,
    platform: 'tiktok',
    relatedOrderId: '2',
    paymentMethod: 'E-wallet',
    date: new Date('2025-01-14T14:30:00'),
    createdAt: new Date('2025-01-14T14:30:00'),
    updatedAt: new Date('2025-01-14T14:30:00'),
  },
  {
    id: '5',
    type: 'expense',
    category: 'product_cost',
    description: 'Purchase inventory - Kaos Cotton Combed 30s',
    amount: 90000,
    paymentMethod: 'Bank Transfer',
    notes: '2 pieces @ 45,000',
    date: new Date('2025-01-12T08:00:00'),
    createdAt: new Date('2025-01-12T08:00:00'),
    updatedAt: new Date('2025-01-12T08:00:00'),
  },
  {
    id: '6',
    type: 'income',
    category: 'sales',
    description: 'Tas Ransel Anti Air Laptop 15.6 - Order #ORD-20250115-003',
    amount: 320000,
    platform: 'tokopedia',
    relatedOrderId: '3',
    paymentMethod: 'COD',
    date: new Date('2025-01-13T11:15:00'),
    createdAt: new Date('2025-01-13T11:15:00'),
    updatedAt: new Date('2025-01-13T11:15:00'),
  },
  {
    id: '7',
    type: 'expense',
    category: 'marketing',
    description: 'Facebook Ads Campaign',
    amount: 250000,
    paymentMethod: 'Credit Card',
    notes: 'Product promotion for 1 week',
    date: new Date('2025-01-10T00:00:00'),
    createdAt: new Date('2025-01-10T00:00:00'),
    updatedAt: new Date('2025-01-10T00:00:00'),
  },
  {
    id: '8',
    type: 'expense',
    category: 'packaging',
    description: 'Packaging materials',
    amount: 75000,
    paymentMethod: 'Cash',
    notes: 'Bubble wrap, boxes, labels for 50 orders',
    date: new Date('2025-01-08T00:00:00'),
    createdAt: new Date('2025-01-08T00:00:00'),
    updatedAt: new Date('2025-01-08T00:00:00'),
  },
]

// Add more transactions
const incomeCategories = ['sales', 'refund_received', 'other_income'] as const
const expenseCategories = ['product_cost', 'shipping_cost', 'packaging', 'marketing', 'platform_fee', 'other_expense'] as const
const platforms = ['shopee', 'tiktok', 'tokopedia'] as const
const paymentMethods = ['Cash', 'Bank Transfer', 'E-wallet', 'Credit Card', 'Automatic Deduction', 'COD']

const salesDescriptions = [
  'Online sales revenue', 'Direct sales', 'Wholesale order', 'Bulk sale',
  'Promotional sale', 'Clearance sale', 'Featured product sales'
]

const expenseDescriptions = [
  'Inventory restock', 'Shipping and logistics', 'Office supplies', 'Marketing campaign',
  'Equipment purchase', 'Software subscription', 'Utilities bill', 'Office rent',
  'Employee salary', 'Insurance payment', 'Tax payment', 'Maintenance cost'
]

// Generate more transactions for the past 30 days
for (let i = 9; i <= 100; i++) {
  const isIncome = Math.random() > 0.4 // 60% income, 40% expense
  const category = isIncome 
    ? incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
    : expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
  
  const platform = Math.random() > 0.5 ? platforms[Math.floor(Math.random() * platforms.length)] : undefined
  const amount = isIncome 
    ? Math.floor(Math.random() * 1000000) + 50000 // 50K - 1M
    : Math.floor(Math.random() * 200000) + 10000 // 10K - 200K
  
  const transactionDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
  
  sampleTransactions.push({
    id: i.toString(),
    type: isIncome ? 'income' : 'expense',
    category,
    description: isIncome 
      ? salesDescriptions[Math.floor(Math.random() * salesDescriptions.length)]
      : expenseDescriptions[Math.floor(Math.random() * expenseDescriptions.length)],
    amount,
    platform,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    notes: Math.random() > 0.7 ? 'Additional notes for this transaction' : undefined,
    date: transactionDate,
    createdAt: transactionDate,
    updatedAt: transactionDate,
  })
}

export const mockTransactions: Transaction[] = sampleTransactions

// Mock data utilities
export const getTransactionById = (id: string) => {
  return mockTransactions.find(t => t.id === id)
}

export const filterTransactions = (filters: {
  type?: 'income' | 'expense';
  category?: 'sales' | 'refund_received' | 'other_income' | 'product_cost' | 'shipping_cost' | 'packaging' | 'marketing' | 'platform_fee' | 'other_expense';
  platform?: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada';
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}) => {
  let filtered = [...mockTransactions]
  
  if (filters.type) {
    filtered = filtered.filter(t => t.type === filters.type)
  }
  
  if (filters.category) {
    filtered = filtered.filter(t => t.category === filters.category)
  }
  
  if (filters.platform) {
    filtered = filtered.filter(t => t.platform === filters.platform)
  }
  
  if (filters.dateFrom) {
    filtered = filtered.filter(t => t.date >= filters.dateFrom!)
  }
  
  if (filters.dateTo) {
    filtered = filtered.filter(t => t.date <= filters.dateTo!)
  }
  
  if (filters.minAmount) {
    filtered = filtered.filter(t => t.amount >= filters.minAmount!)
  }
  
  if (filters.maxAmount) {
    filtered = filtered.filter(t => t.amount <= filters.maxAmount!)
  }
  
  return filtered.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newTransaction: Transaction = {
    ...transaction,
    id: `${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mockTransactions.unshift(newTransaction)
  return newTransaction
}

export const updateTransaction = (id: string, updates: Partial<Transaction>) => {
  const index = mockTransactions.findIndex(t => t.id === id)
  if (index !== -1) {
    mockTransactions[index] = {
      ...mockTransactions[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockTransactions[index]
  }
  return null
}

export const deleteTransaction = (id: string) => {
  const index = mockTransactions.findIndex(t => t.id === id)
  if (index !== -1) {
    mockTransactions.splice(index, 1)
    return true
  }
  return false
}

// Summary calculations
export const getTransactionSummary = (dateFrom?: Date, dateTo?: Date) => {
  const transactions = filterTransactions({ dateFrom, dateTo })
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const netProfit = totalIncome - totalExpenses
  
  return {
    totalIncome,
    totalExpenses,
    netProfit,
    transactionCount: transactions.length,
  }
}

export const getPlatformRevenue = (dateFrom?: Date, dateTo?: Date) => {
  const transactions = filterTransactions({ 
    type: 'income', 
    dateFrom, 
    dateTo 
  })
  
  const platformRevenue: Record<string, number> = {}
  
  transactions.forEach(t => {
    const platform = t.platform || 'other'
    platformRevenue[platform] = (platformRevenue[platform] || 0) + t.amount
  })
  
  return platformRevenue
}