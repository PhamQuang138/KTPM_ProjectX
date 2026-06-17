import { Newspaper, ShoppingBag, Car, Heart, Bookmark, Settings, Zap, Home, ChevronLeft, LogOut, BadgeCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { useSidebarStore } from '../store/useSidebarStore';
import { useAuthStore } from '../store/useAuthStore';
import BrandLogo from './BrandLogo';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: Home, label: 'Khám phá', path: '/' },
  { icon: Newspaper, label: 'Cộng đồng', path: '/feed' },
  { icon: ShoppingBag, label: 'Chợ xe', path: '/market' },
  { icon: Car, label: 'Gara của tôi', path: '/garage' },
  { icon: Heart, label: 'Đã thích', path: '/liked' },
  { icon: Bookmark, label: 'Đã lưu', path: '/saved' },
  { icon: Settings, label: 'Cài đặt', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, toggle } = useSidebarStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const visibleNavItems = isAuthenticated ? navItems : navItems.filter((item) => item.path === '/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav 
          initial={{ x: '-100%', opacity: 0.98 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0.98 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-0 top-0 h-dvh w-64 bg-surface-container/95 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%)] border-r border-white/10 shadow-[8px_0_24px_rgba(0,0,0,0.18)] py-4 z-[70] flex flex-col transform-gpu will-change-transform"
        >
          <div className="px-6 py-8 mb-8 flex items-center justify-between">
            <BrandLogo imageClassName="h-11 w-11" />
            <button 
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-white/5 text-on-surface-variant hover:text-primary transition-colors h-10 w-10 flex items-center justify-center"
              aria-label="Đóng menu"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 mb-8">
            <Link to={isAuthenticated ? '/garage' : '/login'} className="flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:bg-white/5 p-2 rounded-xl">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 bg-surface-container-high transition-transform duration-500 group-hover:scale-110">
                <img 
                  alt="Hồ sơ người dùng"
                  className="w-full h-full object-cover" 
                  src={user?.avatar ?? 'https://i.pravatar.cc/200?u=me'}
                />
              </div>
              <div>
                <p className="font-sans text-sm text-on-surface font-bold leading-tight">{user?.name ?? 'Khách'}</p>
                <p className="flex items-center gap-1 text-[10px] text-on-surface-variant font-mono uppercase tracking-wider">
                  {isAuthenticated ? (user?.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên') : 'Đăng nhập'}
                  {isAuthenticated && (user?.role === 'ADMIN' || user?.isVerifiedProfessional) && <BadgeCheck className="h-3 w-3 text-blue-400" />}
                </p>
              </div>
            </Link>
          </div>

          <div className="flex-grow space-y-1 px-2">
            {visibleNavItems.map((item) => {
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
                Đăng xuất
              </button>
            )}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => navigate('/garage?addVehicle=1')}
                className="relative overflow-hidden w-full bg-surface-container-highest text-on-surface py-3 rounded-xl font-mono uppercase text-[10px] tracking-widest hover:brightness-110 transition-all border border-white/5 shadow-xl hover:bg-primary hover:text-on-primary group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-3 h-3 group-hover:fill-current" />
                  Đăng bán xe
                </span>
              </button>
            )}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
