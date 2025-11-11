import { Conversation, Message } from '@/types/message'
import { PlatformType } from '@/types/product'

export const mockConversations: Conversation[] = [
  {
    id: 'conv_1',
    platform: 'shopee',
    platformConversationId: 'shopee_12345',
    customerName: 'Sari Dewi',
    customerAvatar: '/images/avatars/user1.jpg',
    lastMessage: 'Hi, kapan bisa dikirim ya?',
    lastMessageTime: new Date('2025-11-10T15:30:00'),
    unreadCount: 2,
    createdAt: new Date('2025-11-10T10:00:00'),
    updatedAt: new Date('2025-11-10T15:30:00'),
  },
  {
    id: 'conv_2',
    platform: 'tiktok',
    platformConversationId: 'tiktok_67890',
    customerName: 'Budi Santoso',
    customerAvatar: '/images/avatars/user2.jpg',
    lastMessage: 'Terima kasih atas informasinya',
    lastMessageTime: new Date('2025-11-10T14:45:00'),
    unreadCount: 0,
    createdAt: new Date('2025-11-10T09:00:00'),
    updatedAt: new Date('2025-11-10T14:45:00'),
  },
  {
    id: 'conv_3',
    platform: 'tokopedia',
    platformConversationId: 'tokopedia_11111',
    customerName: 'Maya Putri',
    customerAvatar: '/images/avatars/user3.jpg',
    lastMessage: 'Produknya masih ada stock?',
    lastMessageTime: new Date('2025-11-10T13:20:00'),
    unreadCount: 1,
    createdAt: new Date('2025-11-10T08:30:00'),
    updatedAt: new Date('2025-11-10T13:20:00'),
  },
  {
    id: 'conv_4',
    platform: 'shopee',
    platformConversationId: 'shopee_22222',
    customerName: 'Ahmad Rizki',
    customerAvatar: '/images/avatars/user4.jpg',
    lastMessage: 'Bisa COD tidak?',
    lastMessageTime: new Date('2025-11-10T12:15:00'),
    unreadCount: 0,
    createdAt: new Date('2025-11-10T07:00:00'),
    updatedAt: new Date('2025-11-10T12:15:00'),
  },
  {
    id: 'conv_5',
    platform: 'tiktok',
    platformConversationId: 'tiktok_33333',
    customerName: 'Lisa Pertiwi',
    customerAvatar: '/images/avatars/user5.jpg',
    lastMessage: 'Harga nego ga?',
    lastMessageTime: new Date('2025-11-10T11:45:00'),
    unreadCount: 3,
    createdAt: new Date('2025-11-10T06:15:00'),
    updatedAt: new Date('2025-11-10T11:45:00'),
  },
  {
    id: 'conv_6',
    platform: 'lazada',
    platformConversationId: 'lazada_44444',
    customerName: 'Dedi Kurniawan',
    customerAvatar: '/images/avatars/user6.jpg',
    lastMessage: 'Garansinya berapa lama?',
    lastMessageTime: new Date('2025-11-09T16:30:00'),
    unreadCount: 0,
    createdAt: new Date('2025-11-09T14:00:00'),
    updatedAt: new Date('2025-11-09T16:30:00'),
  },
  {
    id: 'conv_7',
    platform: 'tokopedia',
    platformConversationId: 'tokopedia_55555',
    customerName: 'Nina Safitri',
    customerAvatar: '/images/avatars/user7.jpg',
    lastMessage: 'Kirim ke Surabaya bisa?',
    lastMessageTime: new Date('2025-11-09T15:20:00'),
    unreadCount: 1,
    createdAt: new Date('2025-11-09T12:30:00'),
    updatedAt: new Date('2025-11-09T15:20:00'),
  },
  {
    id: 'conv_8',
    platform: 'shopee',
    platformConversationId: 'shopee_66666',
    customerName: 'Yoga Pratama',
    customerAvatar: '/images/avatars/user8.jpg',
    lastMessage: 'Minta video unboxing dong',
    lastMessageTime: new Date('2025-11-09T14:10:00'),
    unreadCount: 0,
    createdAt: new Date('2025-11-09T11:00:00'),
    updatedAt: new Date('2025-11-09T14:10:00'),
  },
]

export const mockMessages: Message[] = [
  // Conversation 1 - Shopee
  {
    id: 'msg_1',
    conversationId: 'conv_1',
    platform: 'shopee',
    platformMessageId: 'shopee_msg_1',
    sender: 'customer',
    senderName: 'Sari Dewi',
    content: 'Halo, saya tertarik dengan produknya',
    isRead: true,
    timestamp: new Date('2025-11-10T10:00:00'),
  },
  {
    id: 'msg_2',
    conversationId: 'conv_1',
    platform: 'shopee',
    platformMessageId: 'shopee_msg_2',
    sender: 'seller',
    senderName: 'Toko AIOStore',
    content: 'Halo Sari! Ada yang bisa saya bantu?',
    isRead: true,
    timestamp: new Date('2025-11-10T10:05:00'),
  },
  {
    id: 'msg_3',
    conversationId: 'conv_1',
    platform: 'shopee',
    platformMessageId: 'shopee_msg_3',
    sender: 'customer',
    senderName: 'Sari Dewi',
    content: 'Ini size M masih ada?',
    isRead: true,
    timestamp: new Date('2025-11-10T15:20:00'),
  },
  {
    id: 'msg_4',
    conversationId: 'conv_1',
    platform: 'shopee',
    platformMessageId: 'shopee_msg_4',
    sender: 'customer',
    senderName: 'Sari Dewi',
    content: 'Hi, kapan bisa dikirim ya?',
    isRead: false,
    timestamp: new Date('2025-11-10T15:30:00'),
  },

  // Conversation 2 - TikTok
  {
    id: 'msg_5',
    conversationId: 'conv_2',
    platform: 'tiktok',
    platformMessageId: 'tiktok_msg_1',
    sender: 'customer',
    senderName: 'Budi Santoso',
    content: 'Bro, ini original bukan?',
    isRead: true,
    timestamp: new Date('2025-11-10T09:00:00'),
  },
  {
    id: 'msg_6',
    conversationId: 'conv_2',
    platform: 'tiktok',
    platformMessageId: 'tiktok_msg_2',
    sender: 'seller',
    senderName: 'Toko AIOStore',
    content: 'Ya bro, 100% original dengan garansi resmi',
    isRead: true,
    timestamp: new Date('2025-11-10T09:02:00'),
  },
  {
    id: 'msg_7',
    conversationId: 'conv_2',
    platform: 'tiktok',
    platformMessageId: 'tiktok_msg_3',
    sender: 'customer',
    senderName: 'Budi Santoso',
    content: 'Okay, order 2 ya',
    isRead: true,
    timestamp: new Date('2025-11-10T14:30:00'),
  },
  {
    id: 'msg_8',
    conversationId: 'conv_2',
    platform: 'tiktok',
    platformMessageId: 'tiktok_msg_4',
    sender: 'seller',
    senderName: 'Toko AIOStore',
    content: 'Siap bro! akan saya siapkan, 2 item ya',
    isRead: true,
    timestamp: new Date('2025-11-10T14:40:00'),
  },
  {
    id: 'msg_9',
    conversationId: 'conv_2',
    platform: 'tiktok',
    platformMessageId: 'tiktok_msg_5',
    sender: 'customer',
    senderName: 'Budi Santoso',
    content: 'Terima kasih atas informasinya',
    isRead: true,
    timestamp: new Date('2025-11-10T14:45:00'),
  },

  // Conversation 3 - Tokopedia
  {
    id: 'msg_10',
    conversationId: 'conv_3',
    platform: 'tokopedia',
    platformMessageId: 'tokopedia_msg_1',
    sender: 'customer',
    senderName: 'Maya Putri',
    content: 'Selamat siang, saya mau tanya',
    isRead: true,
    timestamp: new Date('2025-11-10T08:30:00'),
  },
  {
    id: 'msg_11',
    conversationId: 'conv_3',
    platform: 'tokopedia',
    platformMessageId: 'tokopedia_msg_2',
    sender: 'seller',
    senderName: 'Toko AIOStore',
    content: 'Selamat siang Maya, ada yang bisa bantuan?',
    isRead: true,
    timestamp: new Date('2025-11-10T08:32:00'),
  },
  {
    id: 'msg_12',
    conversationId: 'conv_3',
    platform: 'tokopedia',
    platformMessageId: 'tokopedia_msg_3',
    sender: 'customer',
    senderName: 'Maya Putri',
    content: 'Produknya masih ada stock?',
    isRead: false,
    timestamp: new Date('2025-11-10T13:20:00'),
  },

  // Conversation 4 - Shopee
  {
    id: 'msg_13',
    conversationId: 'conv_4',
    platform: 'shopee',
    platformMessageId: 'shopee_msg_5',
    sender: 'customer',
    senderName: 'Ahmad Rizki',
    content: 'Assalamualaikum',
    isRead: true,
    timestamp: new Date('2025-11-10T07:00:00'),
  },
  {
    id: 'msg_14',
    conversationId: 'conv_4',
    platform: 'shopee',
    platformMessageId: 'shopee_msg_6',
    sender: 'seller',
    senderName: 'Toko AIOStore',
    content: 'Waalaikumsalam, ada yang bisa bantuan?',
    isRead: true,
    timestamp: new Date('2025-11-10T07:05:00'),
  },
  {
    id: 'msg_15',
    conversationId: 'conv_4',
    platform: 'shopee',
    platformMessageId: 'shopee_msg_7',
    sender: 'customer',
    senderName: 'Ahmad Rizki',
    content: 'Bisa COD tidak?',
    isRead: true,
    timestamp: new Date('2025-11-10T12:15:00'),
  },
]

// Utility functions for chat data
export const getConversationsByPlatform = (platform: PlatformType): Conversation[] => {
  return mockConversations.filter(conv => conv.platform === platform)
}

export const getUnreadConversations = (): Conversation[] => {
  return mockConversations.filter(conv => conv.unreadCount > 0)
}

export const getTotalUnreadCount = (): number => {
  return mockConversations.reduce((total, conv) => total + conv.unreadCount, 0)
}

export const searchConversations = (query: string): Conversation[] => {
  const searchTerm = query.toLowerCase()
  return mockConversations.filter(conv => 
    conv.customerName.toLowerCase().includes(searchTerm) ||
    conv.lastMessage.toLowerCase().includes(searchTerm)
  )
}

export const getMessagesByConversation = (conversationId: string): Message[] => {
  return mockMessages.filter(msg => msg.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}