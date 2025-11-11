# Phase 3 M2 — Database DML Implementation Documentation

**Date**: 2025-11-11T19:56:27.182Z  
**Phase**: Phase 3 - M2 Writes (Dry-Run)  
**Context7 Source**: `/supabase/supabase-js`

## Official Supabase JS v2 Database DML Methods Used

### 1. Insert Single Row
**Source**: https://context7.com/supabase/supabase-js/llms.txt

```javascript
// Insert single row
const { data: newUser, error: insertError } = await postgrest
  .from('users')
  .insert({
    email: 'newuser@example.com',
    full_name: 'New User',
    age: 30
  })
  .select()
  .single()
```

### 2. Insert Multiple Rows (Bulk Insert)
**Source**: https://context7.com/supabase/supabase-js/llms.txt

```javascript
// Insert multiple rows
const { data: newUsers, error: bulkInsertError } = await postgrest
  .from('users')
  .insert([
    { email: 'user1@example.com', full_name: 'User One' },
    { email: 'user2@example.com', full_name: 'User Two' },
    { email: 'user3@example.com', full_name: 'User Three' }
  ])
  .select()
```

### 3. Update Rows with Filters
**Source**: https://context7.com/supabase/supabase-js/llms.txt

```javascript
// Update rows
const { data: updatedUser, error: updateError } = await postgrest
  .from('users')
  .update({ status: 'inactive', updated_at: new Date().toISOString() })
  .eq('id', '123e4567-e89b-12d3-a456-426614174000')
  .select()
  .single()
```

### 4. Select with Filtering
**Source**: https://context7.com/supabase/supabase-js/llms.txt

```javascript
// Select specific columns with filtering
const { data: filteredUsers, error: filterError } = await postgrest
  .from('users')
  .select('id, email, created_at, profiles(avatar_url, bio)')
  .eq('status', 'active')
  .gte('age', 18)
  .order('created_at', { ascending: false })
  .limit(10)
```

### 5. Upsert (Insert or Update)
**Source**: https://context7.com/supabase/supabase-js/llms.txt

```javascript
// Upsert (insert or update if exists)
const { data: upsertedUser, error: upsertError } = await postgrest
  .from('users')
  .upsert({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user@example.com',
    full_name: 'Updated Name'
  }, {
    onConflict: 'email' // Column to check for conflicts
  })
  .select()
```

### 6. Delete Rows
**Source**: https://context7.com/supabase/supabase-js/llms.txt

```javascript
// Delete rows
const { data: deletedUsers, error: deleteError } = await postgrest
  .from('users')
  .delete()
  .eq('status', 'banned')
  .select()
```

### 7. Complex Query with Joins
**Source**: https://context7.com/supabase/supabase-js/llms.txt

```javascript
// Complex query with joins and filters
const { data: posts, error: complexError } = await postgrest
  .from('posts')
  .select(`
    id,
    title,
    content,
    created_at,
    author:users!author_id(id, email, full_name),
    comments(id, content, user:users(email)),
    tags(name)
  `)
  .eq('published', true)
  .gte('created_at', '2024-01-01')
  .or('status.eq.featured,priority.gte.5')
  .order('created_at', { ascending: false })
  .range(0, 9) // Pagination: rows 0-9
```

## Implementation Patterns for Phase 3

### Write Mode Safety Pattern
```javascript
const WRITE_MODE = process.env.WRITE_MODE || 'dry'

async createProduct(productData) {
  if (WRITE_MODE === 'dry') {
    console.log('[DRY-RUN] Would insert product:', productData)
    console.log('[DRY-RUN] SQL: INSERT INTO products (...) VALUES (...)')
    return { success: true, data: productData, dryRun: true }
  }
  
  // LIVE mode - actual database operation
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()
    
  return { success: !error, data, error }
}

async updateProduct(id, updates) {
  if (WRITE_MODE === 'dry') {
    console.log('[DRY-RUN] Would update product:', id, updates)
    console.log('[DRY-RUN] SQL: UPDATE products SET ... WHERE id = ?')
    return { success: true, data: { id, ...updates }, dryRun: true }
  }
  
  // LIVE mode - actual database operation
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
    
  return { success: !error, data, error }
}

async updateOrderStatus(id, status) {
  if (WRITE_MODE === 'dry') {
    console.log('[DRY-RUN] Would update order status:', id, status)
    console.log('[DRY-RUN] SQL: UPDATE orders SET order_status = ? WHERE id = ?')
    return { success: true, data: { id, orderStatus: status }, dryRun: true }
  }
  
  // LIVE mode - actual database operation
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: status })
    .eq('id', id)
    .select()
    .single()
    
  return { success: !error, data, error }
}
```

### Data Transformation Pattern
```javascript
// Transform camelCase to snake_case for database
function toDatabaseFormat(product) {
  return {
    sku: product.sku,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    compare_at_price: product.compareAtPrice,
    stock: product.stock,
    low_stock_threshold: product.lowStockThreshold,
    images: product.images,
    status: product.status,
    // created_at and updated_at handled by database
  }
}

// Transform snake_case to camelCase from database
function fromDatabaseFormat(dbProduct) {
  return {
    id: dbProduct.id,
    sku: dbProduct.sku,
    name: dbProduct.name,
    description: dbProduct.description,
    category: dbProduct.category,
    price: dbProduct.price,
    compareAtPrice: dbProduct.compare_at_price,
    stock: dbProduct.stock,
    lowStockThreshold: dbProduct.low_stock_threshold,
    images: dbProduct.images,
    status: dbProduct.status,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  }
}
```

## Key Implementation Notes

1. **Safety First**: Default WRITE_MODE is 'dry' to prevent accidental data modification
2. **Consistent API**: All write methods return same shape as read methods with success/error handling
3. **Logging**: Dry mode provides detailed logging of intended operations
4. **Data Transformation**: Proper camelCase/snake_case conversion for database compatibility
5. **Error Handling**: Consistent error handling patterns across all services
6. **Shape Parity**: Write methods follow same response format as existing read methods

## Security Considerations

- Uses anon key only (no service_role in client)
- RLS policies will control access in live mode
- Dry mode prevents any database modifications
- All operations go through service layer (no direct SDK calls in UI)
- Proper input validation and sanitization