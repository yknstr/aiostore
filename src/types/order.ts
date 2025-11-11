import { PlatformType } from './product'

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