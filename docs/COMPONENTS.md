# AIOStore Component Library Documentation

This document provides comprehensive information about the AIOStore component library, built on Shadcn UI with custom business components.

## 🎨 **Design System**

### **CSS Variables**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
```

### **Color Palette**
- **Primary**: Blue tones (#0ea5e9, #0284c7, #0369a1)
- **Success**: Green tones (#22c55e, #16a34a)
- **Warning**: Orange tones (#f59e0b, #d97706)
- **Danger**: Red tones (#ef4444, #dc2626)
- **Neutral**: Gray scale (#f9fafb to #111827)

## 🧩 **UI Components**

### **Button**
```tsx
import { Button } from '@/components/ui/button'

// Variants
<Button>Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### **Card**
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### **Input**
```tsx
import { Input } from '@/components/ui/input'

<Input placeholder="Enter text..." />
<Input type="email" placeholder="Email address" />
<Input type="password" placeholder="Password" />
```

### **Dialog**
```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    Dialog content
  </DialogContent>
</Dialog>
```

### **Table**
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### **Tabs**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

## 🏢 **Business Components**

### **PlatformBadge**
```tsx
import { PlatformBadge } from '@/components/products/platform-badge'

<PlatformBadge platform="shopee" isPublished={true} />
<PlatformBadge platform="tiktok" isPublished={false} variant="minimal" />
```

**Props:**
- `platform`: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada'
- `isPublished`: boolean
- `variant`: 'default' | 'minimal'

### **StatusBadge**
```tsx
import { StatusBadge } from '@/components/orders/order-status-badge'

<StatusBadge status="pending" />
<StatusBadge status="processing" />
<StatusBadge status="delivered" />
```

**Props:**
- `status`: OrderStatus | ProductStatus
- `size`: 'sm' | 'md' | 'lg'

### **StatCard**
```tsx
import { StatCard } from '@/components/dashboard/stat-card'

<StatCard
  title="Total Products"
  value="1,234"
  icon={<Package className="w-6 h-6" />}
  trend={{ value: 12.5, isPositive: true }}
/>
```

**Props:**
- `title`: string
- `value`: string | number
- `icon`: React.ReactNode
- `trend?`: { value: number; isPositive: boolean }
- `className?`: string

### **DataTable**
```tsx
import { DataTable } from '@/components/ui/data-table'

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

const columns: Column<Product>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
]

<DataTable
  data={products}
  columns={columns}
  onSort={(key, direction) => {}}
  selectable={true}
  onSelectionChange={(selected) => {}}
/>
```

## 📱 **Layout Components**

### **Sidebar**
```tsx
import { Sidebar } from '@/components/layout/sidebar'

// Used in dashboard layout
<Sidebar />
```

### **Topbar**
```tsx
import { Topbar } from '@/components/layout/topbar'

<Topbar onMenuClick={() => setSidebarOpen(true)} />
```

### **MobileNav**
```tsx
import { MobileNav } from '@/components/layout/mobile-nav'

<MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
```

## 📊 **Dashboard Components**

### **SalesChart**
```tsx
import { SalesChart } from '@/components/dashboard/sales-chart'

<SalesChart
  data={salesData}
  period="7d"
  onPeriodChange={(period) => {}}
/>
```

### **PlatformChart**
```tsx
import { PlatformChart } from '@/components/dashboard/platform-chart'

<PlatformChart data={platformData} />
```

### **RecentOrders**
```tsx
import { RecentOrders } from '@/components/dashboard/recent-orders'

<RecentOrders orders={recentOrders} onViewOrder={(order) => {}} />
```

## 🛍️ **Product Components**

### **ProductTable**
```tsx
import { ProductTable } from '@/components/products/product-table'

<ProductTable
  products={products}
  selectedProducts={selected}
  onSelectProduct={(id, selected) => {}}
  onSelectAll={(selected) => {}}
  onEditProduct={(product) => {}}
  onDeleteProduct={(id) => {}}
/>
```

### **ProductFormModal**
```tsx
import { ProductFormModal } from '@/components/products/product-form-modal'

<ProductFormModal
  product={editingProduct}
  onSave={(product) => {}}
  onCancel={() => {}}
/>
```

### **ProductFilters**
```tsx
import { ProductFilters } from '@/components/products/product-filters'

<ProductFilters
  filters={filters}
  onFiltersChange={(filters) => {}}
  products={products}
/>
```

### **BulkActionsBar**
```tsx
import { BulkActionsBar } from '@/components/products/bulk-actions-bar'

<BulkActionsBar
  selectedCount={selectedCount}
  onBulkPublish={(platform) => {}}
  onBulkDelete={() => {}}
/>
```

## 📦 **Order Components**

### **OrdersTable**
```tsx
import { OrdersTable } from '@/components/orders/orders-table'

<OrdersTable
  orders={orders}
  onViewOrder={(order) => {}}
  onUpdateStatus={(orderId, status) => {}}
/>
```

### **OrderDetailModal**
```tsx
import { OrderDetailModal } from '@/components/orders/order-detail-modal'

<OrderDetailModal
  order={selectedOrder}
  onUpdateStatus={(status) => {}}
  onClose={() => {}}
/>
```

### **OrderFilters**
```tsx
import { OrderFilters } from '@/components/orders/order-filters'

<OrderFilters
  filters={filters}
  onFiltersChange={(filters) => {}}
/>
```

### **OrderStatusBadge**
```tsx
import { OrderStatusBadge } from '@/components/orders/order-status-badge'

<OrderStatusBadge status="processing" />
```

## 💬 **Chat Components**

### **ConversationList**
```tsx
import { ConversationList } from '@/components/chat/conversation-list'

<ConversationList
  conversations={conversations}
  selectedConversation={selected}
  onSelectConversation={(conv) => {}}
/>
```

### **ChatWindow**
```tsx
import { ChatWindow } from '@/components/chat/chat-window'

<ChatWindow
  conversation={selectedConversation}
  messages={messages}
  onSendMessage={(content) => {}}
/>
```

### **CustomerInfoSidebar**
```tsx
import { CustomerInfoSidebar } from '@/components/chat/customer-info-sidebar'

<CustomerInfoSidebar
  conversation={selectedConversation}
/>
```

## 📈 **Analytics Components**

### **RevenueChart**
```tsx
import { RevenueChart } from '@/components/analytics/revenue-chart'

<RevenueChart
  data={revenueData}
  period="30d"
  onPeriodChange={(period) => {}}
/>
```

### **OrdersChart**
```tsx
import { OrdersChart } from '@/components/analytics/orders-chart'

<OrdersChart data={ordersData} />
```

### **MetricCard**
```tsx
import { MetricCard } from '@/components/analytics/metric-card'

<MetricCard
  title="Average Order Value"
  value="Rp 850,000"
  change={12.5}
  trend="up"
/>
```

## 💰 **Finance Components**

### **TransactionTable**
```tsx
import { TransactionTable } from '@/components/finance/transaction-table'

<TransactionTable
  transactions={transactions}
  onEditTransaction={(transaction) => {}}
  onDeleteTransaction={(id) => {}}
/>
```

### **IncomeChart**
```tsx
import { IncomeChart } from '@/components/finance/income-chart'

<IncomeChart
  data={incomeData}
  view="revenue"
  onViewChange={(view) => {}}
/>
```

### **SummaryCards**
```tsx
import { SummaryCards } from '@/components/finance/summary-cards'

<SummaryCards
  transactions={transactions}
  period="thisMonth"
/>
```

### **AddTransactionModal**
```tsx
import { AddTransactionModal } from '@/components/finance/add-transaction-modal'

<AddTransactionModal
  onSave={(transaction) => {}}
  onCancel={() => {}}
/>
```

## ⚙️ **Settings Components**

### **PlatformConnectionCard**
```tsx
import { PlatformConnectionCard } from '@/components/settings/platform-connection-card'

<PlatformConnectionCard
  platform="shopee"
  isConnected={true}
  connectionStats={stats}
  onConnect={() => {}}
  onDisconnect={() => {}}
  onSync={() => {}}
/>
```

### **SyncSettings**
```tsx
import { SyncSettings } from '@/components/settings/sync-settings'

<SyncSettings
  settings={syncSettings}
  onSave={(settings) => {}}
/>
```

### **ProductTemplates**
```tsx
import { ProductTemplates } from '@/components/settings/product-templates'

<ProductTemplates
  templates={templates}
  onSave={(templates) => {}}
/>
```

### **NotificationSettings**
```tsx
import { NotificationSettings } from '@/components/settings/notification-settings'

<NotificationSettings
  settings={notificationSettings}
  onSave={(settings) => {}}
/>
```

### **AccountSettings**
```tsx
import { AccountSettings } from '@/components/settings/account-settings'

<AccountSettings
  user={user}
  onSaveProfile={(profile) => {}}
  onChangePassword={(passwords) => {}}
/>
```

## 🎣 **Custom Hooks**

### **useToast**
```tsx
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

toast({
  title: "Success",
  description: "Action completed successfully",
  variant: "default",
})
```

### **useMediaQuery**
```tsx
import { useMediaQuery } from '@/hooks/use-media-query'

const isMobile = useMediaQuery('(max-width: 768px)')
```

## 🛠️ **Utility Functions**

### **cn() - Class Name Utility**
```tsx
import { cn } from '@/lib/utils'

<button className={cn(
  "base-classes",
  condition && "conditional-classes"
)} />
```

### **Date Formatting**
```tsx
import { formatDistanceToNow } from 'date-fns'

// Format date as "2 hours ago"
formatDistanceToNow(new Date(), { addSuffix: true })

// Format currency
new Intl.NumberFormat('id-ID', { 
  style: 'currency', 
  currency: 'IDR' 
}).format(amount)
```

## 📱 **Responsive Design**

### **Breakpoints**
- `sm`: 640px
- `md`: 768px  
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### **Mobile-First Approach**
All components are designed mobile-first and enhanced for larger screens:

```tsx
// Mobile: stacked layout
<div className="flex flex-col space-y-4">

// Tablet: side by side
<div className="flex flex-col md:flex-row md:space-x-4 md:space-y-0">

// Desktop: full multi-column
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
```

## 🎨 **Theming**

### **Dark Mode Support**
Components automatically adapt to dark mode using CSS variables:

```css
:root {
  --background: 0 0% 100%;
  /* light mode styles */
}

.dark {
  --background: 222.2 84% 4.9%;
  /* dark mode styles */
}
```

### **Custom Variants**
Create component variants using class-variance-authority:

```tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        secondary: "secondary-classes",
        outline: "outline-classes"
      }
    }
  }
)
```

## 📋 **Component Guidelines**

1. **Consistent Styling**: Use design system colors, spacing, and typography
2. **Accessibility**: Include proper ARIA labels and keyboard navigation
3. **Responsive**: Test on mobile, tablet, and desktop
4. **Performance**: Optimize for fast rendering and smooth interactions
5. **Type Safety**: Use TypeScript for all props and state
6. **Error Handling**: Include loading states and error boundaries
7. **Documentation**: Document complex components with examples

## 🚀 **Usage Examples**

### **Complete Form Example**
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
})

export function ContactForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema)
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('name')} />
      <Input {...form.register('email')} />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### **Data Table with Filtering**
```tsx
export function ProductTable() {
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState({ column: 'name', direction: 'asc' })
  
  const filteredProducts = useMemo(() => {
    return products
      .filter(filterProducts)
      .sort(sortProducts)
  }, [products, filters, sort])

  return (
    <div>
      <ProductFilters filters={filters} onChange={setFilters} />
      <DataTable
        data={filteredProducts}
        columns={columns}
        sort={sort}
        onSort={setSort}
      />
    </div>
  )
}
```

This component library provides a solid foundation for building consistent, accessible, and maintainable user interfaces for the AIOStore e-commerce management system.