import { PlatformType } from './product'

export interface PlatformInfo {
  name: string;
  displayName: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export const PLATFORM_INFO: Record<PlatformType, PlatformInfo> = {
  shopee: {
    name: 'shopee',
    displayName: 'Shopee',
    color: '#ee4d2d',
    icon: '🛒',
    isActive: true,
  },
  tiktok: {
    name: 'tiktok',
    displayName: 'TikTok Shop',
    color: '#000000',
    icon: '🎵',
    isActive: true,
  },
  tokopedia: {
    name: 'tokopedia',
    displayName: 'Tokopedia',
    color: '#42b549',
    icon: '🛍️',
    isActive: true,
  },
  lazada: {
    name: 'lazada',
    displayName: 'Lazada',
    color: '#0066cc',
    icon: '🏪',
    isActive: false,
  },
};