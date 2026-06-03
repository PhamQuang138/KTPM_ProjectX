import { Heart, MessageCircle, Share2, MapPin, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export interface VehicleCardProps {
  id?: string;
  key?: any;
  image: string;
  price: string;
  title: string;
  location: string;
  seller: {
    name: string;
    avatar?: string | null;
    isVerified?: boolean;
  };
  condition: string;
  timestamp: string;
  specs: string[];
}

export default function VehicleCard({ 
  image, 
  price, 
  title, 
  location, 
  seller, 
  condition, 
  timestamp, 
  specs 
}: VehicleCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl overflow-hidden group flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`badge ${condition === 'New' ? 'badge-primary' : 'badge-secondary'}`}>
            {condition}
          </span >
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all ${
            isLiked ? 'bg-red-500 text-white' : 'bg-black/20 text-white hover:bg-black/40'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Preview Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button className="bg-white text-black font-mono text-[10px] px-6 py-2.5 rounded-full uppercase tracking-widest font-bold hover:scale-105 transition-transform">
            Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow bg-surface-container-low/50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display text-lg font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="font-mono text-primary font-bold">{price}</p>
        </div>

        <div className="flex items-center gap-2 text-on-surface-variant text-[11px] mb-4">
          <MapPin className="w-3 h-3" />
          <span className="font-sans">{location}</span>
          <span className="opacity-30">•</span>
          <span className="font-mono uppercase">{timestamp}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {specs.slice(0, 3).map(spec => (
            <span key={spec} className="font-mono text-[9px] px-2 py-1 bg-surface-container-high rounded border border-white/5 uppercase text-on-surface-variant">
              {spec}
            </span>
          ))}
        </div>

        {/* Seller Info & Footer */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 relative">
              <img src={seller.avatar ?? 'https://i.pravatar.cc/100?u=seller'} alt={seller.name} className="w-full h-full object-cover" />
              {seller.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-background p-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5 text-blue-400 fill-current" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">{seller.name}</span>
              <span className="text-[9px] font-mono uppercase text-on-surface-variant tracking-wider">Trusted Seller</span>
            </div>
          </div>
          
          <div className="flex gap-1">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
