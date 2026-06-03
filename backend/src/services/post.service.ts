import {randomUUID} from 'crypto';
import {CommunityPost} from '../types/domain';
import {communityPostsSeed} from '../data/seeds';

const posts: CommunityPost[] = [...communityPostsSeed];

export interface CreatePostInput {
  author?: Partial<CommunityPost['author']>;
  content: string;
  image?: string;
  images?: string[];
  video?: string;
  type?: CommunityPost['type'];
  category?: string;
  tags?: string[];
  marketplaceListing?: CommunityPost['marketplaceListing'];
}

const defaultAuthor: CommunityPost['author'] = {
  id: 'user-alex-rivera',
  name: 'Alex Rivera',
  handle: 'arivera_auto',
  avatar: 'https://i.pravatar.cc/200?u=me',
  isVerified: true,
  isProUser: true,
};

export const postService = {
  list(type?: string) {
    return type ? posts.filter((post) => post.type === type) : posts;
  },

  getById(id: string) {
    return posts.find((post) => post.id === id);
  },

  create(input: CreatePostInput) {
    const now = new Date().toISOString();
    const post: CommunityPost = {
      id: randomUUID(),
      author: {...defaultAuthor, ...input.author},
      content: input.content,
      image: input.image,
      images: input.images,
      video: input.video,
      type: input.type ?? 'story',
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      shares: 0,
      category: input.category ?? 'Community',
      tags: input.tags ?? [],
      marketplaceListing: input.marketplaceListing,
      createdAt: now,
      updatedAt: now,
    };

    posts.unshift(post);
    return post;
  },

  like(id: string) {
    const post = this.getById(id);
    if (!post) return undefined;

    post.likes += 1;
    post.updatedAt = new Date().toISOString();
    return post;
  },

  addComment(id: string) {
    const post = this.getById(id);
    if (!post) return undefined;

    post.comments += 1;
    post.updatedAt = new Date().toISOString();
    return post;
  },
};
