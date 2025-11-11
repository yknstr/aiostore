import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Please check your .env.local file.')
  console.warn('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'aiostore',
    },
  },
})

// Database types (for TypeScript support)
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string
          category: string
          price: number
          compare_at_price: number | null
          stock: number
          low_stock_threshold: number
          images: string[]
          status: 'active' | 'inactive' | 'out_of_stock'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          platform: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada'
          platform_order_id: string
          customer_name: string
          customer_email: string | null
          customer_phone: string
          items: any[]
          subtotal: number
          shipping_cost: number
          discount: number
          tax: number
          total: number
          order_status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status: 'unpaid' | 'paid' | 'refunded'
          payment_method: string
          shipping_address: any
          shipping_courier: string | null
          tracking_number: string | null
          order_date: string
          paid_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          customer_notes: string | null
          internal_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          avatar: string | null
          platform: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada'
          platform_customer_id: string
          total_orders: number
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          type: 'income' | 'expense'
          category: string
          description: string
          amount: number
          platform: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada' | null
          related_order_id: string | null
          payment_method: string
          receipt_url: string | null
          notes: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          platform: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada'
          platform_message_id: string
          sender: 'customer' | 'seller'
          sender_name: string
          content: string
          attachments: any[] | null
          is_read: boolean
          timestamp: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          platform: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada'
          platform_conversation_id: string
          customer_name: string
          customer_avatar: string | null
          last_message: string
          last_message_time: string
          unread_count: number
          related_order_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}