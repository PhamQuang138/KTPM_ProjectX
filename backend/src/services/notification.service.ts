import {prisma} from '../config/prisma';

export interface CreateNotificationInput {
  recipientId: string;
  actorId?: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export const notificationService = {
  async create(input: CreateNotificationInput) {
    if (input.actorId && input.actorId === input.recipientId) return Promise.resolve(null);
    const preferences = await prisma.user.findUnique({
      where: {id: input.recipientId},
      select: {notifySocial: true, notifyMarketplace: true, notifyMessages: true},
    });
    if (!preferences) return null;
    if (input.type === 'message' && !preferences.notifyMessages) return null;
    if (input.type === 'marketplace' && !preferences.notifyMarketplace) return null;
    if (['like', 'comment', 'follow'].includes(input.type) && !preferences.notifySocial) return null;
    return prisma.notification.create({data: input});
  },

  async list(userId: string) {
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {recipientId: userId},
        include: {actor: {select: {id: true, name: true, email: true, avatar: true}}},
        orderBy: {createdAt: 'desc'},
        take: 50,
      }),
      prisma.notification.count({where: {recipientId: userId, readAt: null}}),
    ]);
    return {items, unreadCount};
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: {recipientId: userId, readAt: null},
      data: {readAt: new Date()},
    });
  },
};
