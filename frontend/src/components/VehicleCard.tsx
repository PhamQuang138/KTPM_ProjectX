import {Heart, MapPin, MessageCircle, CheckCircle2} from 'lucide-react';
import {motion} from 'motion/react';
import {Link} from 'react-router-dom';

export interface VehicleCardProps {
  id: string;
  image: string;
  price: string;
  title: string;
  location: string;
  seller: {
    id: string;
    name: string;
    avatar?: string | null;
    isVerifiedProfessional?: boolean;
  };
  condition: string;
  specs: string[];
  favoriteCount?: number;
  commentCount?: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function VehicleCard({
  id,
  image,
  price,
  title,
  location,
  seller,
  condition,
  specs,
  favoriteCount = 0,
  commentCount = 0,
  isFavorite = false,
  onToggleFavorite,
}: VehicleCardProps) {
  return (
    <motion.article
      initial={{opacity: 0, y: 16}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true}}
      className="glass-card flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link to={`/market/${id}`}>
          <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
        </Link>
        <span className="badge badge-secondary absolute left-4 top-4">{condition}</span>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`absolute right-4 top-4 rounded-full border border-white/10 p-2.5 backdrop-blur-md ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-black/40 text-white'
          }`}
          title={isFavorite ? 'Bỏ lưu tin xe' : 'Lưu tin xe'}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/market/${id}`} className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-bold hover:text-primary">{title}</h3>
          <p className="shrink-0 font-mono font-bold text-primary">{price}</p>
        </Link>
        <p className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
          <MapPin className="h-3.5 w-3.5" /> {location}
        </p>
        <div className="my-5 flex flex-wrap gap-2">
          {specs.slice(0, 3).map((spec) => (
            <span key={spec} className="rounded border border-white/5 bg-surface-container-high px-2 py-1 text-[9px] uppercase text-on-surface-variant">
              {spec}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
          <Link to={`/profile/${seller.id}`} className="flex min-w-0 items-center gap-2.5 hover:text-primary">
            <img src={seller.avatar ?? `https://i.pravatar.cc/100?u=${seller.id}`} alt={seller.name} className="h-8 w-8 rounded-full object-cover" />
            <span className="truncate text-xs font-bold">{seller.name}</span>
            {seller.isVerifiedProfessional && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-400" />}
          </Link>
          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {favoriteCount}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {commentCount}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
