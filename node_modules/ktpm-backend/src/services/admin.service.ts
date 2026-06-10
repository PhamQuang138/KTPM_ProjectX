import {ArticleStatus, PostStatus} from '@prisma/client';
import {prisma} from '../config/prisma';

export const adminService = {
  async getDashboard() {
    const [
      users,
      posts,
      garageVehicles,
      vehicleListings,
      articles,
      comments,
      ratings,
      follows,
      draftPosts,
      publishedPosts,
      draftArticles,
      publishedArticles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.garageVehicle.count(),
      prisma.vehicleListing.count(),
      prisma.article.count(),
      prisma.postComment.count(),
      prisma.userRating.count(),
      prisma.userFollow.count(),
      prisma.post.count({where: {status: PostStatus.DRAFT}}),
      prisma.post.count({where: {status: PostStatus.PUBLISHED}}),
      prisma.article.count({where: {status: ArticleStatus.DRAFT}}),
      prisma.article.count({where: {status: ArticleStatus.PUBLISHED}}),
    ]);

    return {
      users,
      posts,
      garageVehicles,
      vehicleListings,
      articles,
      comments,
      ratings,
      follows,
      draftPosts,
      publishedPosts,
      draftArticles,
      publishedArticles,
    };
  },

  listUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isVerifiedProfessional: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            garageVehicles: true,
            vehicleListings: true,
            postComments: true,
            postLikes: true,
            postShares: true,
            followers: true,
            following: true,
          },
        },
      },
      orderBy: {createdAt: 'desc'},
    });
  },

  getUserById(id: string) {
    return prisma.user.findUnique({
      where: {id},
      select: {id: true, role: true},
    });
  },

  countAdmins() {
    return prisma.user.count({where: {role: 'ADMIN'}});
  },

  updateUserVerification(id: string, isVerifiedProfessional: boolean) {
    return prisma.user.update({
      where: {id},
      data: {isVerifiedProfessional},
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isVerifiedProfessional: true,
        createdAt: true,
        _count: {
          select: {posts: true, garageVehicles: true, vehicleListings: true},
        },
      },
    });
  },

  listPosts() {
    return prisma.post.findMany({
      include: {
        author: {select: {id: true, name: true, email: true, avatar: true}},
        images: true,
        _count: {select: {likes: true, comments: true, shares: true}},
      },
      orderBy: {createdAt: 'desc'},
    });
  },

  updatePostStatus(id: string, status: PostStatus) {
    return prisma.post.update({
      where: {id},
      data: {status},
      include: {
        author: {select: {id: true, name: true, email: true}},
        images: true,
      },
    });
  },

  deletePost(id: string) {
    return prisma.post.delete({where: {id}});
  },

  listVehicleListings() {
    return prisma.vehicleListing.findMany({
      include: {
        seller: {select: {id: true, name: true, email: true, avatar: true}},
        vehicle: true,
      },
      orderBy: {createdAt: 'desc'},
    });
  },

  deleteVehicle(id: string) {
    return prisma.vehicleListing.delete({where: {id}});
  },

  updateVehicleListingStatus(id: string, status: string) {
    return prisma.vehicleListing.update({
      where: {id},
      data: {status},
      include: {
        seller: {select: {id: true, name: true, email: true, avatar: true}},
        vehicle: true,
      },
    });
  },

  listGarageVehicles() {
    return prisma.garageVehicle.findMany({
      include: {
        owner: {select: {id: true, name: true, email: true, avatar: true}},
        listings: true,
      },
      orderBy: {createdAt: 'desc'},
    });
  },

  updateGarageVehicleStatus(id: string, status: string) {
    return prisma.garageVehicle.update({
      where: {id},
      data: {status},
      include: {
        owner: {select: {id: true, name: true, email: true, avatar: true}},
        listings: true,
      },
    });
  },

  deleteGarageVehicle(id: string) {
    return prisma.garageVehicle.delete({where: {id}});
  },

  listArticles() {
    return prisma.article.findMany({
      orderBy: [{publishedAt: 'desc'}, {createdAt: 'desc'}],
    });
  },

  updateArticleStatus(id: string, status: ArticleStatus) {
    return prisma.article.update({
      where: {id},
      data: {
        status,
        publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : null,
      },
    });
  },

  deleteArticle(id: string) {
    return prisma.article.delete({where: {id}});
  },

  listComments() {
    return prisma.postComment.findMany({
      include: {
        user: {select: {id: true, name: true, email: true, avatar: true}},
        post: {select: {id: true, title: true}},
      },
      orderBy: {createdAt: 'desc'},
    });
  },

  deleteComment(id: string) {
    return prisma.postComment.delete({where: {id}});
  },

  listRatings() {
    return prisma.userRating.findMany({
      include: {
        rater: {select: {id: true, name: true, email: true}},
        targetUser: {select: {id: true, name: true, email: true}},
      },
      orderBy: {createdAt: 'desc'},
    });
  },

  deleteRating(id: string) {
    return prisma.userRating.delete({where: {id}});
  },

  listFollows() {
    return prisma.userFollow.findMany({
      include: {
        follower: {select: {id: true, name: true, email: true}},
        following: {select: {id: true, name: true, email: true}},
      },
      orderBy: {createdAt: 'desc'},
    });
  },

  deleteFollow(id: string) {
    return prisma.userFollow.delete({where: {id}});
  },

  deleteUser(id: string) {
    return prisma.user.delete({where: {id}});
  },
};
