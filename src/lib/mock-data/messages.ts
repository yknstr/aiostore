import { Message, Conversation } from '@/types/message'
import { mockOrders } from './orders'

// Generate realistic conversation data
const sampleConversations: Conversation[] = [
  {
    id: 'conv-1',
    platform: 'shopee',
    platformConversationId: 'SP-CONV-001',
    customerName: 'Budi Santoso',
    customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Hi, saya ingin tahu ukuran yang tersedia untuk sepatu ini?',
    lastMessageTime: new Date('2025-01-15T14:30:00'),
    unreadCount: 2,
    relatedOrderId: '1',
    createdAt: new Date('2025-01-14T10:00:00'),
    updatedAt: new Date('2025-01-15T14:30:00'),
  },
  {
    id: 'conv-2',
    platform: 'tiktok',
    platformConversationId: 'TT-CONV-002',
    customerName: 'Siti Nurhaliza',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Terima kasih, barang sudah sampai dengan aman',
    lastMessageTime: new Date('2025-01-15T13:15:00'),
    unreadCount: 0,
    relatedOrderId: '2',
    createdAt: new Date('2025-01-13T15:30:00'),
    updatedAt: new Date('2025-01-15T13:15:00'),
  },
  {
    id: 'conv-3',
    platform: 'tokopedia',
    platformConversationId: 'TP-CONV-003',
    customerName: 'Ahmad Wijaya',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Bisa COD tidak ya?',
    lastMessageTime: new Date('2025-01-15T11:45:00'),
    unreadCount: 1,
    relatedOrderId: '3',
    createdAt: new Date('2025-01-12T09:00:00'),
    updatedAt: new Date('2025-01-15T11:45:00'),
  },
  {
    id: 'conv-4',
    platform: 'shopee',
    platformConversationId: 'SP-CONV-004',
    customerName: 'Maya Putri',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Kapan barangnya bisa dikirim?',
    lastMessageTime: new Date('2025-01-15T09:20:00'),
    unreadCount: 1,
    createdAt: new Date('2025-01-14T16:00:00'),
    updatedAt: new Date('2025-01-15T09:20:00'),
  },
  {
    id: 'conv-5',
    platform: 'tiktok',
    platformConversationId: 'TT-CONV-005',
    customerName: 'Rio Permana',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Maaf, saya tidak sengaja memesan barang yang sama',
    lastMessageTime: new Date('2025-01-14T20:30:00'),
    unreadCount: 0,
    createdAt: new Date('2025-01-14T18:00:00'),
    updatedAt: new Date('2025-01-14T20:30:00'),
  },
]

// Generate realistic message data
const sampleMessages: Message[] = [
  // Conversation 1 - Budi Santoso
  {
    id: 'msg-1-1',
    conversationId: 'conv-1',
    platform: 'shopee',
    platformMessageId: 'SP-MSG-001',
    sender: 'customer',
    senderName: 'Budi Santoso',
    content: 'Halo, saya tertarik dengan sepatu Nike Air Max 270',
    isRead: true,
    timestamp: new Date('2025-01-14T10:00:00'),
  },
  {
    id: 'msg-1-2',
    conversationId: 'conv-1',
    platform: 'shopee',
    platformMessageId: 'SP-MSG-002',
    sender: 'seller',
    senderName: 'AIOStore',
    content: 'Halo Pak Budi! Terima kasih sudah tertarik dengan produk kami. Sepatu Nike Air Max 270 ready stok dan original 100%.',
    isRead: true,
    timestamp: new Date('2025-01-14T10:05:00'),
  },
  {
    id: 'msg-1-3',
    conversationId: 'conv-1',
    platform: 'shopee',
    platformMessageId: 'SP-MSG-003',
    sender: 'customer',
    senderName: 'Budi Santoso',
    content: 'Hi, saya ingin tahu ukuran yang tersedia untuk sepatu ini?',
    isRead: false,
    timestamp: new Date('2025-01-15T14:30:00'),
  },
  
  // Conversation 2 - Siti Nurhaliza
  {
    id: 'msg-2-1',
    conversationId: 'conv-2',
    platform: 'tiktok',
    platformMessageId: 'TT-MSG-001',
    sender: 'customer',
    senderName: 'Siti Nurhaliza',
    content: 'Halo kak, kaos cottonnya masih ada?',
    isRead: true,
    timestamp: new Date('2025-01-13T15:30:00'),
  },
  {
    id: 'msg-2-2',
    conversationId: 'conv-2',
    platform: 'tiktok',
    platformMessageId: 'TT-MSG-002',
    sender: 'seller',
    senderName: 'AIOStore',
    content: 'Halo mbak Siti! masih ready kok, warna apa yang dibutuhkan?',
    isRead: true,
    timestamp: new Date('2025-01-13T15:35:00'),
  },
  {
    id: 'msg-2-3',
    conversationId: 'conv-2',
    platform: 'tiktok',
    platformMessageId: 'TT-MSG-003',
    sender: 'customer',
    senderName: 'Siti Nurhaliza',
    content: 'Mau 2 pcs warna putih sama hitam boleh?',
    isRead: true,
    timestamp: new Date('2025-01-13T15:40:00'),
  },
  {
    id: 'msg-2-4',
    conversationId: 'conv-2',
    platform: 'tiktok',
    platformMessageId: 'TT-MSG-004',
    sender: 'seller',
    senderName: 'AIOStore',
    content: 'Boleh dong! Stok masih banyak, mau order langsung?',
    isRead: true,
    timestamp: new Date('2025-01-13T15:45:00'),
  },
  {
    id: 'msg-2-5',
    conversationId: 'conv-2',
    platform: 'tiktok',
    platformMessageId: 'TT-MSG-005',
    sender: 'customer',
    senderName: 'Siti Nurhaliza',
    content: 'Terima kasih, barang sudah sampai dengan aman',
    isRead: true,
    timestamp: new Date('2025-01-15T13:15:00'),
  },
  
  // Conversation 3 - Ahmad Wijaya
  {
    id: 'msg-3-1',
    conversationId: 'conv-3',
    platform: 'tokopedia',
    platformMessageId: 'TP-MSG-001',
    sender: 'customer',
    senderName: 'Ahmad Wijaya',
    content: 'Halo, tas ransel ini bisa COD tidak?',
    isRead: true,
    timestamp: new Date('2025-01-12T09:00:00'),
  },
  {
    id: 'msg-3-2',
    conversationId: 'conv-3',
    platform: 'tokopedia',
    platformMessageId: 'TP-MSG-002',
    sender: 'seller',
    senderName: 'AIOStore',
    content: 'Halo Pak Ahmad! Bisa COD kok untuk area Jabodetabek. Tas ransel ini full original dan anti air.',
    isRead: true,
    timestamp: new Date('2025-01-12T09:10:00'),
  },
  {
    id: 'msg-3-3',
    conversationId: 'conv-3',
    platform: 'tokopedia',
    platformMessageId: 'TP-MSG-003',
    sender: 'customer',
    senderName: 'Ahmad Wijaya',
    content: 'Bagus, kalau warna ada pilihan apa saja?',
    isRead: true,
    timestamp: new Date('2025-01-12T09:15:00'),
  },
  {
    id: 'msg-3-4',
    conversationId: 'conv-3',
    platform: 'tokopedia',
    platformMessageId: 'TP-MSG-004',
    sender: 'seller',
    senderName: 'AIOStore',
    content: 'Ada hitam, navy, dan abu-abu. Yang mana yang Bapak suka?',
    isRead: true,
    timestamp: new Date('2025-01-12T09:20:00'),
  },
  {
    id: 'msg-3-5',
    conversationId: 'conv-3',
    platform: 'tokopedia',
    platformMessageId: 'TP-MSG-005',
    sender: 'customer',
    senderName: 'Ahmad Wijaya',
    content: 'Bisa COD tidak ya?',
    isRead: false,
    timestamp: new Date('2025-01-15T11:45:00'),
  },
]

// Add more conversations
const customerNames = [
  'Rina Sari', 'Andi Pratama', 'Doni Kurniawan', 'Indah Pertiwi', 'Fajar Nugroho',
  'Lestari Wati', 'Hadi Santoso', 'Dewi Maharani', 'Bagas Setiawan', 'Ratna Sari',
  'Sinta Dewi', 'Diki Firmansyah', 'Nina Wulandari', 'Yoga Pratama', 'Lia Marlina'
]

const platforms = ['shopee', 'tiktok', 'tokopedia'] as const
const greetings = [
  'Halo, saya Mau tanya', 'Selamat pagi', 'Siang kak', 'Malam', 'Halo',
  'Mau nanya stoknya', 'Ada diskon tidak?', 'Bisa negotiate harga?',
  'Kapan ready lagi?', 'Barangnya original?'
]

const responses = [
  'Halo! Ada yang bisa kami bantu?', 'Selamat pagi! Stok ready kok',
  'Siang! Barangnya original 100%', 'Malam! Ada pertanyaan apa?',
  'Halo! Harga sudah terbaik', 'Tentu bisa dicek',
  'Ada promo bundle loh', 'Bisa diskusi lebih lanjut',
  'Segera restock', 'Original garantree'
]

for (let i = 6; i <= 20; i++) {
  const platform = platforms[Math.floor(Math.random() * platforms.length)]
  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)]
  const isUnread = Math.random() > 0.6
  const lastMessageTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  
  const conversation: Conversation = {
    id: `conv-${i}`,
    platform,
    platformConversationId: `${platform.toUpperCase()}-CONV-${i.toString().padStart(3, '0')}`,
    customerName,
    customerAvatar: `https://images.unsplash.com/photo-${1500000000000 + i}?w=150&h=150&fit=crop&crop=face`,
    lastMessage: Math.random() > 0.5 ? greetings[Math.floor(Math.random() * greetings.length)] : responses[Math.floor(Math.random() * responses.length)],
    lastMessageTime,
    unreadCount: isUnread ? Math.floor(Math.random() * 3) + 1 : 0,
    createdAt: new Date(lastMessageTime.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000),
    updatedAt: lastMessageTime,
  }
  
  sampleConversations.push(conversation)
  
  // Generate messages for this conversation
  const messageCount = Math.floor(Math.random() * 10) + 2
  for (let j = 1; j <= messageCount; j++) {
    const isCustomer = j % 2 === 1 // Odd messages from customer
    const messageTime = new Date(conversation.createdAt.getTime() + (j - 1) * 60 * 60 * 1000)
    
    sampleMessages.push({
      id: `msg-${i}-${j}`,
      conversationId: conversation.id,
      platform,
      platformMessageId: `${platform.toUpperCase()}-MSG-${i}-${j}`,
      sender: isCustomer ? 'customer' : 'seller',
      senderName: isCustomer ? customerName : 'AIOStore',
      content: isCustomer ? 
        greetings[Math.floor(Math.random() * greetings.length)] : 
        responses[Math.floor(Math.random() * responses.length)],
      isRead: !isUnread || j < messageCount - 1,
      timestamp: messageTime,
    })
  }
}

export const mockConversations: Conversation[] = sampleConversations
export const mockMessages: Message[] = sampleMessages

// Mock data utilities
export const getConversationById = (id: string) => {
  return mockConversations.find(c => c.id === id)
}

export const getMessagesByConversationId = (conversationId: string) => {
  return mockMessages.filter(m => m.conversationId === conversationId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

export const filterConversations = (filters: {
  search?: string;
  platform?: 'shopee' | 'tiktok' | 'tokopedia' | 'lazada';
  unreadOnly?: boolean;
}) => {
  let filtered = [...mockConversations]
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(c => 
      c.customerName.toLowerCase().includes(search)
    )
  }
  
  if (filters.platform) {
    filtered = filtered.filter(c => c.platform === filters.platform)
  }
  
  if (filters.unreadOnly) {
    filtered = filtered.filter(c => c.unreadCount > 0)
  }
  
  return filtered.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime())
}

export const markAsRead = (conversationId: string) => {
  const conversation = mockConversations.find(c => c.id === conversationId)
  if (conversation && conversation.unreadCount > 0) {
    conversation.unreadCount = 0
    // Mark messages as read
    mockMessages.forEach(message => {
      if (message.conversationId === conversationId) {
        message.isRead = true
      }
    })
    return conversation
  }
  return null
}

export const addMessage = (conversationId: string, content: string, sender: 'customer' | 'seller' = 'seller') => {
  const conversation = mockConversations.find(c => c.id === conversationId)
  if (conversation) {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      platform: conversation.platform,
      platformMessageId: `${conversation.platform.toUpperCase()}-MSG-${Date.now()}`,
      sender,
      senderName: sender === 'customer' ? conversation.customerName : 'AIOStore',
      content,
      isRead: true,
      timestamp: new Date(),
    }
    
    mockMessages.push(newMessage)
    conversation.lastMessage = content
    conversation.lastMessageTime = newMessage.timestamp
    conversation.updatedAt = newMessage.timestamp
    
    if (sender === 'customer') {
      conversation.unreadCount++
    }
    
    return newMessage
  }
  return null
}