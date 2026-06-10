import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {Bell, CheckCheck, Heart, MessageCircle, ShoppingBag, UserPlus, X} from 'lucide-react';
import {Link} from 'react-router-dom';
import {apiRequest} from '../lib/api';

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
  actor?: {name: string; email: string; avatar?: string | null} | null;
}

interface NotificationResponse {
  items: NotificationItem[];
  unreadCount: number;
}

export default function NotificationsTray({
  isOpen,
  onClose,
  onUnreadChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange: (count: number) => void;
}) {
  const [data, setData] = useState<NotificationResponse>({items: [], unreadCount: 0});

  useEffect(() => {
    if (!isOpen) return;
    apiRequest<NotificationResponse>('/notifications').then((result) => {
      setData(result);
      onUnreadChange(result.unreadCount);
    });
  }, [isOpen, onUnreadChange]);

  const markAllRead = async () => {
    await apiRequest('/notifications/read-all', {method: 'POST'});
    setData((current) => ({items: current.items.map((item) => ({...item, readAt: new Date().toISOString()})), unreadCount: 0}));
    onUnreadChange(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={onClose} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" aria-label="Đóng thông báo" />
          <motion.aside initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}} className="fixed bottom-0 right-0 top-0 z-[70] w-full max-w-sm overflow-y-auto border-l border-white/10 bg-surface-container p-6 shadow-2xl">
            <header className="mb-7 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Bell className="h-5 w-5 text-primary" /> Thông báo</h2>
              <button onClick={onClose} className="interactive-icon"><X className="h-5 w-5" /></button>
            </header>
            <div className="space-y-3">
              {data.items.map((item) => {
                const content = (
                  <div className={`relative flex gap-3 rounded-xl border p-4 ${item.readAt ? 'border-white/5 bg-white/[0.02]' : 'border-primary/20 bg-primary/5'}`}>
                    {!item.readAt && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />}
                    <img src={item.actor?.avatar ?? `https://i.pravatar.cc/80?u=${item.actor?.email ?? item.id}`} className="h-10 w-10 rounded-full object-cover" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm"><strong>{item.actor?.name ?? 'CarHub'}</strong> {item.message}</p>
                      <p className="mt-1 text-[10px] text-on-surface-variant">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <NotificationIcon type={item.type} />
                  </div>
                );
                return item.link ? <Link key={item.id} to={item.link} onClick={onClose}>{content}</Link> : <div key={item.id}>{content}</div>;
              })}
              {!data.items.length && <div className="py-16 text-center text-sm text-on-surface-variant"><Bell className="mx-auto mb-3 h-8 w-8" />Chưa có thông báo.</div>}
            </div>
            {data.unreadCount > 0 && <button onClick={() => void markAllRead()} className="btn-secondary mt-6 flex w-full items-center justify-center gap-2 py-3"><CheckCheck className="h-4 w-4" /> Đánh dấu đã đọc</button>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationIcon({type}: {type: string}) {
  if (type === 'like') return <Heart className="h-4 w-4 shrink-0 text-red-400" />;
  if (type === 'follow') return <UserPlus className="h-4 w-4 shrink-0 text-green-400" />;
  if (type === 'marketplace') return <ShoppingBag className="h-4 w-4 shrink-0 text-primary" />;
  return <MessageCircle className="h-4 w-4 shrink-0 text-blue-400" />;
}
