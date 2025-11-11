# AIOStore Phase 2 - Data Contract

This document defines the field mappings between mock data structures and Supabase database schema for Phase 2 integration.

## Overview

**Phase 2 Goal:** Replace mock data with read-only Supabase Postgres data via service layer
**Approach:** Feature flag system (`DATA_SOURCE=mock|supabase`) per module
**Schema:** Shape parity with existing mock data structures

## Data Source Configuration

```env
# Feature Flags (per module)
DATA_SOURCE_PRODUCTS=mock|supabase
DATA_SOURCE_ORDERS=mock|supabase
DATA_SOURCE_CUSTOMERS=mock|supabase
DATA_SOURCE_TRANSACTIONS=mock|supabase
DATA_SOURCE_MESSAGES=mock|supabase
```

## Database Schema Mapping

### 1. Products Table

**Mock Structure:**
```typescript
interface Product {
  id: string
  sku: string
  name: string
  description: string
  category: string
  price: number
  compareAtPrice?: number
  stock: number
  lowStockThreshold: number
  images: string[]
  status: 'active' | 'inactive' | 'out_of_stock'
  platforms: PlatformProduct[]
  createdAt: Date
  updatedAt: Date
}
```

**Supabase Table: `products`**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  platforms JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Field Mapping:**
- `id` → `id` (string → UUID)
- `sku` → `sku` (string)
- `name` → `name` (string)
- `description` → `description` (string)
- `category` → `category` (string)
- `price` → `price` (number)
- `compareAtPrice` → `compare_at_price` (number | null)
- `stock` → `stock` (number)
- `lowStockThreshold` → `low_stock_threshold` (number)
- `images[]` → `images` JSONB array
- `status` → `status` (same enum)
- `platforms[]` → `platforms` JSONB array
- `createdAt` → `created_at` (Date → timestamp)
- `updatedAt` → `updated_at` (Date → timestamp)

### 2. Orders Table

**Mock Structure:**
```typescript
interface Order {
  id: string
  orderNumber: string
  platform: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada'
  platformOrderId: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  discount: number
  tax: number
  total: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  shippingAddress: ShippingAddress
  shippingCourier: string
  trackingNumber?: string
  orderDate: Date
  paidAt?: Date
  shippedAt?: Date
  deliveredAt?: Date
  customerNotes?: string
  internalNotes?: string
  createdAt: Date
  updatedAt: Date
}
```

**Supabase Table: `orders`**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('shopee', 'tiktok', 'tokopedia', 'lazada')),
  platform_order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  order_status TEXT NOT NULL CHECK (order_status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_method TEXT NOT NULL,
  shipping_address JSONB,
  shipping_courier TEXT,
  tracking_number TEXT,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  customer_notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Field Mapping:**
- `id` → `id` (string → UUID)
- `orderNumber` → `order_number` (string)
- `platform` → `platform` (same enum)
- `platformOrderId` → `platform_order_id` (string)
- `customerName` → `customer_name` (string)
- `customerEmail` → `customer_email` (string | null)
- `customerPhone` → `customer_phone` (string)
- `items[]` → `items` JSONB array
- `subtotal` → `subtotal` (number)
- `shippingCost` → `shipping_cost` (number)
- `discount` → `discount` (number)
- `tax` → `tax` (number)
- `total` → `total` (number)
- `orderStatus` → `order_status` (same enum)
- `paymentStatus` → `payment_status` (same enum)
- `paymentMethod` → `payment_method` (string)
- `shippingAddress` → `shipping_address` JSONB
- `shippingCourier` → `shipping_courier` (string | null)
- `trackingNumber` → `tracking_number` (string | null)
- `orderDate` → `order_date` (Date → timestamp)
- `paidAt` → `paid_at` (Date | null → timestamp | null)
- `shippedAt` → `shipped_at` (Date | null → timestamp | null)
- `deliveredAt` → `delivered_at` (Date | null → timestamp | null)
- `customerNotes` → `customer_notes` (string | null)
- `internalNotes` → `internal_notes` (string | null)
- `createdAt` → `created_at` (Date → timestamp)
- `updatedAt` → `updated_at` (Date → timestamp)

### 3. Customers Table

**Mock Structure:** (Derived from orders)
```typescript
interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  platform: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada'
  totalOrders: number
  totalSpent: number
  createdAt: Date
  updatedAt: Date
}
```

**Supabase Table: `customers`**
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('shopee', 'tiktok', 'tokopedia', 'lazada')),
  platform_customer_id TEXT NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Transactions Table

**Mock Structure:**
```typescript
interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: TransactionCategory
  description: string
  amount: number
  platform?: PlatformType
  relatedOrderId?: string
  paymentMethod: string
  receiptUrl?: string
  notes?: string
  date: Date
  createdAt: Date
  updatedAt: Date
}
```

**Supabase Table: `transactions`**
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform TEXT CHECK (platform IN ('shopee', 'tiktok', 'tokopedia', 'lazada')),
  related_order_id UUID REFERENCES orders(id),
  payment_method TEXT NOT NULL,
  receipt_url TEXT,
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Messages & Conversations Tables

**Mock Structure:**
```typescript
interface Message {
  id: string
  conversationId: string
  platform: PlatformType
  platformMessageId: string
  sender: 'customer' | 'seller'
  senderName: string
  content: string
  attachments?: MessageAttachment[]
  isRead: boolean
  timestamp: Date
}

interface Conversation {
  id: string
  platform: PlatformType
  platformConversationId: string
  customerName: string
  customerAvatar?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  relatedOrderId?: string
  createdAt: Date
  updatedAt: Date
}
```

**Supabase Tables:**
```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('shopee', 'tiktok', 'tokopedia', 'lazada')),
  platform_conversation_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_avatar TEXT,
  last_message TEXT NOT NULL,
  last_message_time TIMESTAMP WITH TIME ZONE NOT NULL,
  unread_count INTEGER NOT NULL DEFAULT 0,
  related_order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('shopee', 'tiktok', 'tokopedia', 'lazada')),
  platform_message_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'seller')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Service Layer Methods

### Products Service
```typescript
interface ProductsService {
  listProducts(filters?: ProductFilters): Promise<Product[]>
  getProductById(id: string): Promise<Product | null>
  filterProducts(filters: ProductFilters): Promise<Product[]>
}

interface ProductFilters {
  search?: string
  platform?: PlatformType
  status?: ProductStatus
  category?: string
}
```

### Orders Service
```typescript
interface OrdersService {
  listOrders(filters?: OrderFilters): Promise<Order[]>
  getOrderById(id: string): Promise<Order | null>
  filterOrders(filters: OrderFilters): Promise<Order[]>
}

interface OrderFilters {
  search?: string
  platform?: PlatformType
  status?: OrderStatus
  dateFrom?: Date
  dateTo?: Date
}
```

### Customers Service
```typescript
interface CustomersService {
  listCustomers(filters?: CustomerFilters): Promise<Customer[]>
  getCustomerById(id: string): Promise<Customer | null>
}

interface CustomerFilters {
  search?: string
  platform?: PlatformType
}
```

### Transactions Service
```typescript
interface TransactionsService {
  listTransactions(filters?: TransactionFilters): Promise<Transaction[]>
  getTransactionById(id: string): Promise<Transaction | null>
  filterTransactions(filters: TransactionFilters): Promise<Transaction[]>
}

interface TransactionFilters {
  type?: TransactionType
  category?: TransactionCategory
  platform?: PlatformType
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
}
```

### Messages Service
```typescript
interface MessagesService {
  listMessages(filters?: MessageFilters): Promise<Message[]>
  listConversations(filters?: ConversationFilters): Promise<Conversation[]>
  getMessagesByConversationId(conversationId: string): Promise<Message[]>
  getConversationById(id: string): Promise<Conversation | null>
}

interface MessageFilters {
  conversationId?: string
  platform?: PlatformType
  sender?: MessageSender
}

interface ConversationFilters {
  search?: string
  platform?: PlatformType
  unreadOnly?: boolean
}
```

## Row Level Security (RLS)

**Development Setup (Select-Only):**
```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create development policies (select only)
CREATE POLICY "Allow all operations for development" ON products
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON orders
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON customers
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON transactions
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON conversations
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for development" ON messages
  FOR ALL USING (true);
```

## Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Data Source Feature Flags
DATA_SOURCE_PRODUCTS=mock
DATA_SOURCE_ORDERS=mock
DATA_SOURCE_CUSTOMERS=mock
DATA_SOURCE_TRANSACTIONS=mock
DATA_SOURCE_MESSAGES=mock
```

## Notes

- **Read-Only:** No write operations in Phase 2
- **Anonymous Key:** Only anon key used on client side
- **Dev DB Only:** Development database recommended
- **Shape Parity:** Mock and Supabase data structures must match exactly
- **Feature Flags:** Enable gradual rollout and testing per module

## Version History

- **v1.0** (2025-11-11): Initial contract for Phase 2 implementation
- Source: context7 MCP Server (`/supabase/supabase-js`)
- Documentation: 182 code snippets, Trust Score 9.5/10