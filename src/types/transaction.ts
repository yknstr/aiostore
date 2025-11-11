import { PlatformType } from './product'

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  // Income
  | 'sales'
  | 'refund_received'
  | 'other_income'
  // Expense
  | 'product_cost'
  | 'shipping_cost'
  | 'packaging'
  | 'marketing'
  | 'platform_fee'
  | 'other_expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  
  description: string;
  amount: number;
  
  platform?: PlatformType;
  relatedOrderId?: string;
  
  paymentMethod: string;     // "Cash", "Bank Transfer", "E-wallet"
  
  receiptUrl?: string;       // Uploaded receipt image
  notes?: string;
  
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}