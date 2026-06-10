import { Heart, MessageSquare, Bookmark, MoreHorizontal, CheckCircle2, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FormEvent, ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { apiRequest } from '../lib/api';
import ImageLightbox from './ImageLightbox';

interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
  };
}

function LinkOrDiv({to, className, children}: {to?: string; className?: string; children: ReactNode}) {
  if (!to) return <div className={className}>{children}</div>;
  return <Link to={to} className={className}>{children}</Link>;
}

function LinkOrSpan({to, className, children}: {to?: string; className?: string; children: ReactNode}) {
  if (!to) return <span className={className}>{children}</span>;
  return <Link to={to} className={className}>{children}</Link>;
}

export interface SocialPostProps {
  key?: string | number;
  id?: string;
  author: {
    id?: string;
    name: string;
    handle: string;
    avatar: string;
    isVerified?: boolean;
    isProUser?: boolean;
    role?: 'USER' | 'ADMIN';
  };
  content: string;
  image?: string;
  images?: string[];
  video?: string;
  type: 'story' | 'garage' | 'review' | 'qa' | 'maintenance' | 'marketplace';
  timestamp: string;
  likes: number;
  comments: number;
  shares?: number;
  category: string;
  tags?: string[];
  isLikedInitial?: boolean;
  isBookmarkedInitial?: boolean;
  commentItems?: PostComment[];
  marketplaceListing?: {
    title: string;
    price: string;
    image: string;
  };
  onDeleted?: (id: string) => void;
  onCaptionUpdated?: (id: string, content: string) => void;
}

export default function SocialPost({
  id,
  author,
  content,
  image,
  images,
  type,
  timestamp,
  likes: initialLikes,
  comments,
  category,
  tags = [],
  isLikedInitial = false,
  isBookmarkedInitial = false,
  commentItems = [],
  marketplaceListing,
  onDeleted,
  onCaptionUpdated,
}: SocialPostProps) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(initialLikes);
  const [commentCount, setCommentCount] = useState(comments);
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitial);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState(commentItems);
  const [commentContent, setCommentContent] = useState('');
  const [interactionError, setInteractionError] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [displayContent, setDisplayContent] = useState(content);
  const [captionDraft, setCaptionDraft] = useState(content);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [isSavingCaption, setIsSavingCaption] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUserAvatar = currentUser?.avatar ?? `https://i.pravatar.cc/100?u=${encodeURIComponent(currentUser?.email ?? 'guest')}`;
  const authorProfilePath = author.id ? `/profile/${author.id}` : undefined;
  const canManagePost = Boolean(
    id && currentUser && (currentUser.id === author.id || currentUser.role === 'ADMIN'),
  );

  const saveCaption = async () => {
    const nextContent = captionDraft.trim();
    if (!id || !nextContent || isSavingCaption) return;

    setInteractionError('');
    setIsSavingCaption(true);
    try {
      const updated = await apiRequest<{id: string; content: string}>(`/posts/${id}/caption`, {
        method: 'PATCH',
        body: JSON.stringify({content: nextContent}),
      });
      setDisplayContent(updated.content);
      setCaptionDraft(updated.content);
      setIsEditingCaption(false);
      onCaptionUpdated?.(id, updated.content);
    } catch (error) {
      setInteractionError(error instanceof Error ? error.message : 'Không thể sửa nội dung bài viết.');
    } finally {
      setIsSavingCaption(false);
    }
  };

  const deletePost = async () => {
    if (!id || isDeletingPost || !window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    setInteractionError('');
    setIsDeletingPost(true);
    try {
      await apiRequest(`/posts/${id}`, {method: 'DELETE'});
      onDeleted?.(id);
    } catch (error) {
      setInteractionError(error instanceof Error ? error.message : 'Không thể xóa bài viết.');
      setIsDeletingPost(false);
    }
  };

  const requireLogin = () => {
    if (isAuthenticated) return true;
    navigate('/login');
    return false;
  };

  const toggleLike = async () => {
    if (!requireLogin()) return;
    setInteractionError('');

    if (!id) {
      setIsLiked((current) => !current);
      setLikes((current) => (isLiked ? Math.max(0, current - 1) : current + 1));
      return;
    }

    try {
      const result = await apiRequest<{liked: boolean; count: number}>(`/posts/${id}/like`, {method: 'POST'});
      setIsLiked(result.liked);
      setLikes(result.count);
    } catch (error) {
      setInteractionError(error instanceof Error ? error.message : 'Không thể cập nhật lượt thích.');
    }
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requireLogin()) return;
    const nextContent = commentContent.trim();
    if (!nextContent || isSubmittingComment) return;

    setInteractionError('');
    setIsSubmittingComment(true);
    try {
      if (!id) {
        const localComment: PostComment = {
          id: crypto.randomUUID(),
          content: nextContent,
          createdAt: new Date().toISOString(),
          author: {
            id: currentUser?.id ?? 'local',
            name: currentUser?.name ?? 'Người dùng',
            handle: currentUser?.email.split('@')[0] ?? 'user',
            avatar: currentUserAvatar,
          },
        };
        setCommentsList((current) => [...current, localComment]);
        setCommentCount((current) => current + 1);
      } else {
        const result = await apiRequest<{comment: PostComment; count: number}>(`/posts/${id}/comments`, {
          method: 'POST',
          body: JSON.stringify({content: nextContent}),
        });
        setCommentsList((current) => [...current, result.comment]);
        setCommentCount(result.count);
      }
      setCommentContent('');
    } catch (error) {
      setInteractionError(error instanceof Error ? error.message : 'Không thể thêm bình luận.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleBookmark = async () => {
    if (!requireLogin()) return;
    if (!id) {
      setIsBookmarked((current) => !current);
      return;
    }
    try {
      const result = await apiRequest<{bookmarked: boolean}>(`/posts/${id}/bookmark`, {method: 'POST'});
      setIsBookmarked(result.bookmarked);
    } catch (error) {
      setInteractionError(error instanceof Error ? error.message : 'Không thể lưu bài viết.');
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case 'story': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'garage': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'review': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'qa': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'maintenance': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'marketplace': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-white/5 text-on-surface-variant border-white/10';
    }
  };

  const imageSources = (images?.length ? images : image ? [image] : []).filter(Boolean);
  const markImageFailed = (source: string) => {
    setFailedImages((current) => new Set(current).add(source));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="social-card group mb-6"
      id={id ? `post-${id}` : undefined}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <LinkOrDiv to={authorProfilePath} className="relative">
            <img src={author.avatar} alt={author.name} className="user-avatar" />
            {author.isProUser && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-[8px] font-bold p-0.5 rounded-full ring-2 ring-background">
                <CheckCircle2 className="w-2.5 h-2.5 text-on-primary" />
              </div>
            )}
          </LinkOrDiv>
          <div>
            <div className="flex items-center gap-1.5">
              <LinkOrSpan to={authorProfilePath} className="font-bold text-sm hover:text-primary cursor-pointer transition-colors">
                {author.name}
              </LinkOrSpan>
              {author.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400/10" />}
              <span className="text-[10px] text-on-surface-variant font-mono">@{author.handle}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono uppercase tracking-tighter">
              <span>{timestamp}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full border ${getBadgeColor()}`}>
                {author.role === 'ADMIN' ? 'Admin' : author.isVerified ? 'Đã xác thực' : 'Thành viên'}
              </span>
            </div>
          </div>
        </div>
        {canManagePost && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPostMenuOpen((current) => !current)}
              className="interactive-icon"
              aria-label="Quản lý bài viết"
            >
              <MoreHorizontal className="w-4 h-4 text-on-surface-variant" />
            </button>
            <AnimatePresence>
              {isPostMenuOpen && (
                <motion.div
                  initial={{opacity: 0, y: -6}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -6}}
                  className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-white/10 bg-surface-container-high shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCaptionDraft(displayContent);
                      setIsEditingCaption(true);
                      setIsPostMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs hover:bg-white/5"
                  >
                    <Pencil className="h-4 w-4" /> Sửa caption
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingPost}
                    onClick={() => void deletePost()}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" /> {isDeletingPost ? 'Đang xóa...' : 'Xóa bài viết'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="space-y-4">
        {isEditingCaption ? (
          <div className="space-y-3 rounded-2xl border border-primary/20 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-primary">Chỉnh sửa caption</p>
              <button
                type="button"
                onClick={() => {
                  setCaptionDraft(displayContent);
                  setIsEditingCaption(false);
                }}
                className="interactive-icon"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={captionDraft}
              onChange={(event) => setCaptionDraft(event.target.value)}
              maxLength={5000}
              className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-background px-4 py-3 text-sm focus:border-primary/40 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsEditingCaption(false)} className="btn-secondary px-4 py-2 text-xs">
                Hủy
              </button>
              <button
                type="button"
                disabled={!captionDraft.trim() || isSavingCaption}
                onClick={() => void saveCaption()}
                className="btn-primary px-4 py-2 text-xs disabled:opacity-50"
              >
                {isSavingCaption ? 'Đang lưu...' : 'Lưu caption'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-post whitespace-pre-wrap">{displayContent}</p>
        )}
        
        {/* Images */}
        {imageSources.length > 0 && (
          <div className={`rounded-2xl overflow-hidden border border-white/5 bg-surface-container ${imageSources.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
             {imageSources.length > 1 ? (
               imageSources.map((img, idx) => (
                 failedImages.has(img) ? (
                   <div key={img} className="aspect-square w-full bg-white/[0.03] flex items-center justify-center px-4 text-center text-xs text-on-surface-variant">
                     Ảnh không khả dụng
                   </div>
                 ) : (
                   <button type="button" key={img} onClick={() => setLightboxIndex(idx)} className="overflow-hidden">
                   <img
                     src={img}
                     alt={`post content ${idx + 1}`}
                     loading="lazy"
                     decoding="async"
                     onError={() => markImageFailed(img)}
                     className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-700 cursor-zoom-in"
                   /></button>
                 )
               ))
             ) : (
               failedImages.has(imageSources[0]) ? (
                 <div className="min-h-64 w-full bg-white/[0.03] flex items-center justify-center px-4 text-center text-sm text-on-surface-variant">
                   Ảnh không khả dụng
                 </div>
               ) : (
                 <button type="button" onClick={() => setLightboxIndex(0)} className="block w-full overflow-hidden">
                 <img
                   src={imageSources[0]}
                   alt="post content"
                   loading="lazy"
                   decoding="async"
                   onError={() => markImageFailed(imageSources[0])}
                   className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-700 cursor-zoom-in"
                 /></button>
               )
             )}
          </div>
        )}

        {/* Marketplace Integration */}
        {marketplaceListing && (
          <div className="p-4 rounded-2xl bg-surface-container-high border border-primary/20 flex items-center justify-between group/link cursor-pointer hover:bg-white/5 transition-all">
            <div className="flex items-center gap-4">
              <img src={marketplaceListing.image} alt={marketplaceListing.title} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
              <div>
                <span className="text-[9px] font-mono uppercase text-primary font-bold">Tin bán xe gợi ý</span>
                <h4 className="font-bold text-sm group-hover/link:text-primary transition-colors">{marketplaceListing.title}</h4>
                <p className="text-xs text-on-surface-variant font-mono">{marketplaceListing.price}</p>
              </div>
            </div>
            <button className="btn-secondary py-2 px-4 text-[10px]">Xem xe</button>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map(tag => (
              <span key={tag} className="text-primary text-[11px] font-medium hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Interactions */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-4">
          <button 
            onClick={toggleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${isLiked ? 'text-red-400 bg-red-400/10' : 'text-on-surface-variant hover:bg-white/5'}`}
          >
            <motion.div animate={{ scale: isLiked ? [1, 1.4, 1] : 1 }}>
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </motion.div>
            <span className="text-xs font-medium">{likes}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-white/5 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-medium">{commentCount}</span>
          </button>

        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleBookmark}
            className={`interactive-icon ${isBookmarked ? 'text-primary' : 'text-on-surface-variant'}`}
            title={isBookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Simplified Comment Preview (Mock) */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
              {commentsList.map((comment) => (
                <div key={comment.id} className="flex gap-3 px-2">
                  <Link to={`/profile/${comment.author.id}`}>
                    <img src={comment.author.avatar} className="w-8 h-8 rounded-full border border-white/10 object-cover" alt={comment.author.name} />
                  </Link>
                  <div className="flex-grow rounded-xl bg-surface-container px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${comment.author.id}`} className="text-xs font-bold hover:text-primary transition-colors">
                        {comment.author.name}
                      </Link>
                      <span className="text-[10px] text-on-surface-variant">@{comment.author.handle}</span>
                    </div>
                    <p className="mt-1 text-sm text-on-surface">{comment.content}</p>
                  </div>
                </div>
              ))}
              <form onSubmit={submitComment} className="flex gap-3 px-2">
                <img src={currentUserAvatar} className="w-8 h-8 rounded-full border border-white/10 object-cover" alt={currentUser?.name ?? 'Khách'} />
                <div className="flex-grow flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Viết bình luận..." 
                    value={commentContent}
                    onChange={(event) => setCommentContent(event.target.value)}
                    maxLength={2000}
                    className="w-full bg-surface-container rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 border border-white/5"
                  />
                  <button
                    type="submit"
                    disabled={!commentContent.trim() || isSubmittingComment}
                    className="btn-primary px-4 py-2 disabled:opacity-50"
                  >
                    {isSubmittingComment ? '...' : 'Gửi'}
                  </button>
                </div>
              </form>
              {interactionError && <p className="px-2 text-xs text-red-300">{interactionError}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ImageLightbox images={imageSources} activeIndex={lightboxIndex} onChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} alt="Ảnh bài viết" />
    </motion.div>
  );
}
