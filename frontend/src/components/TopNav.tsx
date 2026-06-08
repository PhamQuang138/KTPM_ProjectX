import { Search, User, Bell, PlusCircle, Zap, Menu, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import { useState } from 'react';
import NotificationsTray from './NotificationsTray';
import { useSidebarStore } from '../store/useSidebarStore';
import { useAuthStore } from '../store/useAuthStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function TopNav({ title }: { title?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isOpen, toggle } = useSidebarStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreatePost = () => {
    navigate(isAuthenticated ? '/feed?compose=1' : '/login');
  };

  const getPageTitle = () => {
    if (title) return title;
    switch (location.pathname) {
      case '/': return 'Home';
      case '/feed': return 'Community Hub';
      case '/market': return 'Marketplace';
      case '/garage': return 'My Profile';
      default: return 'CarHub';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg px-6 md:px-margin-desktop py-4 flex justify-between items-center transition-all duration-500">
        <div className="flex items-center gap-4">
          {isAuthenticated && !isOpen && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={toggle}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-on-surface hover:text-primary transition-all border border-white/10"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          )}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <Zap className="w-6 h-6 text-on-primary fill-current" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-display text-xl text-on-background font-bold tracking-tighter uppercase whitespace-nowrap leading-none">
                CarHub
              </h2>
              <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-primary font-bold opacity-60">Enthusiast Network</span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden lg:flex space-x-8">
            {[
              { label: 'Explore', path: '/' },
              ...(isAuthenticated
                ? [
                    { label: 'Community', path: '/feed' },
                    { label: 'Market', path: '/market' },
                    { label: 'Garage', path: '/garage' },
                  ]
                : []),
              ...(user?.role === 'ADMIN' ? [{ label: 'Admin', path: '/admin' }] : []),
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.2em] transition-all relative py-1 hover:text-primary font-bold",
                  location.pathname === item.path 
                    ? "text-primary cursor-default" 
                    : "text-on-surface-variant"
                )}
              >
                {item.label}
                {location.pathname === item.path && (
                  <motion.div layoutId="navActive" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4 border-l border-white/10 pl-6">
            {isAuthenticated && (
              <>
                <button className="hidden md:flex p-2 text-on-surface hover:text-primary transition-all hover:scale-110">
                  <Search className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="relative p-2 text-on-surface hover:text-primary transition-all hover:scale-110"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                </button>
              </>
            )}

            {isAuthenticated ? (
              <>
                <Link to="/garage" className="hidden md:flex p-2 text-on-surface hover:text-primary transition-all hover:scale-110">
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex p-2 text-on-surface hover:text-primary transition-all hover:scale-110"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                Login
              </Link>
            )}

            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={handleCreatePost}
                  className="btn-primary py-2 px-4 text-[10px] hidden md:flex items-center gap-2"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Post
                </button>

                <button
                  type="button"
                  onClick={handleCreatePost}
                  className="p-2 text-on-surface hover:text-primary transition-colors md:hidden"
                  aria-label="Create post"
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <NotificationsTray 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </>
  );
}
