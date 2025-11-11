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