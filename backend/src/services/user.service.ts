import {prisma} from '../config/prisma';
import {notificationService} from './notification.service';

const getRating = async (targetUserId: string, viewerId?: string) => {
  const [targetUser, aggregate, myRating] = await Promise.all([
    prisma.user.findUnique({
      where: {id: targetUserId},
      select: {id: true},
    }),
    prisma.userRating.aggregate({
      where: {targetUserId},
      _avg: {score: true},
      _count: {score: true},
    }),
    viewerId
      ? prisma.userRating.findUnique({
          where: {raterId_targetUserId: {raterId: viewerId, targetUserId}},
          select: {score: true},
        })
      : Promise.resolve(null),
  ]);

  if (!targetUser) return undefined;

  return {
    averageRating: aggregate._avg.score ?? 0,
    totalRatings: aggregate._count.score,
    myRating: myRating?.score ?? null,
  };
};

export const userService = {
  getOwnSettings(userId: string) {
    return prisma.user.findUniqueOrThrow({
      where: {id: userId},
      select: {
        themePreference: true,
        displayDensity: true,
        fontScale: true,
        autoOpenChatbot: true,
        notifySocial: true,
        notifyMarketplace: true,
        notifyMessages: true,
      },
    });
  },

  updateOwnSettings(
    userId: string,
    input: {
      themePreference?: string;
      displayDensity?: string;
      fontScale?: string;
      autoOpenChatbot?: boolean;
      notifySocial?: boolean;
      notifyMarketplace?: boolean;
      notifyMessages?: boolean;
    },
  ) {
    return prisma.user.update({
      where: {id: userId},
      data: input,
      select: {
        themePreference: true,
        displayDensity: true,
        fontScale: true,
        autoOpenChatbot: true,
        notifySocial: true,
        notifyMarketplace: true,
        notifyMessages: true,
      },
    });
  },

  getFollowSuggestions(viewerId: string) {
    return prisma.user.findMany({
      where: {
        id: {not: viewerId},
        followers: {none: {followerId: viewerId}},
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isVerifiedProfessional: true,
        _count: {select: {followers: true, posts: true}},
      },
      orderBy: [
        {role: 'desc'},
        {isVerifiedProfessional: 'desc'},
        {posts: {_count: 'desc'}},
      ],
      take: 5,
    });
  },

  searchUsers(query: string, viewerId: string) {
    const search = query.trim();
    if (search.length < 2) return Promise.resolve([]);
    return prisma.user.findMany({
      where: {
        id: {not: viewerId},
        OR: [
          {name: {contains: search, mode: 'insensitive'}},
          {email: {contains: search, mode: 'insensitive'}},
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isVerifiedProfessional: true,
      },
      orderBy: [
        {role: 'desc'},
        {isVerifiedProfessional: 'desc'},
        {name: 'asc'},
      ],
      take: 8,
    });
  },

  async getPublicProfile(userId: string, viewerId?: string) {
    const [user, rating, followersCount, followingCount, isFollowing] = await Promise.all([
      prisma.user.findUnique({
        where: {id: userId},
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bannerImage: true,
          bio: true,
          location: true,
          focusBrands: true,
          isVerifiedProfessional: true,
          role: true,
          createdAt: true,
          garageVehicles: {
            orderBy: {createdAt: 'desc'},
            take: 6,
            select: {
              id: true,
              title: true,
              description: true,
              image: true,
              condition: true,
              status: true,
              specs: true,
            },
          },
          vehicleListings: {
            where: {status: {not: 'Hidden'}},
            orderBy: {createdAt: 'desc'},
            take: 6,
            include: {
              vehicle: true,
            },
          },
          _count: {
            select: {
              posts: true,
              garageVehicles: true,
              vehicleListings: true,
            },
          },
        },
      }),
      getRating(userId, viewerId),
      prisma.userFollow.count({where: {followingId: userId}}),
      prisma.userFollow.count({where: {followerId: userId}}),
      viewerId
        ? prisma.userFollow.findUnique({
            where: {followerId_followingId: {followerId: viewerId, followingId: userId}},
            select: {id: true},
          })
        : Promise.resolve(null),
    ]);

    if (!user) return undefined;

    return {
      ...user,
      rating,
      social: {
        followers: followersCount,
        following: followingCount,
        posts: user._count.posts,
        isFollowing: Boolean(isFollowing),
      },
    };
  },

  async followUser(targetUserId: string, followerId: string) {
    const targetUser = await prisma.user.findUnique({
      where: {id: targetUserId},
      select: {id: true},
    });
    if (!targetUser) return undefined;

    await prisma.userFollow.upsert({
      where: {followerId_followingId: {followerId, followingId: targetUserId}},
      update: {},
      create: {followerId, followingId: targetUserId},
    });
    await notificationService.create({
      recipientId: targetUserId,
      actorId: followerId,
      type: 'follow',
      title: 'Người theo dõi mới',
      message: 'Đã bắt đầu theo dõi bạn',
      link: `/profile/${followerId}`,
    });

    const [followers, following] = await Promise.all([
      prisma.userFollow.count({where: {followingId: targetUserId}}),
      prisma.userFollow.count({where: {followerId: targetUserId}}),
    ]);

    return {followers, following, isFollowing: true};
  },

  async unfollowUser(targetUserId: string, followerId: string) {
    const targetUser = await prisma.user.findUnique({
      where: {id: targetUserId},
      select: {id: true},
    });
    if (!targetUser) return undefined;

    await prisma.userFollow.deleteMany({
      where: {followerId, followingId: targetUserId},
    });

    const [followers, following] = await Promise.all([
      prisma.userFollow.count({where: {followingId: targetUserId}}),
      prisma.userFollow.count({where: {followerId: targetUserId}}),
    ]);

    return {followers, following, isFollowing: false};
  },

  updateOwnProfile(
    userId: string,
    input: {
      avatar?: string | null;
      bannerImage?: string | null;
      bio?: string | null;
      location?: string | null;
      focusBrands?: string[];
    },
  ) {
    return prisma.user.update({
      where: {id: userId},
      data: {
        avatar: input.avatar === undefined ? undefined : input.avatar?.trim() || null,
        bannerImage: input.bannerImage === undefined ? undefined : input.bannerImage?.trim() || null,
        bio: input.bio === undefined ? undefined : input.bio?.trim() || null,
        location: input.location === undefined ? undefined : input.location?.trim() || null,
        focusBrands: input.focusBrands === undefined ? undefined : input.focusBrands,
      },
      select: {
        id: true,
        avatar: true,
        bannerImage: true,
        bio: true,
        location: true,
        focusBrands: true,
      },
    });
  },

  async getRating(targetUserId: string, viewerId?: string) {
    return getRating(targetUserId, viewerId);
  },

  async rateUser(targetUserId: string, raterId: string, score: number) {
    const targetUser = await prisma.user.findUnique({
      where: {id: targetUserId},
      select: {id: true},
    });

    if (!targetUser) return undefined;

    await prisma.userRating.upsert({
      where: {raterId_targetUserId: {raterId, targetUserId}},
      update: {score},
      create: {raterId, targetUserId, score},
    });

    return getRating(targetUserId, raterId);
  },
};
