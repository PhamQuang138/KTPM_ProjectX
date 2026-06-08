import {PostStatus} from '@prisma/client';
import {prisma} from '../config/prisma';

export const adminService = {
  async getDashboard() {
    const [users, posts, vehicles, draftPosts, publishedPosts] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.vehicleListing.count(),
      prisma.post.count({where: {status: PostStatus.DRAFT}}),
      prisma.post.count({where: {status: PostStatus.PUBLISHED}}),
    ]);

    return {users, posts, vehicles, draftPosts, publishedPosts};
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
          select: {posts: true, vehicles: true},
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
          select: {posts: true, vehicles: true},
        },
      },
    });
  },

  listPosts() {
    return prisma.post.findMany({
      include: {
        author: {select: {id: true, name: true, email: true, avatar: true}},
        images: true,
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

  listVehicles() {
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

  deleteUser(id: string) {
    return prisma.user.delete({where: {id}});
  },
};
