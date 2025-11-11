'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { PlatformConnectionCard } from '@/components/settings/platform-connection-card'
import { SyncSettings } from '@/components/settings/sync-settings'
import { ProductTemplates } from '@/components/settings/product-templates'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { AccountSettings } from '@/components/settings/account-settings'
import { 
  Settings, 
  Smartphone, 
  RefreshCw, 
  FileText, 
  Bell, 
  User,
  Shield
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('platforms')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your platform connections, sync preferences, and account settings
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="platforms" className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span>Platforms</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Sync</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Platform Connections */}
        <TabsContent value="platforms" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Platform Connections</h2>
            <p className="text-sm text-gray-600 mb-6">
              Connect your e-commerce platforms to sync products, orders, and inventory
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <PlatformConnectionCard
              platform="shopee"
              title="Shopee"
              description="Connect your Shopee store to sync products and orders"
              connected={true}
              shopName="Toko Fashion Jakarta"
              lastSync="2025-11-11T02:30:00Z"
              productCount={45}
              orderCount={23}
            />
            
            <PlatformConnectionCard
              platform="tiktok"
              title="TikTok Shop"
              description="Connect your TikTok Shop for live selling and product sync"
              connected={true}
              shopName="Viral Fashion Store"
              lastSync="2025-11-11T02:25:00Z"
              productCount={32}
              orderCount={18}
            />
            
            <PlatformConnectionCard
              platform="tokopedia"
              title="Tokopedia"
              description="Connect your Tokopedia store for comprehensive product management"
              connected={false}
              shopName=""
              lastSync=""
              productCount={0}
              orderCount={0}
            />
            
            <PlatformConnectionCard
              platform="lazada"
              title="Lazada"
              description="Connect your Lazada store for multi-channel sales"
              connected={false}
              shopName=""
              lastSync=""
              productCount={0}
              orderCount={0}
            />
          </div>
        </TabsContent>

        {/* Sync Settings */}
        <TabsContent value="sync" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sync Settings</h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure automatic synchronization preferences across all platforms
            </p>
          </div>
          
          <SyncSettings />
        </TabsContent>

        {/* Product Templates */}
        <TabsContent value="templates" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Templates</h2>
            <p className="text-sm text-gray-600 mb-6">
              Set up platform-specific templates for titles, descriptions, and SEO
            </p>
          </div>
          
          <ProductTemplates />
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Notification Settings</h2>
            <p className="text-sm text-gray-600 mb-6">
              Manage your notification preferences for orders, stock alerts, and sync updates
            </p>
          </div>
          
          <NotificationSettings />
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h2>
            <p className="text-sm text-gray-600 mb-6">
              Manage your profile information, password, and security preferences
            </p>
          </div>
          
          <div className="space-y-6">
            <AccountSettings />
            
            {/* Security Section */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">
                    Enable
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Active Sessions</p>
                    <p className="text-sm text-gray-500">Manage your active login sessions</p>
                  </div>
                  <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                    View All
                  </button>
                </div>
              </div>
            </Card>
            
            {/* Danger Zone */}
            <Card className="p-6 border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-900">Delete Account</p>
                    <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200">
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}