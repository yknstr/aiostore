'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'
import { Transaction, TransactionType, TransactionCategory } from '@/types/transaction'
import { PlatformType } from '@/types/product'

// Form validation schema
const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  platform: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void
  initialData?: Transaction | null
  isEditing?: boolean
}

const categoryOptions = {
  income: [
    { value: 'sales', label: 'Sales' },
    { value: 'refund_received', label: 'Refund Received' },
    { value: 'other_income', label: 'Other Income' },
  ],
  expense: [
    { value: 'product_cost', label: 'Product Cost' },
    { value: 'shipping_cost', label: 'Shipping Cost' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'platform_fee', label: 'Platform Fee' },
    { value: 'other_expense', label: 'Other Expense' },
  ]
}

const platformOptions = [
  { value: 'shopee', label: 'Shopee' },
  { value: 'tiktok', label: 'TikTok Shop' },
  { value: 'tokopedia', label: 'Tokopedia' },
  { value: 'lazada', label: 'Lazada' },
]

const paymentMethodOptions = [
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'E-wallet', label: 'E-wallet' },
  { value: 'COD', label: 'Cash on Delivery' },
]

export function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: AddTransactionModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      category: '',
      description: '',
      amount: 0,
      platform: '',
      paymentMethod: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  })

  const watchedType = watch('type')
  const watchedCategory = watch('category')

  // Initialize form with initial data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      setValue('type', initialData.type)
      setValue('category', initialData.category)
      setValue('description', initialData.description)
      setValue('amount', Math.abs(initialData.amount))
      setValue('platform', initialData.platform || '')
      setValue('paymentMethod', initialData.paymentMethod)
      setValue('date', new Date(initialData.date).toISOString().split('T')[0])
      setValue('notes', initialData.notes || '')
    } else {
      // Reset form for new transaction
      reset({
        type: 'expense',
        category: '',
        description: '',
        amount: 0,
        platform: '',
        paymentMethod: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      })
    }
  }, [initialData, isEditing, setValue, reset])

  // Reset category when type changes
  useEffect(() => {
    setValue('category', '')
  }, [watchedType, setValue])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setReceiptPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeReceipt = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
  }

  const onFormSubmit = (data: TransactionFormData) => {
    const transactionData = {
      ...data,
      amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
      platform: data.platform as PlatformType | undefined,
      notes: data.notes || undefined,
      date: new Date(data.date), // Convert string to Date object
      category: data.category as TransactionCategory, // Cast to proper type
    }

    onSubmit(transactionData)
    
    // Reset form and close modal
    reset()
    setReceiptFile(null)
    setReceiptPreview(null)
    onClose()
  }

  const handleClose = () => {
    reset()
    setReceiptFile(null)
    setReceiptPreview(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={watchedType}
                onValueChange={(value) => setValue('type', value as TransactionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={watchedCategory}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions[watchedType].map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Enter transaction description"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-10"
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Platform and Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={watch('platform')}
                onValueChange={(value) => setValue('platform', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={watch('paymentMethod')}
                onValueChange={(value) => setValue('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodOptions.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-600">{errors.paymentMethod.message}</p>
              )}
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('receipt')?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {receiptFile ? 'Change Receipt' : 'Upload Receipt'}
              </Button>
            </div>
            
            {receiptPreview && (
              <div className="relative">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeReceipt}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this transaction"
              rows={3}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}