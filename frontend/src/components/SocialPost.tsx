import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, CheckCircle2, ChevronDown, Repeat2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export interface SocialPostProps {
  key?: string | number;
  author: {
    name: string;
    handle: string;
    avatar: string;
    isVerified?: boolean;
    isProUser?: boolean;
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
  marketplaceListing?: {
    title: string;
    price: string;
    image: string;
  };
}

export default function SocialPost({
  author,
  content,
  image,
  images,
  type,
  timestamp,
  likes: initialLikes,
  comments,
  shares = 3,
  category,
  tags = [],
  isLikedInitial = false,
  isBookmarkedInitial = false,
  marketplaceListing
}: SocialPostProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitial);
  const [showComments, setShowComments] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const currentUserAvatar = currentUser?.avatar ?? `https://i.pravatar.cc/100?u=${encodeURIComponent(currentUser?.email ?? 'guest')}`;

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="social-card group mb-6"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="relative">
            <img src={author.avatar} alt={author.name} className="user-avatar" />
            {author.isProUser && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-[8px] font-bold p-0.5 rounded-full ring-2 ring-background">
                <CheckCircle2 className="w-2.5 h-2.5 text-on-primary" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm hover:text-primary cursor-pointer transition-colors">{author.name}</span>
              {author.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400/10" />}
              <span className="text-[10px] text-on-surface-variant font-mono">@{author.handle}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono uppercase tracking-tighter">
              <span>{timestamp}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full border ${getBadgeColor()}`}>
                {type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        <button className="interactive-icon">
          <MoreHorizontal className="w-4 h-4 text-on-surface-variant" />
        </button>
      </div>

      {/* Post Content */}
      <div className="space-y-4">
        <p className="text-post whitespace-pre-wrap">{content}</p>
        
        {/* Images */}
        {(image || (images && images.length > 0)) && (
          <div className={`rounded-2xl overflow-hidden border border-white/5 bg-surface-container ${images && images.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
             {images && images.length > 1 ? (
               images.map((img, idx) => (
                 <img key={idx} src={img} alt="post content" className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-700 cursor-zoom-in" />
               ))
             ) : (
               <img src={image || (images ? images[0] : '')} alt="post content" className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-700 cursor-zoom-in" />
             )}
          </div>
        )}

        {/* Marketplace Integration */}
        {marketplaceListing && (
          <div className="p-4 rounded-2xl bg-surface-container-high border border-primary/20 flex items-center justify-between group/link cursor-pointer hover:bg-white/5 transition-all">
            <div className="flex items-center gap-4">
              <img src={marketplaceListing.image} alt={marketplaceListing.title} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
              <div>
                <span className="text-[9px] font-mono uppercase text-primary font-bold">Recommended Listing</span>
                <h4 className="font-bold text-sm group-hover/link:text-primary transition-colors">{marketplaceListing.title}</h4>
                <p className="text-xs text-on-surface-variant font-mono">{marketplaceListing.price}</p>
              </div>
            </div>
            <button className="btn-secondary py-2 px-4 text-[10px]">View Car</button>
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
            <span className="text-xs font-medium">{comments}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-white/5 transition-all hidden md:flex">
            <Repeat2 className="w-4 h-4" />
            <span className="text-xs font-medium">{shares}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`interactive-icon ${isBookmarked ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button className="interactive-icon">
            <Share2 className="w-4 h-4 text-on-surface-variant" />
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
              <div className="flex gap-3 px-2">
                <img src={currentUserAvatar} className="w-8 h-8 rounded-full border border-white/10 object-cover" alt={currentUser?.name ?? 'Guest'} />
                <div className="flex-grow relative">
                  <input 
                    type="text" 
                    placeholder="Write a reply..." 
                    className="w-full bg-surface-container rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 border border-white/5"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
