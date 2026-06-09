import {Prisma} from '@prisma/client';
import {prisma} from '../config/prisma';
import {notificationService} from './notification.service';

const participantSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
} satisfies Prisma.UserSelect;

const conversationInclude = {
  listing: {
    select: {
      id: true,
      title: true,
      price: true,
      vehicle: {select: {image: true}},
    },
  },
  buyer: {select: participantSelect},
  seller: {select: participantSelect},
  messages: {
    orderBy: {createdAt: 'desc' as const},
    take: 1,
    include: {sender: {select: participantSelect}},
  },
} satisfies Prisma.ConversationInclude;

const messageInclude = {
  sender: {select: participantSelect},
} satisfies Prisma.MessageInclude;

export const messageService = {
  listConversations(userId: string) {
    return prisma.conversation.findMany({
      where: {OR: [{buyerId: userId}, {sellerId: userId}]},
      include: conversationInclude,
      orderBy: {updatedAt: 'desc'},
    });
  },

  async startConversation(listingId: string, buyerId: string) {
    const listing = await prisma.vehicleListing.findUnique({
      where: {id: listingId},
      select: {id: true, sellerId: true},
    });

    if (!listing) return null;
    if (listing.sellerId === buyerId) {
      throw new Error('SELF_CONVERSATION');
    }

    return prisma.conversation.upsert({
      where: {
        listingId_buyerId_sellerId: {
          listingId,
          buyerId,
          sellerId: listing.sellerId,
        },
      },
      create: {listingId, buyerId, sellerId: listing.sellerId},
      update: {},
      include: conversationInclude,
    });
  },

  async startDirectConversation(userId: string, currentUserId: string) {
    if (userId === currentUserId) throw new Error('SELF_CONVERSATION');
    const target = await prisma.user.findUnique({where: {id: userId}, select: {id: true}});
    if (!target) return null;

    const [buyerId, sellerId] = [currentUserId, userId].sort();
    const directKey = `${buyerId}:${sellerId}`;
    return prisma.conversation.upsert({
      where: {directKey},
      create: {directKey, buyerId, sellerId},
      update: {},
      include: conversationInclude,
    });
  },

  getConversation(id: string, userId: string) {
    return prisma.conversation.findFirst({
      where: {id, OR: [{buyerId: userId}, {sellerId: userId}]},
      include: conversationInclude,
    });
  },

  async listMessages(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {id: conversationId, OR: [{buyerId: userId}, {sellerId: userId}]},
      select: {id: true},
    });
    if (!conversation) return null;

    await prisma.message.updateMany({
      where: {conversationId, senderId: {not: userId}, readAt: null},
      data: {readAt: new Date()},
    });

    return prisma.message.findMany({
      where: {conversationId},
      include: messageInclude,
      orderBy: {createdAt: 'asc'},
      take: 200,
    });
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {id: conversationId, OR: [{buyerId: senderId}, {sellerId: senderId}]},
      select: {id: true, buyerId: true, sellerId: true, listingId: true},
    });
    if (!conversation) return null;

    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {conversationId, senderId, content},
        include: messageInclude,
      });
      await tx.conversation.update({
        where: {id: conversationId},
        data: {updatedAt: new Date()},
      });
      const recipientId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;
      await notificationService.create({
        recipientId,
        actorId: senderId,
        type: 'message',
        title: 'Tin nhắn mới',
        message: conversation.listingId ? 'Đã gửi tin nhắn về một tin chợ xe' : 'Đã gửi cho bạn một tin nhắn',
        link: `/profile/${senderId}`,
      });
      return message;
    });
  },
};
