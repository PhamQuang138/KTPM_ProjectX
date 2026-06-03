import { motion } from 'motion/react';
import { Clock, User } from 'lucide-react';

interface BlogCardProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  key?: string | number;
}

export default function BlogCard({ title, excerpt, author, date, readTime, image, category }: BlogCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col h-full hover:border-primary/30 transition-all duration-500"
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        <img 
          src={image} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt={title} 
        />
        <div className="absolute top-4 left-4 bg-background/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
          <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">{category}</span>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-4">
          <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {author}</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {readTime}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-snug">
          {title}
        </h3>
        <p className="text-sm text-on-surface-variant line-clamp-3 leading-relaxed opacity-70 mb-6">
          {excerpt}
        </p>
        
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">{date}</span>
          <button className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest hover:underline">
            Read Article →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
