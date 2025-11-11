'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Send, 
  MoreVertical, 
  Archive, 
  Flag, 
  Phone, 
  Mail,
  User,
  MessageCircle,
  Paperclip,
  Smile,
  ArrowLeft,
  ShoppingBag,
  Clock
} from 'lucide-react'
import { ConversationList } from '@/components/chat/conversation-list'
import { ChatWindow } from '@/components/chat/chat-window'
import { CustomerInfoSidebar } from '@/components/chat/customer-info-sidebar'
import { mockConversations, mockMessages } from '@/lib/mock-data/chat'
import { Conversation, Message } from '@/types/message'
import { PlatformType } from '@/types/product'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | PlatformType>('all')
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Filter conversations based on search and platform filter
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = !searchQuery || 
      conversation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = activeFilter === 'all' || conversation.platform === activeFilter
    
    return matchesSearch && matchesFilter
  })

  // Get messages for selected conversation
  const selectedMessages = selectedConversation 
    ? messages.filter(msg => msg.conversationId === selectedConversation.id)
    : []

  // Event handlers
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    
    // Mark as read
    setConversations(conversations.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, unreadCount: 0 }
        : conv
    ))
    
    // Mark messages as read
    setMessages(messages.map(msg => 
      msg.conversationId === conversation.id && msg.sender === 'customer'
        ? { ...msg, isRead: true }
        : msg
    ))
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !content.trim()) return

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation.id,
      platform: selectedConversation.platform,
      platformMessageId: `local_${Date.now()}`,
      sender: 'seller',
      senderName: 'You',
      content: content.trim(),
      isRead: true,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    
    // Update conversation last message
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { 
            ...conv, 
            lastMessage: content.trim(),
            lastMessageTime: new Date()
          }
        : conv
    ))

    // Simulate customer response after 2-5 seconds
    const responseDelay = Math.random() * 3000 + 2000
    setTimeout(() => {
      const responses = [
        "Terima kasih atas informasinya",
        "Baik, akan saya tunggu",
        "Kapan bisa dikirim?",
        "Minta info lebih detail",
        "Sudah diterima, terima kasih"
      ]
      
      const responseMessage: Message = {
        id: `msg_${Date.now()}_response`,
        conversationId: selectedConversation.id,
        platform: selectedConversation.platform,
        platformMessageId: `local_${Date.now()}_response`,
        sender: 'customer',
        senderName: selectedConversation.customerName,
        content: responses[Math.floor(Math.random() * responses.length)],
        isRead: false,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, responseMessage])
      
      // Update conversation
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { 
              ...conv, 
              lastMessage: responseMessage.content,
              lastMessageTime: responseMessage.timestamp,
              unreadCount: conv.unreadCount + 1
            }
          : conv
      ))
    }, responseDelay)
  }

  const handleMarkAsSpam = (conversationId: string) => {
    setConversations(conversations.filter(conv => conv.id !== conversationId))
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null)
    }
  }

  const handleArchiveConversation = (conversationId: string) => {
    setConversations(conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, archived: true }
        : conv
    ))
  }

  const platformFilters = [
    { value: 'all' as const, label: 'All Platforms', count: conversations.length },
    { value: 'shopee' as const, label: 'Shopee', count: conversations.filter(c => c.platform === 'shopee').length },
    { value: 'tiktok' as const, label: 'TikTok', count: conversations.filter(c => c.platform === 'tiktok').length },
    { value: 'tokopedia' as const, label: 'Tokopedia', count: conversations.filter(c => c.platform === 'tokopedia').length },
    { value: 'lazada' as const, label: 'Lazada', count: conversations.filter(c => c.platform === 'lazada').length },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">
              Unified messaging across all platforms
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{conversations.filter(c => c.unreadCount > 0).length} unread</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List - Left Column */}
        <div className={`
          w-full md:w-80 border-r bg-gray-50 flex flex-col
          ${isMobileChatOpen ? 'hidden' : 'block'}
          lg:block
        `}>
          {/* Search and Filters */}
          <div className="p-4 bg-white border-b">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Platform Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {platformFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={activeFilter === filter.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.value)}
                  className="text-xs"
                >
                  {filter.label}
                  {filter.count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {filter.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <ConversationList
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onMarkAsSpam={handleMarkAsSpam}
              onArchiveConversation={handleArchiveConversation}
            />
          </ScrollArea>
        </div>

        {/* Chat Window - Center Column */}
        <div className={`
          flex-1 flex flex-col bg-white
          ${isMobileChatOpen ? 'block' : 'hidden lg:block'}
        `}>
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              messages={selectedMessages}
              onSendMessage={handleSendMessage}
              onMobileBack={() => setIsMobileChatOpen(false)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a conversation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Customer Info - Right Column */}
        <div className={`
          w-80 border-l bg-gray-50 flex flex-col
          ${isMobileSidebarOpen ? 'block' : 'hidden xl:block'}
        `}>
          {selectedConversation ? (
            <CustomerInfoSidebar
              conversation={selectedConversation}
              onMobileBack={() => setIsMobileSidebarOpen(false)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Customer Info</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a conversation to view customer details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      {selectedConversation && (
        <div className="lg:hidden flex-shrink-0 border-t bg-white">
          <div className="flex">
            <Button
              variant={!isMobileSidebarOpen ? "default" : "ghost"}
              className="flex-1 rounded-none"
              onClick={() => {
                setIsMobileChatOpen(true)
                setIsMobileSidebarOpen(false)
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button
              variant={isMobileSidebarOpen ? "default" : "ghost"}
              className="flex-1 rounded-none"
              onClick={() => {
                setIsMobileSidebarOpen(true)
                setIsMobileChatOpen(false)
              }}
            >
              <User className="w-4 h-4 mr-2" />
              Info
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}