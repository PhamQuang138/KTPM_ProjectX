import { motion, AnimatePresence } from 'motion/react';
import { Bell, MessageCircle, Heart, UserPlus, ShoppingBag, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'comment' | 'like' | 'follow' | 'marketplace' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
}

const notifications: Notification[] = [];

export default function NotificationsTray({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-surface-container border-l border-white/10 z-[70] shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold tracking-tight">Thông báo</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {notifications.map((n) => (
                <div 
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
                    n.isRead ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5'
                  }`}
                >
                  {!n.isRead && <span className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />}
                  <div className="flex gap-4">
                    <div className="relative shrink-0">
                       <img src={n.avatar} className="w-10 h-10 rounded-full border border-white/10 shadow-lg" alt="Người dùng" />
                       <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border border-white/5">
                          {n.type === 'comment' && <MessageCircle className="w-2.5 h-2.5 text-blue-400" />}
                          {n.type === 'like' && <Heart className="w-2.5 h-2.5 text-red-400 fill-current" />}
                          {n.type === 'marketplace' && <ShoppingBag className="w-2.5 h-2.5 text-primary" />}
                          {n.type === 'follow' && <UserPlus className="w-2.5 h-2.5 text-green-400" />}
                       </div>
                    </div>
                    <div className="flex-grow">
                      <p className={`text-sm leading-snug mb-1 ${n.isRead ? 'text-on-surface-variant' : 'text-on-surface font-medium'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
                  <Bell className="mx-auto mb-3 h-7 w-7 text-on-surface-variant" />
                  <p className="text-sm font-bold">Chưa có thông báo</p>
                  <p className="mt-1 text-xs text-on-surface-variant">Thông báo mới sẽ xuất hiện tại đây.</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <button className="w-full mt-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all">
                Đánh dấu đã đọc
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
