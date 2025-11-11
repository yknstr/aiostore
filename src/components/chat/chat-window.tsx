'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Send, 
  Paperclip, 
  Smile, 
  ArrowLeft, 
  Phone, 
  Mail,
  MoreVertical,
  Archive,
  Flag,
  ShoppingBag,
  Music,
  Store,
  Building
} from 'lucide-react'
import { Conversation, Message } from '@/types/message'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface ChatWindowProps {
  conversation: Conversation
  messages: Message[]
  onSendMessage: (content: string) => void
  onMobileBack: () => void
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

export function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  onMobileBack,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const formatMessageDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  const groupedMessages = messages.reduce((groups, message, index) => {
    const currentDate = new Date(message.timestamp)
    const prevMessage = messages[index - 1]
    
    if (index === 0 || 
        (prevMessage && 
         new Date(prevMessage.timestamp).toDateString() !== currentDate.toDateString())) {
      groups.push({
        date: currentDate,
        messages: [message],
      })
    } else {
      groups[groups.length - 1].messages.push(message)
    }
    
    return groups
  }, [] as { date: Date; messages: Message[] }[])

  const PlatformIcon = platformIcons[conversation.platform]
  const platformColor = platformColors[conversation.platform]

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMobileBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <Avatar className="w-10 h-10">
              <AvatarImage src={conversation.customerAvatar} alt={conversation.customerName} />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                {getInitials(conversation.customerName)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="font-semibold text-gray-900">{conversation.customerName}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className={`w-3 h-3 ${platformColor} rounded-full flex items-center justify-center`}>
                  <PlatformIcon className="w-2 h-2 text-white" />
                </div>
                <span className="capitalize">{conversation.platform}</span>
                {isTyping && (
                  <span className="text-green-500">• typing...</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Mail className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatMessageDate(group.date)}
                </div>
              </div>
              
              {/* Messages for this date */}
              <div className="space-y-3">
                {group.messages.map((message) => {
                  const isOwn = message.sender === 'seller'
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md`}>
                        {!isOwn && (
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={conversation.customerAvatar} alt={message.senderName} />
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                              {getInitials(message.senderName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`
                            relative px-3 py-2 rounded-lg max-w-full
                            ${isOwn
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                            }
                          `}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <div className={`
                            mt-1 text-xs flex items-center justify-end space-x-1
                            ${isOwn ? 'text-blue-100' : 'text-gray-500'}
                          `}>
                            <span>{formatMessageTime(message.timestamp)}</span>
                            {isOwn && (
                              <div className="flex">
                                {message.isRead ? (
                                  <span className="text-blue-200">✓✓</span>
                                ) : (
                                  <span className="text-blue-300">✓</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="flex-shrink-0 bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <Button type="button" variant="ghost" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${conversation.customerName}...`}
              className="pr-20 resize-none"
              maxLength={1000}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim()}
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        {/* Character Count */}
        <div className="text-xs text-gray-500 mt-1 text-right">
          {newMessage.length}/1000
        </div>
      </div>
    </div>
  )
}