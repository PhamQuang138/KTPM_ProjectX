import {Link} from 'react-router-dom';

interface BrandLogoProps {
  compact?: boolean;
  imageClassName?: string;
  showTagline?: boolean;
}

export default function BrandLogo({
  compact = false,
  imageClassName = 'h-11 w-11',
  showTagline = false,
}: BrandLogoProps) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <img
        src="/brand/carhub-logo.jpg"
        alt="CarHub"
        className={`${imageClassName} rounded-xl border border-white/10 object-cover shadow-lg shadow-black/25 transition-transform duration-300 group-hover:scale-105`}
      />
      {!compact && (
        <div className="flex flex-col">
          <span className="font-display whitespace-nowrap text-xl font-extrabold uppercase leading-none tracking-[-0.04em] text-on-background">
            CarHub
          </span>
          {showTagline && (
            <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-primary opacity-70">
              Mạng lưới xe
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
