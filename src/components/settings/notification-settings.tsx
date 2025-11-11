'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bell, 
  Save, 
  Mail, 
  MessageSquare, 
  AlertTriangle, 
  ShoppingCart,
  Package,
  Settings,
  Smartphone,
  Clock
} from 'lucide-react'

interface NotificationSettingsProps {}

export function NotificationSettings({}: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  
  const [newOrder, setNewOrder] = useState(true)
  const [lowStock, setLowStock] = useState(true)
  const [syncErrors, setSyncErrors] = useState(true)
  const [newMessage, setNewMessage] = useState(false)
  const [priceChanges, setPriceChanges] = useState(false)
  const [dailyReports, setDailyReports] = useState(true)
  
  const [notificationFrequency, setNotificationFrequency] = useState('immediate')
  const [quietHoursStart, setQuietHoursStart] = useState('22:00')
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00')
  const [customMessage, setCustomMessage] = useState('')
  
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save process
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const notificationEvents = [
    {
      id: 'newOrder',
      label: 'New Order',
      description: 'Get notified when you receive a new order',
      icon: ShoppingCart,
      checked: newOrder,
      onChange: setNewOrder,
    },
    {
      id: 'lowStock',
      label: 'Low Stock Alert',
      description: 'Get notified when product stock is running low',
      icon: Package,
      checked: lowStock,
      onChange: setLowStock,
    },
    {
      id: 'syncErrors',
      label: 'Sync Errors',
      description: 'Get notified when there are sync issues with platforms',
      icon: AlertTriangle,
      checked: syncErrors,
      onChange: setSyncErrors,
    },
    {
      id: 'newMessage',
      label: 'New Message',
      description: 'Get notified when customers send messages',
      icon: MessageSquare,
      checked: newMessage,
      onChange: setNewMessage,
    },
    {
      id: 'priceChanges',
      label: 'Price Changes',
      description: 'Get notified when competitor prices change',
      icon: AlertTriangle,
      checked: priceChanges,
      onChange: setPriceChanges,
    },
    {
      id: 'dailyReports',
      label: 'Daily Reports',
      description: 'Receive daily sales and performance reports',
      icon: Clock,
      checked: dailyReports,
      onChange: setDailyReports,
    },
  ]

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly Digest' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Summary' },
  ]

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notification Channels</h3>
            <p className="text-sm text-gray-600">Choose how you want to receive notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications" className="text-base font-medium">
                SMS Notifications
              </Label>
              <p className="text-sm text-gray-500">Receive urgent notifications via SMS</p>
            </div>
            <Switch
              id="sms-notifications"
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications" className="text-base font-medium">
                Push Notifications
              </Label>
              <p className="text-sm text-gray-500">Receive browser push notifications</p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </div>
      </Card>

      {/* Notification Events */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Settings className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notification Events</h3>
            <p className="text-sm text-gray-600">Choose which events trigger notifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notificationEvents.map((event) => {
            const Icon = event.icon
            return (
              <div key={event.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <Checkbox
                  id={event.id}
                  checked={event.checked}
                  onCheckedChange={event.onChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <Label htmlFor={event.id} className="font-medium">
                      {event.label}
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500">{event.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notification Timing</h3>
            <p className="text-sm text-gray-600">Configure when and how often you receive notifications</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification Frequency */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Notification Frequency</Label>
            <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              How frequently you want to receive notification digests
            </p>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Quiet Hours</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet-start" className="text-sm font-medium text-gray-700">
                  Start Time
                </Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quiet-end" className="text-sm font-medium text-gray-700">
                  End Time
                </Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              During quiet hours, non-urgent notifications will be postponed
            </p>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message" className="text-base font-medium">
              Custom Message (Optional)
            </Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a custom message to be included in notifications..."
              rows={3}
            />
            <p className="text-sm text-gray-500">
              This message will be included in all email notifications
            </p>
          </div>
        </div>
      </Card>

      {/* Platform-specific Notifications */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Smartphone className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Platform-specific Settings</h3>
            <p className="text-sm text-gray-600">Customize notifications for each platform</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Shopee Settings */}
          <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🛒</span>
                <div>
                  <h4 className="font-medium text-gray-900">Shopee</h4>
                  <p className="text-sm text-gray-600">Orders, messages, and flash sale alerts</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>New orders</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>Customer messages</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Flash sale alerts</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>Inventory updates</span>
              </label>
            </div>
          </div>

          {/* TikTok Settings */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🎵</span>
                <div>
                  <h4 className="font-medium text-gray-900">TikTok Shop</h4>
                  <p className="text-sm text-gray-600">Live selling alerts and order notifications</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>New orders</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Live session alerts</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Viral product mentions</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Creator collaborations</span>
              </label>
            </div>
          </div>

          {/* Tokopedia Settings */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🛍️</span>
                <div>
                  <h4 className="font-medium text-gray-900">Tokopedia</h4>
                  <p className="text-sm text-gray-600">Not connected - connect to enable notifications</p>
                </div>
              </div>
              <Switch disabled />
            </div>
            <p className="text-sm text-gray-500">Connect Tokopedia to customize notification settings</p>
          </div>

          {/* Lazada Settings */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📦</span>
                <div>
                  <h4 className="font-medium text-gray-900">Lazada</h4>
                  <p className="text-sm text-gray-600">Not connected - connect to enable notifications</p>
                </div>
              </div>
              <Switch disabled />
            </div>
            <p className="text-sm text-gray-500">Connect Lazada to customize notification settings</p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Settings...' : 'Save Notification Settings'}</span>
        </Button>
      </div>
    </div>
  )
}