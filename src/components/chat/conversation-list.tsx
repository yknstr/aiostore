'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreVertical, 
  Archive, 
  Flag, 
  CheckCircle, 
  MessageCircle,
  ShoppingBag,
  Music,
  Store,
  Building
} from 'lucide-react'
import { Conversation } from '@/types/message'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  onMarkAsSpam: (conversationId: string) => void
  onArchiveConversation: (conversationId: string) => void
}

const platformIcons = {
  shopee: ShoppingBag,
  tiktok: Music,
  tokopedia: Store,
  lazada: Building,
}

const platformColors = {
  shopee: 'bg-orange-500',
  tiktok: 'bg-black',
  tokopedia: 'bg-green-500',
  lazada: 'bg-blue-500',
}

export function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onMarkAsSpam,
  onArchiveConversation,
}: ConversationListProps) {
  const [contextMenuConversation, setContextMenuConversation] = useState<string | null>(null)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(date))
    } else {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: id 
      })
    }
  }

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message
    return message.slice(0, maxLength) + '...'
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
          <p className="mt-1 text-sm text-gray-500">
            No conversations found for the selected filter
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        const PlatformIcon = platformIcons[conversation.platform]
        const platformColor = platformColors[conversation.platform]
        const isSelected = selectedConversation?.id === conversation.id

        return (
          <div
            key={conversation.id}
            className={`
              relative p-4 border-b border-gray-200 cursor-pointer transition-colors
              ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}
            `}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conversation.customerAvatar} alt={conversation.customerName} />
                  <AvatarFallback className="bg-gray-200 text-gray-600">
                    {getInitials(conversation.customerName)}
                  </AvatarFallback>
                </Avatar>
                {conversation.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {conversation.customerName}
                    </h3>
                    <div className={`w-3 h-3 ${platformColor} rounded-full flex items-center justify-center`}>
                      <PlatformIcon className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onArchiveConversation(conversation.id)
                          }}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkAsSpam(conversation.id)
                          }}
                          className="text-red-600"
                        >
                          <Flag className="mr-2 h-4 w-4" />
                          Mark as Spam
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-1">
                  <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'} truncate`}>
                    {truncateMessage(conversation.lastMessage)}
                  </p>
                </div>

                {/* Platform indicator */}
                <div className="mt-2 flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {conversation.platform}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
            )}
          </div>
        )
      })}
    </div>
  )
}