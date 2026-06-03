import TopNav from '../components/TopNav';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import SocialPost, { SocialPostProps } from '../components/SocialPost';
import MobileNav from '../components/MobileNav';
import { Link } from 'react-router-dom';
import { Search, Plus, TrendingUp, Hash, Users, Sparkles, MessageSquare, Heart, Clock, Bookmark, Camera, PenTool, LayoutGrid, Bell, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useSidebarStore } from '../store/useSidebarStore';
import { apiRequest } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

// ... categories and trendingTags stay the same

const categories = [
  { label: 'All Feed', icon: LayoutGrid },
  { label: 'Blog Posts', icon: PenTool },
  { label: 'Discussions', icon: MessageSquare },
  { label: 'Market Feed', icon: ShoppingBag },
  { label: 'Official News', icon: Sparkles },
];

const trendingTags = ['CarHub2026', 'RestoDiary', 'DailyDriver', 'JDMClassic', 'EVTomorrow', 'PorschePass'];

const communityStats = [
  { label: 'Active Now', value: '1,204' },
  { label: 'New Stories', value: '42' },
  { label: 'Listing Shares', value: '156' },
];

const hubPosts: SocialPostProps[] = [
  {
    author: {
      name: "Marcus Thorne",
      handle: "mthorne_rs",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuALrnP11mR5J3hDSTFCrB33JVno9FYrLSrWAVteCwwmYOrgn7oE-8h1e8jpF9OiIIAHcF3KREZjBg0gvlwkcyM49Gl0Bb18tpAaVmeQ7FerPdly7woocsNCYOCkHpOR9s99Y2z3JsxWu_QXAWiuSZzTYXo3sPhvWdNryUr9v3F2Nbb0GVJ8hFZzi8YgufHq01ZfBRYraaYgFKE1eMKMeHJCoe3vUX3Mss_2bb23Dfkg2PFpgYPvRrWN01U_zCLdiVUAbG2H5IrA8g",
      isVerified: true,
      isProUser: true
    },
    type: 'garage',
    content: "The final piece of the puzzle arrived today for the 1974 2.7 RS project. These period-correct Fuchs wheels are everything. Restoration is 98% complete. \n\nWhat do you guys think of the silver-on-black finish?",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQcQwnFFiEl1uaEzWESRhLrrSmtUEXLk_aTY5GsfuNE2ZwHKMzO0ApXtv6ZwPkBCSYd_iQj3wiCSo9X97Y1dWXHF59FzI8n6gUllE2SVFuTQWAbZepD1t14ugConVJCdPvFt0yCLq7s3c_6O6zt2ufeNM4fRDemBJHX7kram1oxbzUZGRbQN5WZo5cWxgIhSByeJr-7mFte6R4OxB46WfNkHE8ZcGttyVRyHhixX3bz2XEWQJmlJzSDhQKqVvcN4rpxg8kPDDnZw",
    timestamp: "12m ago",
    likes: 245,
    comments: 34,
    category: "Restoration",
    tags: ["Porsche911", "RestoMod", "Vintage"]
  },
  {
    author: {
      name: "Elena Rossi",
      handle: "elena_f1",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuALrnP11mR5J3hDSTFCrB33JVno9FYrLSrWAVteCwwmYOrgn7oE-8h1e8jpF9OiIIAHcF3KREZjBg0gvlwkcyM49Gl0Bb18tpAaVmeQ7FerPdly7woocsNCYOCkHpOR9s99Y2z3JsxWu_QXAWiuSZzTYXo3sPhvWdNryUr9v3F2Nbb0GVJ8hFZzi8YgufHq01ZfBRYraaYgFKE1eMKMeHJCoe3vUX3Mss_2bb23Dfkg2PFpgYPvRrWN01U_zCLdiVUAbG2H5IrA8g",
      isVerified: true
    },
    type: 'marketplace',
    content: "Helping a friend move this beautiful Stingray. Honestly, the mid-engine layout change was the best thing to happen to this platform in decades. Handling is razor sharp.",
    timestamp: "1h ago",
    likes: 1205,
    comments: 56,
    category: "Hot Deals",
    marketplaceListing: {
      title: "Chevrolet Corvette Stingray Z51",
      price: "$75,000",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
    }
  },
  {
    author: {
      name: "DriveDaily",
      handle: "daily_alpha",
      avatar: "https://i.pravatar.cc/100?u=dd",
    },
    type: 'story',
    content: "Spent the weekend lost in the Cotswolds. No GPS, just a map and the internal combustion engine. Sometimes you need to disconnect to reconnect.",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800"
    ],
    timestamp: "3h ago",
    likes: 890,
    comments: 12,
    category: "Road Trip",
    tags: ["Exploring", "Cotswolds", "Escape"]
  },
  {
    author: {
      name: "Julian Vance",
      handle: "jvance_auto",
      avatar: "https://i.pravatar.cc/100?u=jv",
    },
    type: 'maintenance',
    content: "Quick tip: If you're hearing a slight high-pitched whistle under acceleration in your E30, check the throttle body gasket. Super common vacuum leak point that often gets misdiagnosed as turbo whine (even if you don't have one 😂).",
    timestamp: "5h ago",
    likes: 156,
    comments: 42,
    category: "Tech Help"
  }
];

export default function Editorial() {
  const [activeCategory, setActiveCategory] = useState('All Feed');
  const [isPosting, setIsPosting] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<SocialPostProps[]>(hubPosts);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const { isOpen } = useSidebarStore();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const displayName = user?.name ?? 'Guest Driver';
  const avatar = user?.avatar ?? `https://i.pravatar.cc/200?u=${encodeURIComponent(user?.email ?? 'guest')}`;
  const handle = user?.email.split('@')[0] ?? 'guest';

  const handleCreatePost = async () => {
    const content = postContent.trim();
    if (!content || isSubmittingPost || !user) return;

    setIsSubmittingPost(true);
    try {
      const createdPost = await apiRequest<SocialPostProps>('/posts/community', {
        method: 'POST',
        body: JSON.stringify({
          content,
          title: content.slice(0, 80),
          status: 'PUBLISHED',
          authorId: user.id,
        }),
      });

      setPosts((currentPosts) => [createdPost, ...currentPosts]);
      setPostContent('');
      setIsPosting(false);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    apiRequest<SocialPostProps[]>('/posts/community')
      .then((dbPosts) => {
        if (isMounted) {
          setPosts([...dbPosts, ...hubPosts]);
        }
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
                    {isAuthenticated ? `@${handle}` : 'Community Guest'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                <div className="text-center">
                  <p className="text-sm font-bold">12</p>
                  <p className="text-[9px] text-on-surface-variant font-mono uppercase">Vehicles</p>
                </div>
                <div className="text-center border-l border-white/5">
                  <p className="text-sm font-bold">2.4k</p>
                  <p className="text-[9px] text-on-surface-variant font-mono uppercase">Karma</p>
                </div>
              </div>
              <Link to="/garage" className="block w-full mt-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-widest transition-all text-center">
                My Profile
              </Link>
            </div>

            {/* Hub Navigation */}
            <div className="glass-card rounded-[2rem] p-6 border-white/5">
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-4 text-on-surface-variant">Explore Hub</h3>
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

            {/* Trending Tags */}
            <div className="glass-card rounded-[2rem] p-6 border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Hot Topics</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map(tag => (
                  <button key={tag} className="px-3 py-1.5 rounded-full bg-surface-container text-[10px] font-medium hover:text-primary hover:bg-primary/10 transition-colors">
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content: Social Feed */}
          <section className="col-span-1 lg:col-span-6 space-y-6">
            
            {/* Feed Header (Mobile only) */}
            <div className="lg:hidden flex items-center justify-between mb-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">The Hub</h1>
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
                    onFocus={() => setIsPosting(true)}
                    value={postContent}
                    onChange={(event) => setPostContent(event.target.value)}
                    placeholder="Share your car's latest adventure..." 
                    className="w-full bg-transparent border-none focus:ring-0 text-base md:text-lg resize-none min-h-[60px] max-h-40 py-2"
                  />
                  
                  <AnimatePresence>
                    {isPosting && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between pt-4 border-t border-white/5"
                      >
                        <div className="flex gap-2">
                          <button className="interactive-icon text-primary"><Camera className="w-5 h-5" /></button>
                          <button className="interactive-icon"><Hash className="w-5 h-5" /></button>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setIsPosting(false)} className="text-xs text-on-surface-variant font-bold hover:text-on-surface transition-colors">Cancel</button>
                          <button
                            onClick={handleCreatePost}
                            disabled={!postContent.trim() || isSubmittingPost || !isAuthenticated}
                            className="btn-primary py-2 px-6 text-xs rounded-full shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmittingPost ? 'Posting...' : isAuthenticated ? 'Post Hub' : 'Sign in to post'}
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
              {posts.map((post, i) => (
                <SocialPost key={i} {...post} />
              ))}
            </div>

            {/* End of Feed Message */}
            <div className="py-20 text-center opacity-40">
              <Sparkles className="w-8 h-8 mx-auto mb-4 text-primary animate-pulse" />
              <p className="font-display text-lg font-bold mb-1">You're all caught up!</p>
              <p className="text-xs font-mono uppercase tracking-[0.25em]">Transmission Complete</p>
            </div>
          </section>

          {/* Right Sidebar: Contextual Content */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Community Stats Card */}
            <div className="glass-card rounded-[2rem] p-6 border-white/5">
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Global Reach</h3>
              <div className="space-y-4">
                {communityStats.map(stat => (
                  <div key={stat.label} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <span className="text-xs text-on-surface-variant">{stat.label}</span>
                    <span className="font-bold text-primary font-mono">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Who to Follow */}
            <div className="glass-card rounded-[2rem] p-6 border-white/5">
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Top Collectors</h3>
              <div className="space-y-5">
                {[
                  { name: "Julian Vance", handle: "jvance_auto", avatar: "https://i.pravatar.cc/100?u=jv" },
                  { name: "Sarah J.", handle: "sarah_gt", avatar: "https://i.pravatar.cc/100?u=sj" },
                  { name: "Sotheby's", handle: "sothebys_sealed", avatar: "https://i.pravatar.cc/100?u=ss" },
                ].map((user, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group">
                      <img src={user.avatar} className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary/50 transition-colors" alt={user.name} />
                      <div>
                        <p className="text-xs font-bold group-hover:text-primary transition-colors">{user.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">@{user.handle}</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold text-primary hover:bg-primary/10 px-3 py-1 rounded-full transition-all">Follow</button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2.5 text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors">
                View Global Registry →
              </button>
            </div>

            <Footer hideLogo />
          </aside>
        </div>
      </motion.main>

      {/* Social Floating Action (Mobile only) */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 lg:hidden w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center z-50 shimmer-effect"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <MobileNav />
    </div>
  );
}
