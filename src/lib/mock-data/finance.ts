import { Transaction, TransactionType, TransactionCategory } from '@/types/transaction'
import { PlatformType } from '@/types/product'

export const mockTransactions: Transaction[] = [
  // Income transactions
  {
    id: 'txn_1',
    type: 'income',
    category: 'sales',
    description: 'Sepatu Sneakers Nike Air Max 270 - Shopee',
    amount: 850000,
    platform: 'shopee',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-10'),
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-11-10'),
  },
  {
    id: 'txn_2',
    type: 'income',
    category: 'sales',
    description: 'T-Shirt Baseball Cap NY Original - TikTok',
    amount: 120000,
    platform: 'tiktok',
    paymentMethod: 'E-wallet',
    date: new Date('2025-11-10'),
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-11-10'),
  },
  {
    id: 'txn_3',
    type: 'income',
    category: 'sales',
    description: 'Kacamata Rayban Wayfarer - Tokopedia',
    amount: 1500000,
    platform: 'tokopedia',
    paymentMethod: 'COD',
    date: new Date('2025-11-09'),
    createdAt: new Date('2025-11-09'),
    updatedAt: new Date('2025-11-09'),
  },
  {
    id: 'txn_4',
    type: 'income',
    category: 'sales',
    description: 'Tas Backpack Herschel - Shopee',
    amount: 1250000,
    platform: 'shopee',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-09'),
    createdAt: new Date('2025-11-09'),
    updatedAt: new Date('2025-11-09'),
  },
  {
    id: 'txn_5',
    type: 'income',
    category: 'sales',
    description: 'Hoodie Champion Navy - TikTok',
    amount: 750000,
    platform: 'tiktok',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-08'),
    createdAt: new Date('2025-11-08'),
    updatedAt: new Date('2025-11-08'),
  },
  {
    id: 'txn_6',
    type: 'income',
    category: 'sales',
    description: 'Sneakers Adidas Ultraboost - Lazada',
    amount: 1600000,
    platform: 'lazada',
    paymentMethod: 'E-wallet',
    date: new Date('2025-11-08'),
    createdAt: new Date('2025-11-08'),
    updatedAt: new Date('2025-11-08'),
  },
  {
    id: 'txn_7',
    type: 'income',
    category: 'sales',
    description: 'Jacket Denim Levi\'s 501 - Shopee',
    amount: 1200000,
    platform: 'shopee',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-07'),
    createdAt: new Date('2025-11-07'),
    updatedAt: new Date('2025-11-07'),
  },
  {
    id: 'txn_8',
    type: 'income',
    category: 'refund_received',
    description: 'Refund Kacamata Rayban - Tokopedia',
    amount: -50000,
    platform: 'tokopedia',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-07'),
    notes: 'Product return - customer requested size exchange',
    createdAt: new Date('2025-11-07'),
    updatedAt: new Date('2025-11-07'),
  },

  // Expense transactions
  {
    id: 'txn_9',
    type: 'expense',
    category: 'product_cost',
    description: 'Purchase Sepatu Nike Air Max 270',
    amount: 650000,
    platform: 'shopee',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-10'),
    notes: 'Inventory purchase from supplier',
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-11-10'),
  },
  {
    id: 'txn_10',
    type: 'expense',
    category: 'shipping_cost',
    description: 'Shipping costs - JNE',
    amount: 35000,
    platform: 'shopee',
    paymentMethod: 'Cash',
    date: new Date('2025-11-10'),
    notes: 'Multiple orders shipping',
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-11-10'),
  },
  {
    id: 'txn_11',
    type: 'expense',
    category: 'platform_fee',
    description: 'Shopee Platform Fee',
    amount: 50000,
    platform: 'shopee',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-09'),
    notes: 'Monthly platform subscription',
    createdAt: new Date('2025-11-09'),
    updatedAt: new Date('2025-11-09'),
  },
  {
    id: 'txn_12',
    type: 'expense',
    category: 'marketing',
    description: 'Facebook Ads Campaign',
    amount: 200000,
    platform: 'tiktok',
    paymentMethod: 'Credit Card',
    date: new Date('2025-11-09'),
    notes: 'Product promotion ads',
    createdAt: new Date('2025-11-09'),
    updatedAt: new Date('2025-11-09'),
  },
  {
    id: 'txn_13',
    type: 'expense',
    category: 'product_cost',
    description: 'Purchase T-Shirt Baseball Cap',
    amount: 80000,
    platform: 'tiktok',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-08'),
    notes: 'Bulk purchase from supplier',
    createdAt: new Date('2025-11-08'),
    updatedAt: new Date('2025-11-08'),
  },
  {
    id: 'txn_14',
    type: 'expense',
    category: 'packaging',
    description: 'Packaging Materials',
    amount: 45000,
    platform: 'shopee',
    paymentMethod: 'Cash',
    date: new Date('2025-11-08'),
    notes: 'Bubble wrap, boxes, tape',
    createdAt: new Date('2025-11-08'),
    updatedAt: new Date('2025-11-08'),
  },
  {
    id: 'txn_15',
    type: 'expense',
    category: 'product_cost',
    description: 'Purchase Kacamata Rayban',
    amount: 1200000,
    platform: 'tokopedia',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-07'),
    notes: 'Original brand from authorized dealer',
    createdAt: new Date('2025-11-07'),
    updatedAt: new Date('2025-11-07'),
  },
  {
    id: 'txn_16',
    type: 'expense',
    category: 'shipping_cost',
    description: 'Shipping costs - SiCepat',
    amount: 28000,
    platform: 'tokopedia',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-07'),
    notes: 'Express shipping for kacamata',
    createdAt: new Date('2025-11-07'),
    updatedAt: new Date('2025-11-07'),
  },
  {
    id: 'txn_17',
    type: 'expense',
    category: 'other_expense',
    description: 'Office Supplies',
    amount: 150000,
    platform: 'shopee',
    paymentMethod: 'Cash',
    date: new Date('2025-11-06'),
    notes: 'Printer, paper, pens for business',
    createdAt: new Date('2025-11-06'),
    updatedAt: new Date('2025-11-06'),
  },
  {
    id: 'txn_18',
    type: 'expense',
    category: 'product_cost',
    description: 'Purchase Tas Backpack Herschel',
    amount: 1000000,
    platform: 'shopee',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-06'),
    notes: 'Premium backpack for resale',
    createdAt: new Date('2025-11-06'),
    updatedAt: new Date('2025-11-06'),
  },
  {
    id: 'txn_19',
    type: 'expense',
    category: 'marketing',
    description: 'Instagram Ads',
    amount: 150000,
    platform: 'tiktok',
    paymentMethod: 'Credit Card',
    date: new Date('2025-11-05'),
    notes: 'Promotional campaign for hoodies',
    createdAt: new Date('2025-11-05'),
    updatedAt: new Date('2025-11-05'),
  },
  {
    id: 'txn_20',
    type: 'expense',
    category: 'product_cost',
    description: 'Purchase Hoodie Champion',
    amount: 600000,
    platform: 'tiktok',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-05'),
    notes: 'Original Champion hoodie',
    createdAt: new Date('2025-11-05'),
    updatedAt: new Date('2025-11-05'),
  },
  {
    id: 'txn_21',
    type: 'expense',
    category: 'shipping_cost',
    description: 'Shipping costs - GO-SEND',
    amount: 25000,
    platform: 'tiktok',
    paymentMethod: 'Cash',
    date: new Date('2025-11-04'),
    notes: 'Same day delivery',
    createdAt: new Date('2025-11-04'),
    updatedAt: new Date('2025-11-04'),
  },
  {
    id: 'txn_22',
    type: 'expense',
    category: 'platform_fee',
    description: 'TikTok Shop Commission',
    amount: 45000,
    platform: 'tiktok',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-04'),
    notes: 'Commission on sales',
    createdAt: new Date('2025-11-04'),
    updatedAt: new Date('2025-11-04'),
  },
  {
    id: 'txn_23',
    type: 'expense',
    category: 'product_cost',
    description: 'Purchase Sneakers Adidas',
    amount: 1300000,
    platform: 'lazada',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-03'),
    notes: 'Adidas Ultraboost 21 from official store',
    createdAt: new Date('2025-11-03'),
    updatedAt: new Date('2025-11-03'),
  },
  {
    id: 'txn_24',
    type: 'expense',
    category: 'packaging',
    description: 'Premium Gift Box',
    amount: 35000,
    platform: 'lazada',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-03'),
    notes: 'Luxury packaging for Adidas sneakers',
    createdAt: new Date('2025-11-03'),
    updatedAt: new Date('2025-11-03'),
  },
  {
    id: 'txn_25',
    type: 'expense',
    category: 'shipping_cost',
    description: 'International Shipping',
    amount: 75000,
    platform: 'lazada',
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-11-02'),
    notes: 'Shipping to other cities',
    createdAt: new Date('2025-11-02'),
    updatedAt: new Date('2025-11-02'),
  },
]

// Finance utility functions
export const getTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
}

export const getTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

export const getNetProfit = (transactions: Transaction[]): number => {
  return getTotalIncome(transactions) - getTotalExpenses(transactions)
}

export const getTransactionsByCategory = (transactions: Transaction[]): Record<TransactionCategory, number> => {
  const categories: Record<TransactionCategory, number> = {
    sales: 0,
    refund_received: 0,
    other_income: 0,
    product_cost: 0,
    shipping_cost: 0,
    packaging: 0,
    marketing: 0,
    platform_fee: 0,
    other_expense: 0,
  }

  transactions.forEach(transaction => {
    categories[transaction.category] += Math.abs(transaction.amount)
  })

  return categories
}

export const getTransactionsByPlatform = (transactions: Transaction[]): Record<PlatformType, number> => {
  const platforms: Record<PlatformType, number> = {
    shopee: 0,
    tiktok: 0,
    tokopedia: 0,
    lazada: 0,
  }

  transactions.forEach(transaction => {
    if (transaction.platform) {
      platforms[transaction.platform] += Math.abs(transaction.amount)
    }
  })

  return platforms
}

export const getTransactionsByDateRange = (transactions: Transaction[], startDate: Date, endDate: Date): Transaction[] => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return transactionDate >= startDate && transactionDate <= endDate
  })
}

export const getMonthlyFinancialSummary = (transactions: Transaction[], year: number, month: number) => {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  
  const monthlyTransactions = getTransactionsByDateRange(transactions, startDate, endDate)
  
  return {
    income: getTotalIncome(monthlyTransactions),
    expenses: getTotalExpenses(monthlyTransactions),
    netProfit: getNetProfit(monthlyTransactions),
    transactionCount: monthlyTransactions.length,
  }
}

export const getProfitMargin = (transactions: Transaction[]): number => {
  const totalIncome = getTotalIncome(transactions)
  const totalExpenses = getTotalExpenses(transactions)
  
  if (totalIncome === 0) return 0
  
  return ((totalIncome - totalExpenses) / totalIncome) * 100
}