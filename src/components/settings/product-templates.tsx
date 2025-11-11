'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Save, 
  Eye, 
  Lightbulb,
  ShoppingBag,
  Hash,
  Tag
} from 'lucide-react'

interface ProductTemplatesProps {}

export function ProductTemplates({}: ProductTemplatesProps) {
  const [templates, setTemplates] = useState({
    shopee: {
      title: 'COD {productName} - Original {brand} - Free Ongkir',
      description: 'KUALITAS PREMIUM ✓\n\n✨ FEATURES:\n• Material berkualitas tinggi\n• Nyaman dipakai\n• Original 100%\n• Garansi produk\n\n📏 SIZE CHART:\n{P_SIZE}\n\n🚚 PENGIRIMAN:\n• Estimasi 1-3 hari\n• Gratis ongkir* (*syarat & ketentuan)\n\n#fashion #original #premium #gratisongkir #corspace #bestseller #fyp #viral #shopee',
    },
    tiktok: {
      title: 'VIRAL! {productName} Original #{brand} #fyp #foryou #viral',
      description: '🔥 PRODUK VIRAL DI TIKTOK! 🔥\n\n✨ {productName} - Original {brand}\n\n🎯 KEUNGGULAN:\n• 100% Original\n• Viral di TikTok\n• Stock terbatas\n• Promo hari ini!\n\n💰 HARGA SPESIAL:\n{P_PRICE}\n\n🛒 ORDER SEKARANG!\n• Chat link di bio\n• Klik shopping bag\n• Fast response!\n\n#fyp #viral #tiktok #original #limited #trending #fashion #onlineshop #shopnow',
    },
    tokopedia: {
      title: '{productName} - {brand} - Garansi Resmi - Ongkir Gratis',
      description: 'SELAMAT DATANG DI TOKO KAMI!\n\n📦 PRODUK: {productName}\n🏷️ MERK: {brand}\n✅ KONDISI: Original & Baru\n\n📋 SPESIFIKASI:\n• Material premium\n• Kualitas terjamin\n• Garansi resmi\n• Packing aman\n\n🚚 PENGIRIMAN:\n• Same day/next day\n• Ongkir gratis* (*min. pembelanjaan)\n• Asuransi pengiriman\n\n💳 PEMBAYARAN:\n• Semua metode pembayaran\n• Transfer bank\n• E-wallet\n• COD tersedia\n\n🛡️ JAMINAN:\n• Produk original 100%\n• Garansi resmi\n• Cashback guarantee\n\n#tokopedia #original #garansi #ongkirgratis #cashback #trusted',
    },
    lazada: {
      title: '{productName} {brand} - Official Store - Flash Sale!',
      description: '🏪 OFFICIAL STORE LAZADA\n\n🔥 FLASH SALE HARI INI!\n\n📦 PRODUK: {productName}\n🏷️ BRAND: {brand}\n\n✨ KEUNGGULAN:\n• Official store\n• 100% original\n• Official warranty\n• Free delivery\n• 7 days return\n\n🎁 BONUS:\n• Free gift\n• Discount voucher\n• Loyalty points\n\n📱 ORDER VIA:\n• Lazada app\n• Web browser\n• Call center\n\n⚡ LIMITED TIME OFFER!\n⏰ Hurry up, stock terbatas!\n\n#lazada #official #flashsale #original #warranty #freedelivery #7daysreturn',
    },
  })

  const [activeTemplate, setActiveTemplate] = useState<keyof typeof templates>('shopee')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save process
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const updateTemplate = (platform: keyof typeof templates, field: 'title' | 'description', value: string) => {
    setTemplates(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      }
    }))
  }

  const templateVariables = [
    { variable: '{productName}', description: 'Product name' },
    { variable: '{brand}', description: 'Product brand' },
    { variable: '{price}', description: 'Product price' },
    { variable: '{P_PRICE}', description: 'Formatted price with currency' },
    { variable: '{P_SIZE}', description: 'Size information' },
    { variable: '{category}', description: 'Product category' },
    { variable: '{sku}', description: 'Product SKU' },
  ]

  const platforms = [
    { key: 'shopee', name: 'Shopee', icon: '🛒', color: 'border-orange-200 bg-orange-50' },
    { key: 'tiktok', name: 'TikTok Shop', icon: '🎵', color: 'border-gray-200 bg-gray-50' },
    { key: 'tokopedia', name: 'Tokopedia', icon: '🛍️', color: 'border-green-200 bg-green-50' },
    { key: 'lazada', name: 'Lazada', icon: '📦', color: 'border-blue-200 bg-blue-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Template Variables Help */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Template Variables</h3>
            <p className="text-sm text-gray-600">Use these variables to automatically populate your product information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templateVariables.map((variable) => (
            <div key={variable.variable} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Hash className="w-4 h-4 text-gray-500" />
              <div>
                <code className="text-sm font-mono text-blue-600">{variable.variable}</code>
                <p className="text-xs text-gray-500">{variable.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Platform Templates */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Platform-specific Templates</h3>
            <p className="text-sm text-gray-600">Customize product titles and descriptions for each platform</p>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {platforms.map((platform) => (
            <Button
              key={platform.key}
              variant={activeTemplate === platform.key ? "default" : "outline"}
              onClick={() => setActiveTemplate(platform.key as keyof typeof templates)}
              className={`flex items-center space-x-2 whitespace-nowrap ${platform.color}`}
            >
              <span>{platform.icon}</span>
              <span>{platform.name}</span>
            </Button>
          ))}
        </div>

        {/* Template Form */}
        <div className="space-y-6">
          {/* Title Template */}
          <div className="space-y-2">
            <Label htmlFor="title-template" className="text-base font-medium flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>Product Title Template</span>
            </Label>
            <Input
              id="title-template"
              value={templates[activeTemplate].title}
              onChange={(e) => updateTemplate(activeTemplate, 'title', e.target.value)}
              placeholder="Enter title template..."
              className="font-mono"
            />
            <p className="text-sm text-gray-500">
              This template will be used to generate product titles on {platforms.find(p => p.key === activeTemplate)?.name}
            </p>
          </div>

          {/* Description Template */}
          <div className="space-y-2">
            <Label htmlFor="description-template" className="text-base font-medium flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Product Description Template</span>
            </Label>
            <Textarea
              id="description-template"
              value={templates[activeTemplate].description}
              onChange={(e) => updateTemplate(activeTemplate, 'description', e.target.value)}
              placeholder="Enter description template..."
              rows={12}
              className="font-mono"
            />
            <p className="text-sm text-gray-500">
              This template will be used to generate product descriptions on {platforms.find(p => p.key === activeTemplate)?.name}
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-base font-medium flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Preview (Example Product: Nike Air Max 270)</span>
            </Label>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Title Preview:</h4>
                  <p className="text-sm text-gray-900">
                    {templates[activeTemplate].title
                      .replace('{productName}', 'Nike Air Max 270')
                      .replace('{brand}', 'Nike')
                      .replace('{price}', '850000')
                      .replace('{P_PRICE}', 'Rp 850.000')
                      .replace('{P_SIZE}', '39-44')
                      .replace('{category}', 'Sneakers')
                      .replace('{sku}', 'NAM-270-001')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Description Preview:</h4>
                  <div className="text-sm text-gray-900 whitespace-pre-line">
                    {templates[activeTemplate].description
                      .replace(/{productName}/g, 'Nike Air Max 270')
                      .replace(/{brand}/g, 'Nike')
                      .replace(/{price}/g, '850000')
                      .replace(/{P_PRICE}/g, 'Rp 850.000')
                      .replace(/{P_SIZE}/g, '39, 40, 41, 42, 43, 44')
                      .replace(/{category}/g, 'Sneakers')
                      .replace(/{sku}/g, 'NAM-270-001')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Templates...' : 'Save All Templates'}</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}