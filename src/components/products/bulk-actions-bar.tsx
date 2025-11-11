'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  Share2, 
  Trash2, 
  X, 
  Check, 
  ShoppingBag,
  Music,
  Store,
  Building
} from 'lucide-react'
import { PlatformType } from '@/types/product'

interface BulkActionsBarProps {
  selectedCount: number
  onBulkPublish: (platform: string) => void
  onBulkDelete: () => void
}

const platformActions = [
  {
    id: 'shopee',
    name: 'Shopee',
    icon: ShoppingBag,
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-50',
  },
  {
    id: 'tiktok',
    name: 'TikTok Shop',
    icon: Music,
    color: 'bg-black',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-50',
  },
  {
    id: 'tokopedia',
    name: 'Tokopedia',
    icon: Store,
    color: 'bg-green-500',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-50',
  },
]

export function BulkActionsBar({
  selectedCount,
  onBulkPublish,
  onBulkDelete,
}: BulkActionsBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [publishing, setPublishing] = useState<string | null>(null)

  const handlePublish = async (platform: string) => {
    setPublishing(platform)
    
    // Simulate API call
    setTimeout(() => {
      onBulkPublish(platform)
      setPublishing(null)
    }, 1500)
  }

  const handleDelete = () => {
    onBulkDelete()
    setShowDeleteConfirm(false)
  }

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox checked={true} disabled />
          <div>
            <span className="font-medium text-gray-900">
              {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <div className="text-sm text-gray-600">
              Choose an action to perform on selected products
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Publish to Platforms */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Publish to:</span>
            {platformActions.map((platform) => {
              const Icon = platform.icon
              const isPublishing = publishing === platform.id
              
              return (
                <Button
                  key={platform.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePublish(platform.id)}
                  disabled={!!publishing}
                  className={`
                    ${platform.textColor} ${platform.borderColor} ${platform.hoverColor}
                    ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isPublishing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <Icon className="w-4 h-4 mr-1" />
                  )}
                  {isPublishing ? 'Publishing...' : platform.name}
                </Button>
              )
            })}
          </div>

          {/* Export Options */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>

          {/* Delete Action */}
          <div className="relative">
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-red-600 font-medium">
                  Delete {selectedCount} product{selectedCount !== 1 ? 's' : ''}?
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Yes, Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      {publishing && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Publishing {selectedCount} products to {platformActions.find(p => p.id === publishing)?.name}...
              </span>
            </div>
            <Badge variant="secondary" className="text-blue-700">
              In Progress
            </Badge>
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/3" />
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Check className="w-4 h-4 text-green-500" />
          <span>Selected products ready for bulk action</span>
        </div>
        <div className="flex items-center space-x-1">
          <Building className="w-4 h-4 text-gray-400" />
          <span>All platforms supported</span>
        </div>
      </div>
    </Card>
  )
}