'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  Settings, 
  Clock, 
  Database,
  ShoppingCart,
  Package,
  MessageSquare,
  DollarSign,
  Save,
  RotateCcw
} from 'lucide-react'

interface SyncSettingsProps {}

export function SyncSettings({}: SyncSettingsProps) {
  const [autoSync, setAutoSync] = useState(true)
  const [syncFrequency, setSyncFrequency] = useState('15min')
  const [syncProducts, setSyncProducts] = useState(true)
  const [syncInventory, setSyncInventory] = useState(true)
  const [syncOrders, setSyncOrders] = useState(true)
  const [syncMessages, setSyncMessages] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save process
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleReset = () => {
    // Reset to defaults
    setAutoSync(true)
    setSyncFrequency('15min')
    setSyncProducts(true)
    setSyncInventory(true)
    setSyncOrders(true)
    setSyncMessages(false)
  }

  const frequencyOptions = [
    { value: '5min', label: 'Every 5 minutes', description: 'Real-time sync for active stores' },
    { value: '15min', label: 'Every 15 minutes', description: 'Recommended for most users' },
    { value: '30min', label: 'Every 30 minutes', description: 'Balanced sync frequency' },
    { value: '1hour', label: 'Every hour', description: 'Less frequent, saves resources' },
    { value: '4hour', label: 'Every 4 hours', description: 'Manual sync with occasional updates' },
    { value: '1day', label: 'Daily', description: 'Once per day sync' },
  ]

  const syncOptions = [
    {
      id: 'products',
      label: 'Products',
      description: 'Sync product information, prices, and availability',
      icon: Package,
      checked: syncProducts,
      onChange: setSyncProducts,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      description: 'Sync stock levels and low stock alerts',
      icon: Database,
      checked: syncInventory,
      onChange: setSyncInventory,
    },
    {
      id: 'orders',
      label: 'Orders',
      description: 'Sync new orders, order status, and customer information',
      icon: ShoppingCart,
      checked: syncOrders,
      onChange: setSyncOrders,
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Sync customer messages and conversations',
      icon: MessageSquare,
      checked: syncMessages,
      onChange: setSyncMessages,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Auto-sync Configuration */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Auto-sync Settings</h3>
            <p className="text-sm text-gray-600">Configure automatic data synchronization across all connected platforms</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Enable Auto-sync */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-sync" className="text-base font-medium">
                Enable Auto-sync
              </Label>
              <p className="text-sm text-gray-500">
                Automatically sync data at regular intervals
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
          </div>

          {/* Sync Frequency */}
          {autoSync && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Sync Frequency</Label>
              <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Sync Options */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Settings className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">What to Sync</h3>
            <p className="text-sm text-gray-600">Choose which data types to synchronize between platforms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {syncOptions.map((option) => {
            const Icon = option.icon
            return (
              <div key={option.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <Checkbox
                  id={option.id}
                  checked={option.checked}
                  onCheckedChange={(checked) => option.onChange(checked === true)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <Label htmlFor={option.id} className="font-medium">
                      {option.label}
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Platform-specific Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Platform-specific Sync</h3>
            <p className="text-sm text-gray-600">Configure sync behavior for each connected platform</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Shopee Settings */}
          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center space-x-3">
              <div className="text-xl">🛒</div>
              <div>
                <h4 className="font-medium text-gray-900">Shopee</h4>
                <p className="text-sm text-gray-600">Real-time product updates and order sync</p>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-800">Connected</Badge>
          </div>

          {/* TikTok Settings */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-xl">🎵</div>
              <div>
                <h4 className="font-medium text-gray-900">TikTok Shop</h4>
                <p className="text-sm text-gray-600">Live selling sync and inventory updates</p>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-800">Connected</Badge>
          </div>

          {/* Tokopedia Settings */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-xl">🛍️</div>
              <div>
                <h4 className="font-medium text-gray-900">Tokopedia</h4>
                <p className="text-sm text-gray-600">Not connected - connect to enable sync</p>
              </div>
            </div>
            <Badge variant="secondary">Not Connected</Badge>
          </div>

          {/* Lazada Settings */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-xl">📦</div>
              <div>
                <h4 className="font-medium text-gray-900">Lazada</h4>
                <p className="text-sm text-gray-600">Not connected - connect to enable sync</p>
              </div>
            </div>
            <Badge variant="secondary">Not Connected</Badge>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </Button>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {autoSync ? `Auto-sync enabled (${syncFrequency})` : 'Manual sync mode'}
          </span>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}