import { Badge } from '@/components/ui/badge'
import { PlatformType } from '@/types/product'

interface PlatformBadgeProps {
  platform: PlatformType
  isPublished?: boolean
  variant?: 'default' | 'minimal'
  size?: 'sm' | 'md'
}

const platformConfig: Record<PlatformType, {
  name: string
  color: string
  icon: string
}> = {
  shopee: {
    name: 'Shopee',
    color: 'bg-orange-500',
    icon: 'S',
  },
  tiktok: {
    name: 'TikTok',
    color: 'bg-black',
    icon: 'TT',
  },
  tokopedia: {
    name: 'Tokopedia',
    color: 'bg-green-500',
    icon: 'TP',
  },
  lazada: {
    name: 'Lazada',
    color: 'bg-blue-500',
    icon: 'LZ',
  },
}

export function PlatformBadge({
  platform,
  isPublished = false,
  variant = 'default',
  size = 'sm',
}: PlatformBadgeProps) {
  const config = platformConfig[platform]
  const configIcon = config?.icon || platform.slice(0, 2).toUpperCase()
  const configName = config?.name || platform

  if (variant === 'minimal') {
    return (
      <div
        className={`
          ${config?.color || 'bg-gray-500'} 
          ${size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'} 
          rounded text-white text-xs font-bold 
          flex items-center justify-center
        `}
        title={`${configName} ${isPublished ? '✓' : '×'}`}
      >
        {configIcon}
      </div>
    )
  }

  return (
    <Badge
      variant={isPublished ? 'default' : 'secondary'}
      className={`
        ${size === 'sm' ? 'text-xs' : 'text-sm'}
        ${isPublished 
          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
        }
      `}
    >
      {configIcon} {configName}
      {isPublished && <span className="ml-1 text-green-600">✓</span>}
    </Badge>
  )
}