"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = void 0;
const crypto_1 = require("crypto");
const seeds_1 = require("../data/seeds");
const posts = [...seeds_1.communityPostsSeed];
const defaultAuthor = {
    id: 'user-alex-rivera',
    name: 'Alex Rivera',
    handle: 'arivera_auto',
    avatar: 'https://i.pravatar.cc/200?u=me',
    isVerified: true,
    isProUser: true,
};
exports.postService = {
    list(type) {
        return type ? posts.filter((post) => post.type === type) : posts;
    },
    getById(id) {
        return posts.find((post) => post.id === id);
    },
    create(input) {
        const now = new Date().toISOString();
        const post = {
            id: (0, crypto_1.randomUUID)(),
            author: { ...defaultAuthor, ...input.author },
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
    like(id) {
        const post = this.getById(id);
        if (!post)
            return undefined;
        post.likes += 1;
        post.updatedAt = new Date().toISOString();
        return post;
    },
    addComment(id) {
        const post = this.getById(id);
        if (!post)
            return undefined;
        post.comments += 1;
        post.updatedAt = new Date().toISOString();
        return post;
    },
};
//# sourceMappingURL=post.service.js.map