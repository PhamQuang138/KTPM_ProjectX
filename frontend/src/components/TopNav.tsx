import { Search, User, Bell, PlusCircle, Menu, LogOut, MessageCircle, BadgeCheck, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import NotificationsTray from './NotificationsTray';
import { useSidebarStore } from '../store/useSidebarStore';
import { useAuthStore } from '../store/useAuthStore';
import {useMessageStore} from '../store/useMessageStore';
import {apiRequest} from '../lib/api';
import BrandLogo from './BrandLogo';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function TopNav({ title }: { title?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [accountQuery, setAccountQuery] = useState('');
  const [accountResults, setAccountResults] = useState<Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: 'USER' | 'ADMIN';
    isVerifiedProfessional: boolean;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { isOpen, toggle } = useSidebarStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const openInbox = useMessageStore((state) => state.openInbox);
  const updateUnreadNotifications = useCallback((count: number) => setUnreadNotifications(count), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = () => apiRequest<{unreadCount: number}>('/notifications')
      .then((result) => setUnreadNotifications(result.unreadCount))
      .catch(() => undefined);
    void load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    const query = accountQuery.trim();
    if (!isSearchOpen || query.length < 2) {
      setAccountResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = window.setTimeout(() => {
      apiRequest<typeof accountResults>(`/users/search/accounts?q=${encodeURIComponent(query)}`)
        .then(setAccountResults)
        .catch(() => setAccountResults([]))
        .finally(() => setIsSearching(false));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [accountQuery, isSearchOpen]);

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
      case '/': return 'Trang chủ';
      case '/feed': return 'Cộng đồng';
      case '/market': return 'Chợ xe';
      case '/garage': return 'Hồ sơ của tôi';
      case '/liked': return 'Đã thích';
      case '/saved': return 'Đã lưu';
      case '/admin': return 'Quản trị';
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
          <BrandLogo showTagline />
        </div>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden lg:flex space-x-8">
            {[
              { label: 'Khám phá', path: '/' },
              ...(isAuthenticated
                ? [
                    { label: 'Cộng đồng', path: '/feed' },
                    { label: 'Chợ xe', path: '/market' },
                    { label: 'Gara', path: '/garage' },
                  ]
                : []),
              ...(user?.role === 'ADMIN' ? [{ label: 'Quản trị', path: '/admin' }] : []),
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
                <button onClick={() => setIsSearchOpen(true)} className="hidden md:flex p-2 text-on-surface hover:text-primary transition-all hover:scale-110" title="Tìm tài khoản">
                  <Search className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="relative p-2 text-on-surface hover:text-primary transition-all hover:scale-110"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />}
                </button>
                <button
                  type="button"
                  onClick={openInbox}
                  className="relative p-2 text-on-surface hover:text-primary transition-all hover:scale-110"
                  title="Tin nhắn"
                >
                  <MessageCircle className="w-5 h-5" />
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
                  aria-label="Đăng xuất"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="flex font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                Đăng nhập
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
                  Đăng bài
                </button>

                <button
                  type="button"
                  onClick={handleCreatePost}
                  className="p-2 text-on-surface hover:text-primary transition-colors md:hidden"
                  aria-label="Tạo bài viết"
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[80] bg-black/65 p-4 pt-24 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-surface-container p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-on-surface-variant" />
              <input
                autoFocus
                value={accountQuery}
                onChange={(event) => setAccountQuery(event.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              <button onClick={() => setIsSearchOpen(false)} className="interactive-icon" title="Đóng"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-3 border-t border-white/10 pt-3">
              {accountQuery.trim().length < 2 && <p className="px-2 py-6 text-center text-sm text-on-surface-variant">Nhập ít nhất 2 ký tự để tìm tài khoản.</p>}
              {isSearching && <p className="px-2 py-6 text-center text-sm text-on-surface-variant">Đang tìm...</p>}
              {!isSearching && accountQuery.trim().length >= 2 && accountResults.length === 0 && <p className="px-2 py-6 text-center text-sm text-on-surface-variant">Không tìm thấy tài khoản phù hợp.</p>}
              {!isSearching && accountResults.map((account) => (
                <Link
                  key={account.id}
                  to={`/profile/${account.id}`}
                  onClick={() => {setIsSearchOpen(false); setAccountQuery('');}}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/5"
                >
                  <img src={account.avatar ?? `https://i.pravatar.cc/100?u=${encodeURIComponent(account.email)}`} alt={account.name} className="h-11 w-11 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-bold">
                      {account.name}
                      {(account.role === 'ADMIN' || account.isVerifiedProfessional) && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-400" />}
                    </p>
                    <p className="truncate text-xs text-on-surface-variant">{account.email}</p>
                  </div>
                  <span className="badge-secondary">{account.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <NotificationsTray 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        onUnreadChange={updateUnreadNotifications}
      />
    </>
  );
}
