'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  DollarSign,
  ShoppingCart,
  Calendar,
  ArrowUpDown,
  Edit,
  Trash2,
  Eye,
  Upload
} from 'lucide-react'
import { TransactionTable } from '@/components/finance/transaction-table'
import { IncomeChart } from '@/components/finance/income-chart'
import { SummaryCards } from '@/components/finance/summary-cards'
import { AddTransactionModal } from '@/components/finance/add-transaction-modal'
import { mockTransactions } from '@/lib/mock-data/finance'
import { Transaction, TransactionType, TransactionCategory } from '@/types/transaction'
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns'
import { id } from 'date-fns/locale'

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | TransactionCategory>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'shopee' | 'tiktok' | 'tokopedia' | 'lazada'>('all')
  const [dateRange, setDateRange] = useState<'all' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom'>('thisMonth')
  const [customDateRange, setCustomDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType)
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory)
    }

    // Platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(transaction => transaction.platform === selectedPlatform)
    }

    // Date range filter
    if (dateRange !== 'all') {
      let startDate: Date
      let endDate: Date = new Date()

      switch (dateRange) {
        case 'thisMonth':
          startDate = startOfMonth(new Date())
          endDate = endOfMonth(new Date())
          break
        case 'lastMonth':
          const lastMonth = subMonths(new Date(), 1)
          startDate = startOfMonth(lastMonth)
          endDate = endOfMonth(lastMonth)
          break
        case 'thisYear':
          startDate = new Date(new Date().getFullYear(), 0, 1)
          endDate = new Date(new Date().getFullYear(), 11, 31)
          break
        case 'custom':
          startDate = new Date(customDateRange.start)
          endDate = new Date(customDateRange.end)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter(transaction => 
        isWithinInterval(new Date(transaction.date), { start: startDate, end: endDate })
      )
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, searchQuery, selectedType, selectedCategory, selectedPlatform, dateRange, customDateRange])

  // Calculate summary metrics
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const netProfit = income - expenses

    return { income, expenses, netProfit }
  }, [filteredTransactions])

  // Handle transaction CRUD operations
  const handleAddTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `txn_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTransactions([newTransaction, ...transactions])
  }

  const handleEditTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTransaction) return
    
    const updatedTransaction: Transaction = {
      ...editingTransaction,
      ...transactionData,
      updatedAt: new Date(),
    }
    
    setTransactions(transactions.map(t => 
      t.id === editingTransaction.id ? updatedTransaction : t
    ))
    setEditingTransaction(null)
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id))
  }

  const handleExportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Category', 'Description', 'Amount', 'Platform', 'Payment Method', 'Notes'],
      ...filteredTransactions.map(transaction => [
        format(new Date(transaction.date), 'yyyy-MM-dd'),
        transaction.type,
        transaction.category,
        transaction.description,
        transaction.amount.toString(),
        transaction.platform || '',
        transaction.paymentMethod,
        transaction.notes || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case 'thisMonth': return 'This Month'
      case 'lastMonth': return 'Last Month'
      case 'thisYear': return 'This Year'
      case 'custom': return 'Custom Range'
      default: return 'All Time'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600 mt-1">
            Track income and expenses across all platforms
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleExportTransactions}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards 
        income={summary.income}
        expenses={summary.expenses}
        netProfit={summary.netProfit}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <IncomeChart 
            data={filteredTransactions} 
            dateRange={getDateRangeLabel(dateRange)}
          />
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-1"
              onClick={() => {
                // Quick add income
              }}
            >
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-xs">Add Income</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-1"
              onClick={() => {
                // Quick add expense
              }}
            >
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="text-xs">Add Expense</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-1"
              onClick={handleExportTransactions}
            >
              <Download className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Export Data</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col space-y-1"
              onClick={() => {
                // View reports
              }}
            >
              <Eye className="w-5 h-5 text-purple-600" />
              <span className="text-xs">View Reports</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="product_cost">Product Cost</SelectItem>
              <SelectItem value="shipping_cost">Shipping</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="platform_fee">Platform Fee</SelectItem>
            </SelectContent>
          </Select>

          {/* Platform Filter */}
          <Select value={selectedPlatform} onValueChange={(value: any) => setSelectedPlatform(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="shopee">Shopee</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="tokopedia">Tokopedia</SelectItem>
              <SelectItem value="lazada">Lazada</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedType('all')
              setSelectedCategory('all')
              setSelectedPlatform('all')
              setDateRange('thisMonth')
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        onEdit={setEditingTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTransaction}
      />

      <AddTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSubmit={handleEditTransaction}
        initialData={editingTransaction}
        isEditing={true}
      />
    </div>
  )
}