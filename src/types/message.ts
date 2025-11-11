import { PlatformType } from './product'

export type MessageSender = 'customer' | 'seller';

export interface MessageAttachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  platform: PlatformType;
  platformMessageId: string;
  
  sender: MessageSender;
  senderName: string;
  
  content: string;
  attachments?: MessageAttachment[];
  
  isRead: boolean;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  platform: PlatformType;
  platformConversationId: string;
  
  customerName: string;
  customerAvatar?: string;
  
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  
  // Optional: link to order
  relatedOrderId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}