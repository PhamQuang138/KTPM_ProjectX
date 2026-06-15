import { MessageSquare, Heart, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface CommunityPostProps {
  key?: any;
  author: {
    name: string;
    avatar: string;
    handle: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  category: string;
}

export default function CommunityPost({ 
  author, 
  content, 
  image, 
  timestamp, 
  likes: initialLikes, 
  comments, 
  category 
}: CommunityPostProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-6 mb-6 last:mb-0 border-white/5 hover:border-white/10"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-on-surface">{author.name}</span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono uppercase tracking-widest">{category}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
              <span>@{author.handle}</span>
              <span>•</span>
              <span>{timestamp}</span>
            </div>
          </div>
        </div>
        <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>

      {image && (
        <div className="mb-4 rounded-xl overflow-hidden border border-white/5 aspect-video sm:aspect-auto">
          <img src={image} alt="N?i dung b?i vi?t" className="w-full object-cover max-h-[400px]" />
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 text-xs transition-colors ${isLiked ? 'text-red-500' : 'text-on-surface-variant hover:text-red-500'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>
          <button className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>{comments}</span>
          </button>
          <button className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
