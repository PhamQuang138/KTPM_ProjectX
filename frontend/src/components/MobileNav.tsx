import { Heart, LayoutGrid, PlusSquare, ShoppingBag, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../store/useAuthStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MobileNav() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const navItems = [
    { icon: LayoutGrid, label: 'Khám phá', path: '/' },
    ...(isAuthenticated
      ? [
          { icon: ShoppingBag, label: 'Chợ xe', path: '/market' },
          { icon: PlusSquare, label: 'Đăng', path: '/feed?compose=1' },
          { icon: Heart, label: 'Đã thích', path: '/favorites' },
          { icon: User, label: 'Garage', path: '/garage' },
        ]
      : []),
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/5 px-4 pb-safe">
      <div className="flex justify-between items-center h-16">
        {navItems.map((item) => {
          const itemPathname = item.path.split('?')[0];
          const isActive = location.pathname === itemPathname;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 w-full relative",
                isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {isActive && (
                <div className="absolute -top-2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-mono uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
