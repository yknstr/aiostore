import { PlatformType } from './product'

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