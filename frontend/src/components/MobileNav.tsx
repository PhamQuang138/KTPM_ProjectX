import { LayoutGrid, ShoppingBag, PlusSquare, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { icon: LayoutGrid, label: 'Feed', path: '/' },
    { icon: ShoppingBag, label: 'Market', path: '/market' },
    { icon: PlusSquare, label: 'Post', path: '#' },
    { icon: Users, label: 'Clubs', path: '#' },
    { icon: User, label: 'Garage', path: '/garage' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/5 px-4 pb-safe">
      <div className="flex justify-between items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
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
