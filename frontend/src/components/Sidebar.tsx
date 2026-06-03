import { Newspaper, ShoppingBag, Car, Users, Heart, Settings, Zap, Home, ChevronLeft, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { useSidebarStore } from '../store/useSidebarStore';
import { useAuthStore } from '../store/useAuthStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: Home, label: 'Explore', path: '/' },
  { icon: Newspaper, label: 'Community Feed', path: '/feed' },
  { icon: ShoppingBag, label: 'Marketplace', path: '/market' },
  { icon: Car, label: 'My Garage', path: '/garage' },
  { icon: Users, label: 'Clubs', path: '#' },
  { icon: Heart, label: 'Favorites', path: '#' },
  { icon: Settings, label: 'Settings', path: '#' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, toggle } = useSidebarStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav 
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-screen w-64 bg-surface-container backdrop-blur-md border-r border-white/5 shadow-xl py-4 z-50 flex flex-col"
        >
          <div className="px-6 py-8 mb-8 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
                <Zap className="w-6 h-6 text-on-primary fill-current" />
              </div>
              <span className="font-display text-2xl text-on-background tracking-tighter font-bold">CarHub</span>
            </Link>
            <button 
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-white/5 text-on-surface-variant hover:text-primary transition-colors h-10 w-10 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 mb-8">
            <Link to={isAuthenticated ? '/garage' : '/login'} className="flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:bg-white/5 p-2 rounded-xl">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 bg-surface-container-high transition-transform duration-500 group-hover:scale-110">
                <img 
                  alt="User Profile" 
                  className="w-full h-full object-cover" 
                  src={user?.avatar ?? 'https://i.pravatar.cc/200?u=me'}
                />
              </div>
              <div>
                <p className="font-sans text-sm text-on-surface font-bold leading-tight">{user?.name ?? 'Guest'}</p>
                <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider">
                  {isAuthenticated ? 'Legacy Collector' : 'Sign in'}
                </p>
              </div>
            </Link>
          </div>

          <div className="flex-grow space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    "relative flex items-center space-x-3 px-4 py-3 mx-2 rounded-xl transition-all duration-300 group",
                    isActive 
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                      : "text-on-surface-variant hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  )} />
                  <span className="font-sans text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="sidebarActive" className="absolute left-0 w-1 h-6 bg-white/20 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="px-6 mt-auto pb-8">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="mb-3 w-full text-on-surface-variant py-3 rounded-xl font-mono uppercase text-[10px] tracking-widest hover:bg-white/5 hover:text-primary transition-all border border-white/5 flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            )}
            <button 
              className="relative overflow-hidden w-full bg-surface-container-highest text-on-surface py-3 rounded-xl font-mono uppercase text-[10px] tracking-widest hover:brightness-110 transition-all border border-white/5 shadow-xl hover:bg-primary hover:text-on-primary group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap className="w-3 h-3 group-hover:fill-current" />
                New Listing
              </span>
            </button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
