import TopNav from '../components/TopNav';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import SocialPost, { SocialPostProps } from '../components/SocialPost';
import MobileNav from '../components/MobileNav';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Hash, Sparkles, MessageSquare, Camera, PenTool, LayoutGrid, Bell, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useSidebarStore } from '../store/useSidebarStore';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

const categories = [
  { label: 'Tất cả', icon: LayoutGrid },
  { label: 'Bài viết', icon: PenTool },
  { label: 'Thảo luận', icon: MessageSquare },
  { label: 'Chợ xe', icon: ShoppingBag },
  { label: 'Tin chính thức', icon: Sparkles },
];

interface ImageUploadResponse {
  url: string;
  path: string;
  filename: string;
}

interface CommunityOverview {
  stats: {
    members: number;
    publishedPosts: number;
    recentPosts: number;
    interactions: number;
  };
  topMembers: {
    id: string;
    name: string;
    handle: string;
    avatar?: string | null;
    postCount: number;
  }[];
}

export default function Editorial() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [isPosting, setIsPosting] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [isUploadingPostImage, setIsUploadingPostImage] = useState(false);
  const [posts, setPosts] = useState<SocialPostProps[]>([]);
  const [overview, setOverview] = useState<CommunityOverview | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState('');
  const postInputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOpen } = useSidebarStore();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const displayName = user?.name ?? 'Khách';
  const avatar = user?.avatar ?? `https://i.pravatar.cc/200?u=${encodeURIComponent(user?.email ?? 'guest')}`;
  const handle = user?.email.split('@')[0] ?? 'guest';

  const handleCreatePost = async () => {
    const content = postContent.trim();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!content || isSubmittingPost) return;

    setPostError('');
    setIsSubmittingPost(true);
    try {
      const createdPost = await apiRequest<SocialPostProps>('/posts/community', {
        method: 'POST',
        body: JSON.stringify({
          content,
          title: content.slice(0, 80),
          status: 'PUBLISHED',
          images: postImages.map((url) => ({url})),
        }),
      });

      setPosts((currentPosts) => [createdPost, ...currentPosts]);
      setPostContent('');
      setPostImages([]);
      setIsPosting(false);
    } catch (error) {
      setPostError(error instanceof Error ? error.message : 'Không thể tạo bài viết.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handlePostImageUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPostError('Vui lòng chọn ảnh JPG, JPEG, PNG hoặc WEBP.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setPostError('Ảnh phải có dung lượng tối đa 4MB.');
      return;
    }
    if (postImages.length >= 4) {
      setPostError('Bạn có thể đính kèm tối đa 4 ảnh cho mỗi bài viết.');
      return;
    }

    setPostError('');
    setIsUploadingPostImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploaded = await apiRequest<ImageUploadResponse>('/uploads/images', {
        method: 'POST',
        body: formData,
      });

      setPostImages((current) => [...current, uploaded.url]);
      setIsPosting(true);
    } catch (error) {
      setPostError(error instanceof Error ? error.message : 'Không thể tải ảnh lên.');
    } finally {
      setIsUploadingPostImage(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('compose') !== '1') return;

    if (!isAuthenticated) {
      navigate('/login', {replace: true});
      return;
    }

    setIsPosting(true);
    window.setTimeout(() => postInputRef.current?.focus(), 0);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('compose');
    setSearchParams(nextParams, {replace: true});
  }, [isAuthenticated, navigate, searchParams, setSearchParams]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiRequest<SocialPostProps[]>('/posts/community'),
      apiRequest<CommunityOverview>('/posts/community-overview'),
    ])
      .then(([dbPosts, communityOverview]) => {
        if (!isMounted) return;
        setPosts(dbPosts);
        setOverview(communityOverview);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <motion.main 
        animate={{ marginLeft: isOpen ? '16rem' : '0rem' }}
        className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-8 mb-24 md:mb-12 transition-all duration-300"
      >
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Navigation & Identity */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            {/* User Profile Mini-Card */}
            <div className="glass-card rounded-[2rem] p-6 border-white/5 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
              <div className="flex items-center gap-4 mb-4">
                <img src={avatar} className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover" alt={displayName} />
                <div>
                  <h3 className="font-bold text-sm">{displayName}</h3>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">
                    {isAuthenticated ? `@${handle}` : 'Khách cộng đồng'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                <div className="text-center">
                  <p className="text-sm font-bold">12</p>
                  <p className="text-[9px] text-on-surface-variant font-mono uppercase">Xe</p>
                </div>
                <div className="text-center border-l border-white/5">
                  <p className="text-sm font-bold">2.4k</p>
                  <p className="text-[9px] text-on-surface-variant font-mono uppercase">Điểm</p>
                </div>
              </div>
              <Link to="/garage" className="block w-full mt-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-widest transition-all text-center">
                Hồ sơ của tôi
              </Link>
            </div>

            {/* Hub Navigation */}
            <div className="glass-card rounded-[2rem] p-6 border-white/5">
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-4 text-on-surface-variant">Khám phá cộng đồng</h3>
              <nav className="space-y-1">
                {categories.map(cat => (
                  <button 
                    key={cat.label}
                    onClick={() => setActiveCategory(cat.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-sans transition-all group ${
                      activeCategory === cat.label 
                        ? 'bg-primary/10 text-primary font-bold shadow-lg shadow-primary/5' 
                        : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                    }`}
                  >
                    <cat.icon className={`w-4 h-4 ${activeCategory === cat.label ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`} />
                    {cat.label}
                  </button>
                ))}
              </nav>
            </div>

          </aside>

          {/* Main Content: Social Feed */}
          <section className="col-span-1 lg:col-span-6 space-y-6">
            
            {/* Feed Header (Mobile only) */}
            <div className="lg:hidden flex items-center justify-between mb-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">Cộng đồng</h1>
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-on-surface-variant" />
                <Bell className="w-5 h-5 text-on-surface-variant" />
              </div>
            </div>

            {/* Create Post Input */}
            <motion.div 
              layout
              className="glass-card rounded-[2.5rem] p-4 md:p-6 border-white/10 relative overflow-hidden"
            >
              <div className="flex gap-4">
                <img src={avatar} alt={displayName} className="w-12 h-12 rounded-full border border-white/10 object-cover" />
                <div className="flex-grow space-y-4">
                  <textarea 
                    ref={postInputRef}
                    onFocus={() => setIsPosting(true)}
                    value={postContent}
                    onChange={(event) => setPostContent(event.target.value)}
                    placeholder="Chia sẻ câu chuyện mới nhất về chiếc xe của bạn..." 
                    className="w-full bg-transparent border-none focus:ring-0 text-base md:text-lg resize-none min-h-[60px] max-h-40 py-2"
                  />

                  {postError && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {postError}
                    </div>
                  )}

                  {postImages.length > 0 && (
                    <div className={`grid gap-2 ${postImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {postImages.map((imageUrl) => (
                        <div key={imageUrl} className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-container">
                          <img src={imageUrl} alt="Xem trước bài viết" className="aspect-video w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPostImages((current) => current.filter((url) => url !== imageUrl))}
                            className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-red-500"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {isPosting && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between pt-4 border-t border-white/5"
                      >
                        <div className="flex gap-2">
                          <label className={`interactive-icon text-primary cursor-pointer ${isUploadingPostImage ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Camera className="w-5 h-5" />
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                              className="hidden"
                              disabled={isUploadingPostImage}
                              onChange={(event) => {
                                void handlePostImageUpload(event.target.files?.[0]);
                                event.target.value = '';
                              }}
                            />
                          </label>
                          <button className="interactive-icon"><Hash className="w-5 h-5" /></button>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setIsPosting(false);
                              setPostImages([]);
                              setPostError('');
                            }}
                            className="text-xs text-on-surface-variant font-bold hover:text-on-surface transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleCreatePost}
                            disabled={!postContent.trim() || isSubmittingPost || isUploadingPostImage || !isAuthenticated}
                            className="btn-primary py-2 px-6 text-xs rounded-full shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploadingPostImage ? 'Đang tải ảnh...' : isSubmittingPost ? 'Đang đăng...' : isAuthenticated ? 'Đăng bài' : 'Đăng nhập để đăng'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Mobile Horizontal Categories */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
              {categories.map(cat => (
                <button 
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat.label 
                      ? 'bg-primary text-on-primary' 
                      : 'glass-card border-white/10 text-on-surface-variant'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Post Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <SocialPost key={post.id} {...post} />
              ))}
              {posts.length === 0 && (
                <div className="glass-card rounded-[2rem] border-white/5 p-10 text-center text-on-surface-variant">
                  Chưa có bài viết cộng đồng. Hãy là người đầu tiên chia sẻ.
                </div>
              )}
            </div>

            {/* End of Feed Message */}
            <div className="py-20 text-center opacity-40">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-primary animate-pulse" />
              <p className="font-display text-lg font-bold mb-1">Bạn đã xem hết bài mới!</p>
              <p className="text-xs font-mono uppercase tracking-[0.25em]">Luồng tin đã cập nhật</p>
            </div>
          </section>

          {/* Right Sidebar: Contextual Content */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Community Stats Card */}
            <div className="glass-card rounded-[2rem] p-6 border-white/5">
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Hoạt động cộng đồng</h3>
              <div className="space-y-4">
                {[
                  {label: 'Thành viên', value: overview?.stats.members ?? 0},
                  {label: 'Bài đã đăng', value: overview?.stats.publishedPosts ?? 0},
                  {label: 'Bài mới trong 7 ngày', value: overview?.stats.recentPosts ?? 0},
                  {label: 'Tổng tương tác', value: overview?.stats.interactions ?? 0},
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <span className="text-xs text-on-surface-variant">{stat.label}</span>
                    <span className="font-bold text-primary font-mono">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Who to Follow */}
            <div className="glass-card rounded-[2rem] p-6 border-white/5">
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Thành viên nổi bật</h3>
              <div className="space-y-5">
                {overview?.topMembers.map((member) => (
                  <Link key={member.id} to={`/profile/${member.id}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 group">
                      <img
                        src={member.avatar ?? `https://i.pravatar.cc/100?u=${encodeURIComponent(member.handle)}`}
                        className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary/50 transition-colors object-cover"
                        alt={member.name}
                      />
                      <div>
                        <p className="text-xs font-bold group-hover:text-primary transition-colors">{member.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">@{member.handle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-primary">{member.postCount} bài</span>
                  </Link>
                ))}
                {overview?.topMembers.length === 0 && (
                  <p className="text-xs text-on-surface-variant">Chưa có thành viên nào đăng bài.</p>
                )}
              </div>
            </div>

            <Footer hideLogo />
          </aside>
        </div>
      </motion.main>

      {/* Social Floating Action (Mobile only) */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (!isAuthenticated) {
            navigate('/login');
            return;
          }
          setIsPosting(true);
          window.setTimeout(() => postInputRef.current?.focus(), 0);
        }}
        className="fixed bottom-24 right-6 lg:hidden w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center z-50 shimmer-effect"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <MobileNav />
    </div>
  );
}
