import {motion} from 'motion/react';
import {Clock, User} from 'lucide-react';
import {Link} from 'react-router-dom';

interface BlogCardProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  to: string;
  key?: string | number;
}

export default function BlogCard({title, excerpt, author, date, readTime, image, category, to}: BlogCardProps) {
  return (
    <motion.article
      whileHover={{y: -5}}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] transition-all duration-500 hover:border-primary/30"
    >
      <Link to={to} className="relative block aspect-[16/10] overflow-hidden">
        <img
          src={image}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={title}
        />
        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-background/60 px-4 py-1.5 backdrop-blur-md">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">{category}</span>
        </div>
      </Link>

      <div className="flex flex-grow flex-col p-8">
        <div className="mb-4 flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
          <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {author}</span>
          <span>-</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {readTime}</span>
        </div>

        <Link to={to}>
          <h3 className="mb-3 text-xl font-bold leading-snug transition-colors group-hover:text-primary">
            {title}
          </h3>
        </Link>
        <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-on-surface-variant opacity-70">
          {excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">{date}</span>
          <Link to={to} className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary hover:underline">
            Đọc toàn bộ bài viết →
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
