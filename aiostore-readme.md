# AIOStore - Technical Specification

## 📋 Project Overview

**Project Name:** AIOStore  
**Version:** 1.0.0 (MVP)  
**Phase:** Frontend Development (Phase 1)  
**Purpose:** Multi-platform E-commerce Management System  
**Target Platforms:** Shopee, TikTok Shop, Tokopedia, Lazada (future)

---

## 🎯 Project Scope - Phase 1 (Frontend Only)

### Goals
- ✅ Build complete UI/UX for all core features
- ✅ Implement client-side routing and navigation
- ✅ Create reusable component library
- ✅ Use mock data for all features
- ✅ Ensure responsive design (mobile-first)
- ✅ Prepare for backend integration (proper data structure)

### Non-Goals (Out of Scope for Phase 1)
- ❌ Real API integration
- ❌ Database connection
- ❌ Authentication logic (just UI)
- ❌ Payment processing
- ❌ Real-time sync

---

## 🛠️ Tech Stack

### Core
```json
{
  "framework": "Next.js 14.x",
  "language": "TypeScript 5.x",
  "styling": "Tailwind CSS 3.x",
  "ui-components": "Shadcn UI",
  "state-management": "React Context API / Zustand (if needed)",
  "forms": "React Hook Form + Zod validation",
  "icons": "Lucide React",
  "charts": "Recharts",
  "date-picker": "date-fns + react-day-picker"
}
```

### Development Tools
```json
{
  "package-manager": "npm",
  "linting": "ESLint",
  "formatting": "Prettier",
  "git": "Git + GitHub"
}
```

---

## 📁 Project Structure

```
aiostore/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── README.md
├── TECH_SPEC.md
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── placeholder-product.png
│   │   └── avatars/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Homepage (redirect to dashboard)
│   │   ├── (auth)/                    # Auth routes group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   └── (dashboard)/               # Protected dashboard routes
│   │       ├── layout.tsx             # Dashboard layout (sidebar + topbar)
│   │       ├── dashboard/
│   │       │   └── page.tsx           # Dashboard home
│   │       ├── products/
│   │       │   ├── page.tsx           # Products list
│   │       │   ├── add/
│   │       │   │   └── page.tsx       # Add product (optional, can use modal)
│   │       │   └── [id]/
│   │       │       └── page.tsx       # Edit product
│   │       ├── orders/
│   │       │   ├── page.tsx           # Orders list
│   │       │   └── [id]/
│   │       │       └── page.tsx       # Order detail
│   │       ├── chat/
│   │       │   └── page.tsx           # Chat interface
│   │       ├── analytics/
│   │       │   └── page.tsx           # Analytics dashboard
│   │       ├── finance/
│   │       │   └── page.tsx           # Finance/accounting
│   │       └── settings/
│   │           └── page.tsx           # Settings
│   │
│   ├── components/
│   │   ├── ui/                        # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── breadcrumb.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── stat-card.tsx
│   │   │   ├── sales-chart.tsx
│   │   │   ├── platform-chart.tsx
│   │   │   ├── recent-orders.tsx
│   │   │   └── top-products.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── product-table.tsx
│   │   │   ├── product-filters.tsx
│   │   │   ├── product-form-modal.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── platform-badges.tsx
│   │   │   ├── bulk-actions-bar.tsx
│   │   │   └── image-uploader.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── orders-table.tsx
│   │   │   ├── order-filters.tsx
│   │   │   ├── order-detail-modal.tsx
│   │   │   ├── order-status-badge.tsx
│   │   │   └── order-timeline.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── conversation-list.tsx
│   │   │   ├── chat-window.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   ├── chat-input.tsx
│   │   │   └── customer-info-sidebar.tsx
│   │   │
│   │   ├── analytics/
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── orders-chart.tsx
│   │   │   └── metric-card.tsx
│   │   │
│   │   ├── finance/
│   │   │   ├── transaction-table.tsx
│   │   │   ├── income-chart.tsx
│   │   │   ├── add-transaction-modal.tsx
│   │   │   └── summary-cards.tsx
│   │   │
│   │   └── settings/
│   │       ├── platform-connection-card.tsx
│   │       ├── sync-settings.tsx
│   │       └── notification-settings.tsx
│   │
│   ├── lib/
│   │   ├── utils.ts                   # Utility functions (cn, formatters, etc)
│   │   ├── constants.ts               # App constants
│   │   └── mock-data/
│   │       ├── products.ts
│   │       ├── orders.ts
│   │       ├── messages.ts
│   │       ├── transactions.ts
│   │       └── analytics.ts
│   │
│   ├── types/
│   │   ├── index.ts                   # Main types export
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── message.ts
│   │   ├── transaction.ts
│   │   └── platform.ts
│   │
│   └── hooks/
│       ├── use-toast.ts
│       ├── use-local-storage.ts
│       └── use-media-query.ts
│
└── docs/
    ├── COMPONENTS.md                  # Component documentation
    ├── DESIGN_SYSTEM.md               # Design tokens & guidelines
    └── AI_PROMPTS.md                  # Collection of useful prompts
```

---

## 🎨 Design System

### Colors

```typescript
// tailwind.config.ts
const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',  // Main primary
    600: '#0284c7',
    700: '#0369a1',
  },
  success: {
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  danger: {
    500: '#ef4444',
    600: '#dc2626',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    500: '#6b7280',
    700: '#374151',
    900: '#111827',
  }
}
```

### Typography

```typescript
const fontSizes = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
}

const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

### Spacing

```typescript
const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
}
```

### Border Radius

```typescript
const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
}
```

---

## 📊 Data Models (TypeScript Types)

### Product

```typescript
// src/types/product.ts

export type PlatformType = 'shopee' | 'tiktok' | 'tokopedia' | 'lazada';

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export interface PlatformProduct {
  platform: PlatformType;
  platformProductId: string;
  platformUrl: string;
  isPublished: boolean;
  lastSynced: Date | null;
  title?: string;              // Override title
  price?: number;              // Override price
  description?: string;        // Additional description
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;      // Original price (for discount display)
  stock: number;
  lowStockThreshold: number;    // Alert when stock below this
  images: string[];             // Array of image URLs
  status: ProductStatus;
  platforms: PlatformProduct[]; // Platform mappings
  createdAt: Date;
  updatedAt: Date;
}
```

### Order

```typescript
// src/types/order.ts

export type OrderStatus = 
  | 'pending'           // Menunggu pembayaran
  | 'paid'              // Sudah dibayar
  | 'processing'        // Sedang diproses/dikemas
  | 'shipped'           // Sudah dikirim
  | 'delivered'         // Sudah diterima
  | 'cancelled'         // Dibatalkan
  | 'refunded';         // Refund

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  price: number;           // Price at time of order
  subtotal: number;        // quantity * price
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface Order {
  id: string;
  orderNumber: string;        // e.g., "ORD-20250115-001"
  platform: PlatformType;
  platformOrderId: string;    // Original order ID from platform
  
  // Customer
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  
  // Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  
  // Status
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;      // e.g., "COD", "Transfer Bank", "E-wallet"
  
  // Shipping
  shippingAddress: ShippingAddress;
  shippingCourier: string;    // e.g., "JNE", "SiCepat"
  trackingNumber?: string;
  
  // Timestamps
  orderDate: Date;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  // Notes
  customerNotes?: string;
  internalNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Message/Chat

```typescript
// src/types/message.ts

export type MessageSender = 'customer' | 'seller';

export interface MessageAttachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  platform: PlatformType;
  platformMessageId: string;
  
  sender: MessageSender;
  senderName: string;
  
  content: string;
  attachments?: MessageAttachment[];
  
  isRead: boolean;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  platform: PlatformType;
  platformConversationId: string;
  
  customerName: string;
  customerAvatar?: string;
  
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  
  // Optional: link to order
  relatedOrderId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Transaction (Finance)

```typescript
// src/types/transaction.ts

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
```

### Analytics

```typescript
// src/types/analytics.ts

export interface DailySales {
  date: string;              // "2025-01-15"
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface PlatformStats {
  platform: PlatformType;
  revenue: number;
  orders: number;
  products: number;
  conversionRate: number;    // percentage
}

export interface TopProduct {
  productId: string;
  productName: string;
  productImage: string;
  salesCount: number;
  revenue: number;
}
```

---

## 🖼️ Page Specifications

### 1. Login Page (`/login`)

**Purpose:** User authentication interface (UI only)

**Components:**
- Logo
- Login form (email + password)
- "Remember me" checkbox
- "Forgot password?" link
- "Login" button
- "Don't have account? Register" link

**Mock Behavior:**
- Any email/password → redirect to `/dashboard`
- Store mock user in localStorage
- Show loading state on submit

**Acceptance Criteria:**
- ✅ Form validation (required fields, valid email)
- ✅ Show error state (e.g., "Invalid credentials" - mock)
- ✅ Responsive design
- ✅ Password visibility toggle

---

### 2. Dashboard Home (`/dashboard`)

**Purpose:** Overview of key metrics and recent activity

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Summary Cards (4 cards in row)                 │
│  - Total Products                                │
│  - Active Orders                                 │
│  - Revenue (This Month)                          │
│  - Low Stock Alerts                              │
└─────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────┐
│  Sales Chart             │  Platform Performance│
│  (Line chart)            │  (Bar chart)         │
│  7/30/90 days toggle     │  Shopee/TikTok/Tokped│
└──────────────────────────┴──────────────────────┘

┌──────────────────────────┬──────────────────────┐
│  Recent Orders           │  Top Products        │
│  (Table, latest 5)       │  (List, top 5)       │
└──────────────────────────┴──────────────────────┘
```

**Components:**
- `StatCard` (reusable)
- `SalesChart` (Recharts LineChart)
- `PlatformChart` (Recharts BarChart)
- `RecentOrdersTable`
- `TopProductsList`

**Mock Data:**
- Use `src/lib/mock-data/analytics.ts`
- Randomize values on each load (optional)

**Acceptance Criteria:**
- ✅ All cards display correct data
- ✅ Charts are interactive (tooltips, legends)
- ✅ Toggle period updates chart (mock)
- ✅ Responsive: stack on mobile
- ✅ Loading skeleton while "fetching" data

---

### 3. Products Page (`/products`)

**Purpose:** Manage all products across platforms

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Header                                          │
│  [+ Add Product] [Import CSV] [Sync ▼]          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Filters                                         │
│  [Search...] [Platform ▼] [Status ▼] [Category ▼]│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Bulk Actions Bar (when items selected)         │
│  "3 items selected" [Publish to] [Delete]       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Products Table                                  │
│  ☐ | Image | Name | SKU | Price | Stock |       │
│     Platforms | Status | Actions                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Pagination                                      │
│  Showing 1-10 of 234 | [10 ▼] per page          │
│  [< Previous] [1] [2] [3] ... [24] [Next >]     │
└─────────────────────────────────────────────────┘
```

**Features:**

1. **Search & Filter**
   - Search by: name, SKU
   - Filter by: platform, status, category
   - "Reset filters" button

2. **Product Table**
   - Columns:
     - Checkbox (for bulk select)
     - Image (thumbnail)
     - Name
     - SKU
     - Price (show range if different per platform)
     - Stock (color: red if low)
     - Platforms (badges: ✓ Shopee, ✓ TikTok, ✗ Tokopedia)
     - Status (chip: Active/Inactive)
     - Actions (Edit, Delete, Duplicate icons)
   
3. **Bulk Actions**
   - Show when 1+ items selected
   - Actions:
     - Publish to [Shopee] [TikTok] [Tokopedia] checkboxes
     - Delete (with confirmation)
     - Export selected

4. **Add/Edit Product Modal**
   - Tabs:
     - **Basic Info**: Name, SKU, Category, Price, Stock, Description, Images
     - **Platform Settings**: Per-platform overrides (title, price, description)
     - **Preview**: Show how product akan tampil di each platform

**Mock Behavior:**
- Add product → add to mock data array → close modal → show toast
- Edit → update mock data → toast
- Delete → remove from array (with confirmation) → toast
- Bulk actions → update multiple → toast with count
- Search/filter → filter mock data array
- Pagination → slice mock data array

**Acceptance Criteria:**
- ✅ Table sortable (click column headers)
- ✅ Filters work correctly
- ✅ Bulk select: "Select all" checkbox
- ✅ Add product form validation
- ✅ Image upload preview (no actual upload, just preview)
- ✅ Platform-specific title auto-generation (show in preview)
- ✅ Responsive: table scrollable on mobile
- ✅ Loading states on actions
- ✅ Success/error toasts

---

### 4. Orders Page (`/orders`)

**Purpose:** View and manage orders from all platforms

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Header                                          │
│  [Date Range Picker] [Export CSV]               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Filters                                         │
│  [Search...] [Platform ▼] [Status ▼] [Date ▼]  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Orders Table                                    │
│  Order ID | Date | Customer | Products |        │
│  Platform | Total | Payment | Status | Actions  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Pagination                                      │
└─────────────────────────────────────────────────┘
```

**Features:**

1. **Filters**
   - Search: order ID, customer name
   - Platform: All/Shopee/TikTok/Tokopedia
   - Status: All/Pending/Processing/Shipped/Delivered/Cancelled
   - Date: Today/This Week/This Month/Custom Range

2. **Orders Table**
   - Columns:
     - Order Number (clickable → detail)
     - Date & Time
     - Customer Name
     - Products (first product + count badge)
     - Platform (badge with icon)
     - Total Amount
     - Payment Status (Paid/Unpaid chip)
     - Order Status (dropdown for quick update)
     - Actions (👁️ View, 🖨️ Print, ✏️ Edit)

3. **Order Detail Modal**
   - Order summary
   - Customer info & shipping address (in card)
   - Products table (name, qty, price, subtotal)
   - Timeline: 
     ```
     ✓ Order Placed - Jan 15, 10:00
     ✓ Payment Confirmed - Jan 15, 10:05
     ✓ Processing - Jan 15, 11:00
     → Shipped - (pending)
       Delivered - (pending)
     ```
   - Actions:
     - Update Status (dropdown)
     - Print Invoice
     - Print Shipping Label
     - Add Internal Note
     - Cancel Order (if not shipped)

**Mock Behavior:**
- Click order → open detail modal
- Update status → update mock data → close modal → toast
- Print → open print dialog (browser native)
- Filter/search → filter mock array

**Acceptance Criteria:**
- ✅ Table sortable by date, total
- ✅ Filters work correctly
- ✅ Status badges color-coded
- ✅ Detail modal shows complete info
- ✅ Timeline visual with icons
- ✅ Print button works (print-friendly CSS)
- ✅ Responsive: horizontal scroll on mobile
- ✅ Loading states

---

### 5. Chat Page (`/chat`)

**Purpose:** Unified messaging interface for all platforms

**Layout (3-column):**

```
┌──────────┬────────────────┬──────────┐
│ Conv.    │  Chat Window   │ Customer │
│ List     │                │   Info   │
│          │                │          │
│ [Search] │  [Header]      │ [Avatar] │
│          │                │ [Name]   │
│ Conv 1   │  Messages area │ [Phone]  │
│ Conv 2   │                │          │
│ Conv 3   │                │ Orders:  │
│ ...      │  [Input box]   │ - Order1 │
│          │  [Send]        │ - Order2 │
└──────────┴────────────────┴──────────┘
```

**Components:**

1. **Conversation List (Left Sidebar)**
   - Search conversations
   - Filter tabs: All / Shopee / TikTok / Tokopedia
   - List item:
     - Customer avatar
     - Customer name
     - Platform badge (small icon)
     - Last message preview (truncated)
     - Timestamp (relative: "2m ago", "1h ago")
     - Unread badge (count)
   - Active conversation highlighted

2. **Chat Window (Center)**
   - Header:
     - Customer name
     - Platform badge
     - "View Order" link (if related)
     - Actions: Archive, Mark spam
   - Messages area:
     - Scrollable (scroll to bottom on load)
     - Message bubbles:
       - Sent (right, blue)
       - Received (left, gray)
       - Timestamp below
       - Read status (✓✓)
       - Image attachments (show thumbnail)
   - Input box:
     - Text input (multiline)
     - Emoji picker button
     - Attach image button
     - Quick replies dropdown (templates)
     - Send button

3. **Customer Info (Right Sidebar)**
   - Avatar & name
   - Contact info (phone, email)
   - Platform accounts (badges)
   - Order history with this customer (mini list)
   - Total spent
   - Member since

**Mock Behavior:**
- Click conversation → load messages → scroll to bottom
- Type message → preview in input
- Send → add to messages array → clear input → scroll to bottom
- Emoji picker → insert emoji
- Quick reply → insert template text
- Mark as read → update unread count
- Real-time simulation: auto-add new message every 30s (optional)

**Acceptance Criteria:**
- ✅ Conversation list scrollable
- ✅ Unread count updates
- ✅ Messages render correctly (sent/received styles)
- ✅ Auto-scroll to bottom on new message
- ✅ Image attachments show thumbnail
- ✅ Input multiline (shift+enter for new line)
- ✅ Quick replies work
- ✅ Responsive: on mobile, show only list OR window (toggle)
- ✅ Search conversations works
- ✅ Filter by platform works

---

### 6. Analytics Page (`/analytics`)

**Purpose:** Business insights and reports

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Period Selector                                 │
│  [7 Days] [30 Days] [90 Days] [Custom Range]    │
└─────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────┐
│  Revenue Chart           │  Orders Chart        │
│  (Area/Line chart)       │  (Bar chart)         │
└──────────────────────────┴──────────────────────┘

┌──────────────────────────┬──────────────────────┐
│  Top Products (Table)    │  Platform Comparison │
│  Name | Sales | Revenue  │  (Pie/Donut chart)   │
└──────────────────────────┴──────────────────────┘

┌─────────────────────────────────────────────────┐
│  Metrics Cards                                   │
│  - Avg Order Value                               │
│  - Conversion Rate                               │
│  - Customer Retention                            │
│  - Revenue per Customer                          │
└─────────────────────────────────────────────────┘
```

**Features:**
- Period selector (updates all charts)
- Revenue trend chart (daily breakdown)
- Orders count chart
- Top products table (sortable)
- Platform comparison (revenue distribution)
- Key metrics cards

**Mock Data:**
- Generate realistic data based on selected period
- Use `src/lib/mock-data/analytics.ts`

**Acceptance Criteria:**
- ✅ Period selector updates all charts
- ✅ Charts interactive (tooltips, zoom optional)
- ✅ Table sortable
- ✅ Export data button (download CSV - mock)
- ✅ Responsive: stack charts on mobile
- ✅ Loading skeleton

---

### 7. Finance Page (`/finance`)

**Purpose:** Track income and expenses

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Summary Cards                                   │
│  [Revenue] [Expenses] [Net Profit]              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Income Chart (Line chart with income/expense)  │
│  Toggle: [Revenue] [Profit] [Orders]            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Actions                                         │
│  [+ Add Transaction] [Export Excel]             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Filters                                         │
│  [Type: All/Income/Expense] [Category ▼]        │
│  [Platform ▼] [Date Range]                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Transactions Table                              │
│  Date | Type | Description | Category |         │
│  Platform | Amount | Payment | Actions          │
└─────────────────────────────────────────────────┘
```

**Features:**

1. **Summary Cards**
   - Total Revenue (green, + prefix)
   - Total Expenses (red, - prefix)
   - Net Profit (green/red based on value)
   - Each with mini sparkline chart

2. **Income Chart**
   - Dual-axis: Income (green line) vs Expense (red line)
   - Toggle metrics
   - Date range selector

3. **Add Transaction Modal**
   - Type: Income / Expense (radio buttons)
   - Date (date picker)
   - Category (select, filtered by type)
   - Description (input)
   - Amount (number input with Rp prefix)
   - Platform (select, optional)
   - Payment Method (select)
   - Attach Receipt (file upload)
   - Notes (textarea)

4. **Transactions Table**
   - Color-coded amounts (green for income, red for expense)
   - Sortable by date, amount
   - Filter by type, category, platform
   - Actions: Edit, Delete

**Mock Behavior:**
- Add transaction → add to array → close modal → update summary cards → toast
- Edit → update → toast
- Delete → confirm → remove → toast
- Filter → filter array
- Export → download CSV (mock data)

**Acceptance Criteria:**
- ✅ Amount color-coded (income/expense)
- ✅ Summary cards calculate from transactions
- ✅ Chart updates based on filters
- ✅ Form validation (required fields, amount > 0)
- ✅ Date range filter works
- ✅ Responsive table
- ✅ Loading states

---

### 8. Settings Page (`/settings`)

**Purpose:** App configuration and platform connections

**Layout (Tabbed or Sections):**

```
┌─────────────────────────────────────────────────┐
│  Tabs/Sections Navigation                       │
│  [Platforms] [Sync] [Templates] [Notifications] │
│  [Account]                                       │
└─────────────────────────────────────────────────┘

Section 1: Platform Connections
┌───────────────┬───────────────┬───────────────┐
│  Shopee       │  TikTok Shop  │  Tokopedia    │
│  [Logo]       │  [Logo]       │  [Logo]       │
│  ✓ Connected  │  Not Connected│  ✓ Connected  │
│  Shop: XXX    │               │  Shop: YYY    │
│  [Disconnect] │  [Connect]    │  [Disconnect] │
│  [Sync Now]   │               │  [Sync Now]   │
└───────────────┴───────────────┴───────────────┘

Section 2: Sync Settings
┌─────────────────────────────────────────────────┐
│  Auto-sync: [ON / OFF] toggle                   │
│  Frequency: [Realtime ▼]                        │
│  Sync Options:                                   │
│    ☑ Products                                    │
│    ☑ Inventory                                   │
│    ☑ Orders                                      │
│    ☑ Messages                                    │
│  [Save Preferences]                              │
└─────────────────────────────────────────────────┘

Section 3: Product Templates
┌─────────────────────────────────────────────────┐
│  Platform-Specific Title Templates               │
│  Shopee: [Input with variables: {title}, {sku}] │
│  TikTok: [Input]                                 │
│  Tokopedia: [Input]                              │
│                                                   │
│  Description Templates                           │
│  [Textarea for each platform]                    │
│  [Save Templates]                                │
└─────────────────────────────────────────────────┘

Section 4: Notifications
┌─────────────────────────────────────────────────┐
│  Email Notifications: [ON / OFF]                │
│  Events:                                         │
│    ☑ New order                                   │
│    ☑ Low stock alert                             │
│    ☑ Sync errors                                 │
│    ☑ New message                                 │
│  [Save]                                          │
└─────────────────────────────────────────────────┘

Section 5: Account Settings
┌─────────────────────────────────────────────────┐
│  Profile                                         │
│    Name: [Input]                                 │
│    Email: [Input]                                │
│    Phone: [Input]                                │
│                                                   │
│  Change Password                                 │
│    Current: [Password input]                     │
│    New: [Password input]                         │
│    Confirm: [Password input]                     │
│  [Update]                                        │
└─────────────────────────────────────────────────┘
```

**Mock Behavior:**
- Connect platform → show "Connecting..." → success toast → update status
- Disconnect → confirm → update status → toast
- Sync now → loading spinner → toast "Synced 45 products"
- Toggle switches → save to localStorage
- Save settings → toast
- Update profile → toast

**Acceptance Criteria:**
- ✅ Platform connection cards show status
- ✅ Toggles work (save state to localStorage)
- ✅ Template variables explained (help text)
- ✅ Form validation (email, password strength)
- ✅ Confirmation on disconnect
- ✅ Success/error feedback
- ✅ Responsive layout

---

## 🧩 Reusable Components Specifications

### `<StatCard>`

**Props:**
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;        // e.g., 12.5
    isPositive: boolean;  // green if true, red if false
  };
  className?: string;
}
```

**Usage:**
```tsx
<StatCard 
  title="Total Products"
  value={1234}
  icon={<Package className="w-6 h-6" />}
  trend={{ value: 12, isPositive: true }}
/>
```

---

### `<DataTable>`

**Props:**
```typescript
interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
}
```

**Features:**
- Sortable columns (click header)
- Row selection (checkboxes)
- Loading skeleton
- Empty state
- Responsive (horizontal scroll on mobile)

---

### `<PlatformBadge>`

**Props:**
```typescript
interface PlatformBadgeProps {
  platform: PlatformType;
  isPublished?: boolean;  // show checkmark if true
  variant?: 'default' | 'minimal';
}
```

**Appearance:**
```tsx
// Default
<PlatformBadge platform="shopee" isPublished={true} />
// Output: [Shopee ✓] (with Shopee orange color)

// Minimal
<PlatformBadge platform="tiktok" variant="minimal" />
// Output: [TT] (icon only)
```

---

### `<StatusBadge>`

**Props:**
```typescript
interface StatusBadgeProps {
  status: OrderStatus | ProductStatus;
  size?: 'sm' | 'md' | 'lg';
}
```

**Color Mapping:**
```typescript
const statusColors = {
  // Order statuses
  pending: 'yellow',
  paid: 'blue',
  processing: 'purple',
  shipped: 'indigo',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'orange',
  
  // Product statuses
  active: 'green',
  inactive: 'gray',
  out_of_stock: 'red',
}
```

---

### `<ImageUploader>`

**Props:**
```typescript
interface ImageUploaderProps {
  value: string[];           // Array of image URLs
  onChange: (images: string[]) => void;
  maxImages?: number;        // Default: 5
  maxSizeMB?: number;        // Default: 2MB
}
```

**Features:**
- Drag & drop
- Click to browse
- Multiple images
- Preview thumbnails
- Remove image button
- Reorder images (drag thumbnails)
- Show file size
- Validation (size, type)

**Mock Behavior:**
- Upload → create object URL → add to array
- Remove → remove from array
- No actual upload to server in Phase 1

---

### `<EmptyState>`

**Props:**
```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Usage:**
```tsx
<EmptyState 
  icon={<Package className="w-16 h-16 text-gray-400" />}
  title="No products yet"
  description="Start by adding your first product"
  action={{
    label: "Add Product",
    onClick: openAddModal
  }}
/>
```

---

## 🎭 Mock Data Strategy

### Mock Data Files

Create realistic mock data in `src/lib/mock-data/`:

**`products.ts`:**
```typescript
import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'SHOE-001',
    name: 'Sepatu Sneakers Nike Air Max 270',
    description: 'Sepatu sneakers original Nike Air Max 270...',
    category: 'Footwear',
    price: 850000,
    compareAtPrice: 1200000,
    stock: 25,
    lowStockThreshold: 10,
    images: [
      '/images/products/shoe-1.jpg',
      '/images/products/shoe-2.jpg',
    ],
    status: 'active',
    platforms: [
      {
        platform: 'shopee',
        platformProductId: 'SP-12345',
        platformUrl: 'https://shopee.co.id/...',
        isPublished: true,
        lastSynced: new Date('2025-01-15T10:00:00'),
        title: 'COD Sepatu Nike Air Max 270 Original',
      },
      {
        platform: 'tiktok',
        platformProductId: 'TT-67890',
        platformUrl: 'https://shop.tiktok.com/...',
        isPublished: true,
        lastSynced: new Date('2025-01-15T10:00:00'),
        title: 'VIRAL Sepatu Nike Air Max 270 #fyp',
      },
      {
        platform: 'tokopedia',
        platformProductId: '',
        platformUrl: '',
        isPublished: false,
        lastSynced: null,
      },
    ],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15'),
  },
  // Add 20-50 more products with variety
];
```

**`orders.ts`:**
```typescript
export const mockOrders: Order[] = [
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
        id: '1',
        productId: '1',
        productName: 'Sepatu Sneakers Nike Air Max 270',
        productImage: '/images/products/shoe-1.jpg',
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
  // Add 30-100 orders with various statuses
];
```

**Mock Data Utilities:**

```typescript
// src/lib/mock-data/utils.ts

export const getProductById = (id: string) => {
  return mockProducts.find(p => p.id === id);
};

export const filterProducts = (filters: {
  search?: string;
  platform?: PlatformType;
  status?: ProductStatus;
  category?: string;
}) => {
  let filtered = [...mockProducts];
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search)
    );
  }
  
  if (filters.platform) {
    filtered = filtered.filter(p =>
      p.platforms.some(pl => pl.platform === filters.platform && pl.isPublished)
    );
  }
  
  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }
  
  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category);
  }
  
  return filtered;
};

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newProduct: Product = {
    ...product,
    id: `${Date.now()}`, // Simple ID generation
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockProducts.unshift(newProduct);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>) => {
  const index = mockProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    mockProducts[index] = {
      ...mockProducts[index],
      ...updates,
      updatedAt: new Date(),
    };
    return mockProducts[index];
  }
  return null;
};

export const deleteProduct = (id: string) => {
  const index = mockProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    mockProducts.splice(index, 1);
    return true;
  }
  return false;
};
```

---

## 🎨 UI/UX Guidelines

### Design Principles

1. **Consistency**
   - Use Shadcn UI components everywhere
   - Follow same spacing, colors, typography
   - Consistent button styles and placements

2. **Feedback**
   - Show loading states (spinners, skeletons)
   - Success/error toasts on actions
   - Disable buttons during processing
   - Confirmation dialogs for destructive actions

3. **Accessibility**
   - Proper ARIA labels
   - Keyboard navigation
   - Focus states
   - Color contrast (WCAG AA minimum)

4. **Mobile-First**
   - Design for mobile, enhance for desktop
   - Touch-friendly targets (min 44px)
   - Responsive tables (horizontal scroll or stack)
   - Bottom sheets for mobile modals

### Interaction Patterns

**Loading States:**
```tsx
// Button loading
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>

// Table loading (skeleton)
{isLoading ? (
  <TableSkeleton rows={5} columns={7} />
) : (
  <DataTable data={products} columns={columns} />
)}
```

**Toast Notifications:**
```tsx
// Success
toast.success('Product added successfully!');

// Error
toast.error('Failed to delete product. Please try again.');

// Info
toast.info('Syncing products from Shopee...');

// Custom
toast({
  title: "3 products published",
  description: "✓ Shopee, ✓ TikTok, ✗ Tokopedia (category error)",
  variant: "default",
});
```

**Confirmation Dialogs:**
```tsx
// Delete confirmation
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete this product from all platforms.
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 📱 Responsive Breakpoints

```typescript
// tailwind.config.ts
const screens = {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet portrait
  'lg': '1024px',  // Tablet landscape / Small desktop
  'xl': '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
}
```

**Layout Adjustments:**

| Element | Mobile (< 768px) | Desktop (≥ 768px) |
|---------|------------------|-------------------|
| Sidebar | Hidden (hamburger menu) | Always visible |
| Table | Horizontal scroll | Full width |
| Cards Grid | 1 column | 2-4 columns |
| Modals | Full screen | Centered dialog |
| Chart | Single column | Side by side |

---

## ✅ Acceptance Criteria (Phase 1)

### Must Have (MVP)

- ✅ All pages accessible and navigable
- ✅ Responsive design (tested on mobile, tablet, desktop)
- ✅ Forms with validation
- ✅ Mock CRUD operations work (add, edit, delete)
- ✅ Search and filters functional
- ✅ Charts render with mock data
- ✅ Loading states for all async actions
- ✅ Toast notifications on actions
- ✅ Confirmation on destructive actions
- ✅ No console errors
- ✅ Clean, maintainable code structure
- ✅ TypeScript types for all data

### Should Have

- ✅ Keyboard navigation
- ✅ Empty states for all lists/tables
- ✅ Print-friendly order/invoice pages
- ✅ Dark mode support (optional but recommended)
- ✅ Bulk actions work
- ✅ Platform-specific title generation
- ✅ Image upload preview

### Nice to Have

- ✅ Animations (page transitions, loading)
- ✅ Drag-and-drop image reordering
- ✅ Export to CSV (mock download)
- ✅ Keyboard shortcuts (e.g., Ctrl+K for search)
- ✅ Onboarding tour (first-time user)

---

## 🧪 Testing Checklist

### Manual Testing

**Before marking Phase 1 complete:**

```
Navigation
- ✅ All menu items work
- ✅ Breadcrumbs update correctly
- ✅ Back/forward browser buttons work

Products Page
- ✅ Can add product (all fields)
- ✅ Can edit product
- ✅ Can delete product (with confirmation)
- ✅ Search works
- ✅ Filters work (platform, status, category)
- ✅ Pagination works
- ✅ Bulk select works
- ✅ Bulk actions work
- ✅ Platform badges show correctly
- ✅ Image upload preview works

Orders Page
- ✅ Orders display correctly
- ✅ Can filter by platform, status, date
- ✅ Order detail modal opens
- ✅ Status update works
- ✅ Timeline displays correctly

Chat Page
- ✅ Conversations list loads
- ✅ Can click conversation and see messages
- ✅ Can send message (mock)
- ✅ Unread badges update
- ✅ Search conversations works

Analytics Page
- ✅ Charts render
- ✅ Period selector updates charts
- ✅ Data displays correctly

Finance Page
- ✅ Can add transaction
- ✅ Can edit transaction
- ✅ Can delete transaction
- ✅ Summary cards calculate correctly
- ✅ Chart displays income/expense

Settings Page
- ✅ Platform connection cards display
- ✅ Connect/disconnect works (mock)
- ✅ Toggles save state
- ✅ Form validation works

Responsive
- ✅ Test on mobile (375px width)
- ✅ Test on tablet (768px width)
- ✅ Test on desktop (1440px width)
- ✅ No horizontal scroll (except tables)
- ✅ Touch targets adequate on mobile

Performance
- ✅ Page load < 3s
- ✅ No layout shift
- ✅ Smooth scrolling
- ✅ Charts render smoothly

Accessibility
- ✅ All interactive elements keyboard accessible
- ✅ Focus states visible
- ✅ Color contrast sufficient
- ✅ Images have alt text
```

---

## 🚀 Development Workflow

### Daily Workflow

**Morning (30 min):**
1. Review what needs to be built today
2. Open TECH_SPEC.md → find next component/page
3. Prepare prompts for AI

**Build Session (2-3 hours):**
1. Feed prompt to AI (Cursor, v0.dev, or Claude)
2. Review generated code
3. Integrate into project
4. Test functionality
5. Fix bugs/adjust
6. Commit to Git

**Evening (30 min):**
1. Test what was built
2. Document progress
3. Note issues/improvements
4. Plan next day

### Git Workflow

**Branch Strategy:**
```
main (production-ready)
└── develop (current work)
    ├── feature/products-page
    ├── feature/orders-page
    └── feature/chat-page
```

**Commit Messages:**
```bash
# Good commit messages
git commit -m "feat: add product listing table with filters"
git commit -m "feat: implement add product modal with validation"
git commit -m "fix: product image upload preview not showing"
git commit -m "style: improve mobile responsiveness on products page"
git commit -m "docs: update TECH_SPEC with component specs"
```

**Daily commits:**
```bash
# At end of each work session
git add .
git commit -m "feat: [describe what you built today]"
git push origin develop
```

---

## 📝 AI Prompting Guidelines

### Effective Prompt Structure

**Template:**
```
Context: [What you're building]
Tech Stack: [Next.js 14, TypeScript, Shadcn UI, etc.]
Requirements: [Detailed requirements]
Data Structure: [Paste TypeScript types]
Features: [List of features]
Acceptance Criteria: [What defines success]

Generate: [What you want AI to output]
```

**Example Prompt:**

```
Context:
I'm building a products management page for a multi-platform e-commerce system.

Tech Stack:
- Next.js 14 (app router)
- TypeScript
- Shadcn UI components
- Tailwind CSS
- React Hook Form + Zod

Requirements:
Create a products listing page with:
1. Header with "Add Product", "Import CSV", and "Sync" buttons
2. Filters: search, platform dropdown, status dropdown, category dropdown
3. Products table with columns: checkbox, image, name, SKU, price, stock, platforms (badges), status, actions
4. Bulk actions bar (shows when items selected)
5. Pagination
6. Responsive design

Data Structure:
[Paste Product type from types/product.ts]

Features:
- Search filters table in real-time
- Dropdowns filter by selected value
- Bulk select: select all checkbox
- Bulk actions: publish to platforms, delete
- Click row to edit (open modal)
- Responsive: horizontal scroll on mobile

Acceptance Criteria:
- Table sortable by name, price, stock
- Filters work correctly
- Bulk actions show count of selected items
- Loading states on actions
- Toast notifications on success/error

Generate:
Complete page component with all sub-components, TypeScript types, and mock data integration.
```

### Prompts Collection

Save successful prompts in `docs/AI_PROMPTS.md` for reuse:

```markdown
# AI Prompts Collection

## Product Table Component
[Prompt that worked well]

## Order Detail Modal
[Prompt that worked well]

## Chart Components
[Prompt that worked well]

...
```

---

## 📦 Deliverables (Phase 1)

**At completion of Phase 1, you should have:**

1. **Code:**
   - ✅ Fully functional frontend application
   - ✅ All pages implemented and navigable
   - ✅ Clean, typed TypeScript code
   - ✅ Organized component structure
   - ✅ Mock data for all features

2. **Documentation:**
   - ✅ This TECH_SPEC.md (updated with changes)
   - ✅ README.md with setup instructions
   - ✅ COMPONENTS.md documenting all components
   - ✅ AI_PROMPTS.md with successful prompts

3. **Testing:**
   - ✅ All acceptance criteria met
   - ✅ Tested on multiple devices/browsers
   - ✅ No critical bugs
   - ✅ Screenshots of all pages

4. **Git:**
   - ✅ Clean commit history
   - ✅ All code pushed to repository
   - ✅ Tagged release: `v1.0.0-frontend`

---

## 🎯 Timeline (Frontend Phase)

**Recommended Schedule:**

| Week | Focus | Deliverable |
|------|-------|-------------|
| **Week 1** | Setup + Core Pages | Dashboard, Products, Orders pages (UI only) |
| **Week 2** | Advanced Pages | Chat, Analytics, Finance pages |
| **Week 3** | Modals & Forms | All modals, forms, validations |
| **Week 4** | Polish & Testing | Responsive, bug fixes, documentation |

**Daily Goals (3-4 hours/day):**

**Week 1:**
- Day 1: Project setup, install dependencies, dashboard layout
- Day 2: Dashboard home page with cards and charts
- Day 3: Products page - table and filters
- Day 4: Products page - add/edit modal
- Day 5: Orders page - table and filters
- Day 6: Orders page - detail modal
- Day 7: Testing and fixes

**Week 2:**
- Day 8: Chat page - conversation list and window
- Day 9: Chat page - messaging features
- Day 10: Analytics page - charts and metrics
- Day 11: Finance page - transactions table
- Day 12: Finance page - add transaction modal
- Day 13: Settings page - all sections
- Day 14: Testing and fixes

**Week 3:**
- Day 15: Bulk actions implementation
- Day 16: Image uploader component
- Day 17: Platform-specific title generation
- Day 18: Form validations (all forms)
- Day 19: Loading states and toasts
- Day 20: Empty states and error handling
- Day 21: Testing and fixes

**Week 4:**
- Day 22: Mobile responsiveness (all pages)
- Day 23: Tablet responsiveness
- Day 24: Accessibility improvements
- Day 25: Performance optimization
- Day 26: Bug fixes
- Day 27: Documentation
- Day 28: Final testing and delivery

---

## 🔄 Phase 2 Preview (Backend Integration)

**After Phase 1 complete, next steps:**

1. **Database Setup:**
   - Supabase setup
   - Run SQL migrations (create tables)
   - Setup Row Level Security (RLS)

2. **Authentication:**
   - Replace mock login with real auth
   - Supabase Auth integration
   - Protected routes

3. **API Integration:**
   - Replace mock data with Supabase queries
   - Implement platform APIs (Shopee, TikTok, Tokopedia)
   - OAuth flows

4. **Real-time Features:**
   - Supabase Realtime subscriptions
   - Auto-sync implementation
   - Webhooks handling

**This TECH_SPEC will be updated for Phase 2 once Phase 1 is complete.**

---

## 📞 Support & Resources

### When Stuck

1. **Check existing code:**
   - Similar component already implemented?
   - Copy pattern and adjust

2. **Review Shadcn UI docs:**
   - https://ui.shadcn.com/docs
   - See component examples

3. **AI assistance:**
   - Paste error message to Cursor/Claude
   - Show code context
   - Ask for specific fix

4. **Community:**
   - Next.js Discord
   - Shadcn UI GitHub Discussions
   - Stack Overflow

### Useful Links

- **Next.js Docs:** https://nextjs.org/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Shadcn UI:** https://ui.shadcn.com
- **Recharts:** https://recharts.org/en-US/
- **React Hook Form:** https://react-hook-form.com
- **Zod:** https://zod.dev

---

## ✅ Phase 1 Completion Checklist

**Before moving to Phase 2:**

```
Setup
- ✅ Repository created
- ✅ Next.js project initialized
- ✅ Shadcn UI configured
- ✅ TypeScript configured
- ✅ Tailwind CSS configured
- ✅ All dependencies installed

Code
- ✅ All pages implemented
- ✅ All components created
- ✅ TypeScript types defined
- ✅ Mock data created
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Clean code structure

Features
- ✅ Navigation works
- ✅ All CRUD operations (mock)
- ✅ Search and filters
- ✅ Bulk actions
- ✅ Forms with validation
- ✅ Charts rendering
- ✅ Responsive design
- ✅ Loading states
- ✅ Toasts/notifications
- ✅ Confirmations

Testing
- ✅ Manual testing completed
- ✅ Mobile tested
- ✅ Tablet tested
- ✅ Desktop tested
- ✅ All acceptance criteria met

Documentation
- ✅ README.md updated
- ✅ TECH_SPEC.md updated
- ✅ Components documented
- ✅ Prompts saved

Git
- ✅ All code committed
- ✅ Clean commit history
- ✅ Pushed to remote
- ✅ Tagged release

Ready for Phase 2! 🚀
```

---

## 🎉 Success Criteria

**Phase 1 is successful when:**

1. ✅ You can navigate through entire app
2. ✅ You can demonstrate all features (with mock data)
3. ✅ App looks professional and polished
4. ✅ Works on mobile, tablet, and desktop
5. ✅ No critical bugs
6. ✅ Code is clean and maintainable
7. ✅ You understand the codebase structure
8. ✅ Ready to integrate real backend

**Then you're ready for Phase 2: Backend Integration!**

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-01-15  
**Status:** Active - Frontend Development Phase  
**Next Review:** After Phase 1 completion

---

**Notes for AI Assistant:**

When helping with this project:
1. Always refer to this spec for requirements
2. Follow the defined tech stack
3. Use TypeScript types from types/ directory
4. Follow component structure in components/
5. Use mock data from lib/mock-data/
6. Follow design system (colors, spacing, etc.)
7. Ensure responsive design (mobile-first)
8. Include loading states and error handling
9. Follow naming conventions
10. Focus on Phase 1 scope only (no backend yet)

When generating code:
- Use Shadcn UI components
- Follow TypeScript strict mode
- Use React Hook Form + Zod for forms
- Use Recharts for charts
- Follow file structure defined above
- Include proper TypeScript types
- Add comments for complex logic
- Follow Tailwind CSS best practices

**Let's build AIOStore! 🚀**