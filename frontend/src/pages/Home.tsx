import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight, 
  ShoppingBag, 
  Users, 
  PenTool, 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  MessageSquare,
  Search,
  Star,
  ChevronRight
} from 'lucide-react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

const features = [
  {
    icon: ShoppingBag,
    title: 'Modern Marketplace',
    description: 'Buy and sell everything from daily drivers to rare collectibles with zero platform fees.',
    color: 'bg-blue-500/10 text-blue-400',
    link: '/market'
  },
  {
    icon: Users,
    title: 'Vibrant Community',
    description: 'Join thousands of enthusiasts discussing maintenance, modifications, and road trips.',
    color: 'bg-purple-500/10 text-purple-400',
    link: '/feed'
  },
  {
    icon: PenTool,
    title: 'Expert Blogging',
    description: 'Share your ownership journey, write reviews, and build your reputation as an expert.',
    color: 'bg-orange-500/10 text-orange-400',
    link: '/feed'
  }
];

import BlogCard from '../components/BlogCard';

interface HomeOverview {
  stats: {
    members: number;
    publishedPosts: number;
    recentPosts: number;
    interactions: number;
  };
}

interface HomeVehicle {
  id: string;
  title: string;
  price: string;
  vehicle?: {
    image: string;
  } | null;
}

interface HomeArticle {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  readTime?: string | null;
  image?: string | null;
  category: string;
  publishedAt?: string | null;
  createdAt: string;
}

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const gatedPath = (path: string) => (isAuthenticated ? path : '/login');
  const [overview, setOverview] = useState<HomeOverview | null>(null);
  const [vehicles, setVehicles] = useState<HomeVehicle[]>([]);
  const [articles, setArticles] = useState<HomeArticle[]>([]);

  useEffect(() => {
    Promise.all([
      apiRequest<HomeOverview>('/posts/community-overview'),
      apiRequest<HomeVehicle[]>('/vehicles'),
      apiRequest<HomeArticle[]>('/articles'),
    ])
      .then(([overviewData, vehicleData, articleData]) => {
        setOverview(overviewData);
        setVehicles(vehicleData.slice(0, 4));
        setArticles(articleData.slice(0, 3));
      })
      .catch(() => undefined);
  }, []);

  const stats = [
    {label: 'Thành viên', value: overview?.stats.members ?? 0, suffix: 'Cộng đồng'},
    {label: 'Bài đã đăng', value: overview?.stats.publishedPosts ?? 0, suffix: 'Nội dung'},
    {label: 'Bài mới 7 ngày', value: overview?.stats.recentPosts ?? 0, suffix: 'Hoạt động'},
    {label: 'Tổng tương tác', value: overview?.stats.interactions ?? 0, suffix: 'Kết nối'},
  ];

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNav />
      
      <main>
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
             <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen" />
          </div>

          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop relative z-10 text-center">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
             >
               <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
               <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold">The Future of Car Culture</span>
             </motion.div>

             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.1 }}
               className="font-display text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] mb-8"
             >
               BUY, SELL & SHARE <br />
               <span className="text-primary italic">YOUR JOURNEY</span>
             </motion.h1>

             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl leading-relaxed mb-12 opacity-80"
             >
               CarHub is the complete automotive ecosystem. Join the global community where enthusiasts connect, trade, and document their life on the road.
             </motion.p>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="flex flex-col sm:flex-row items-center justify-center gap-4"
             >
               <Link to={gatedPath('/market')} className="btn-primary px-10 py-5 rounded-2xl text-base shadow-2xl shadow-primary/20 group w-full sm:w-auto">
                 Explore Marketplace
                 <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link to={gatedPath('/feed')} className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-on-background px-10 py-5 rounded-2xl text-base transition-all w-full sm:w-auto">
                 Join Community
               </Link>
             </motion.div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-20 border-y border-white/5 bg-white/[0.02]">
           <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                 {stats.map((stat, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0 }}
                     whileInView={{ opacity: 1 }}
                     viewport={{ once: true }}
                     className="text-center"
                   >
                     <p className="font-display text-4xl md:text-5xl font-bold mb-2 tracking-tighter">{stat.value}</p>
                     <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary font-bold mb-1">{stat.label}</p>
                     <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant opacity-40">{stat.suffix}</p>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* FEATURES OVERVIEW */}
        <section className="py-32 px-6 md:px-margin-desktop max-w-container-max mx-auto">
           <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
              <div className="max-w-xl">
                 <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary font-bold mb-4">Core Ecosystem</h2>
                 <h3 className="font-display text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
                    Beyond just listings. <br /> A home for enthusiasts.
                 </h3>
              </div>
              <p className="text-on-surface-variant max-w-sm opacity-70">
                 We've built everything you need to manage your automotive life in one seamless digital home.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8 }}
                  className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-8 border border-white/5`}>
                     <f.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold mb-4">{f.title}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-8 opacity-80">{f.description}</p>
                  <Link to={gatedPath(f.link)} className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-primary font-bold group-hover:gap-4 transition-all">
                     Explore More <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
           </div>
        </section>

        {/* MARKETPLACE PREVIEW */}
        <section className="py-32 bg-surface-container/30">
           <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <h3 className="font-display text-3xl font-bold tracking-tight">Trending Listings</h3>
                    <p className="text-sm text-on-surface-variant mt-2">The hottest finds updated hourly</p>
                 </div>
                 <Link to={gatedPath('/market')} className="btn-secondary px-6">View All Listings</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {vehicles.map((vehicle) => (
                   <motion.div
                     key={vehicle.id}
                     whileHover={{ scale: 1.02 }}
                     className="rounded-2xl overflow-hidden border border-white/5 bg-background group cursor-pointer"
                   >
                     <Link to={gatedPath(`/market/${vehicle.id}`)} className="block">
                       <div className="aspect-video overflow-hidden bg-white/[0.03]">
                          {vehicle.vehicle?.image && <img src={vehicle.vehicle.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={vehicle.title} />}
                       </div>
                       <div className="p-5">
                          <h4 className="font-bold mb-1 truncate">{vehicle.title}</h4>
                          <p className="text-primary font-mono text-sm font-bold">{vehicle.price}</p>
                       </div>
                     </Link>
                   </motion.div>
                 ))}
                 {vehicles.length === 0 && <p className="text-sm text-on-surface-variant">Chưa có xe nào đang được đăng bán.</p>}
              </div>
           </div>
        </section>

        {/* LATEST STORIES & BLOGS */}
        <section className="py-32 px-6 md:px-margin-desktop max-w-container-max mx-auto">
           <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
              <div>
                 <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary font-bold mb-4">The Editorial</h2>
                 <h3 className="font-display text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
                    Automotive depth. <br /> Curated by experts.
                 </h3>
              </div>
              <Link to={gatedPath('/feed')} className="btn-secondary px-8">Browse All Stories</Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.map((article) => (
                <BlogCard
                  key={article.id}
                  title={article.title}
                  excerpt={article.excerpt}
                  author={article.author}
                  date={new Date(article.publishedAt ?? article.createdAt).toLocaleDateString('vi-VN')}
                  readTime={article.readTime ?? 'Đang cập nhật'}
                  image={article.image ?? ''}
                  category={article.category}
                />
              ))}
              {articles.length === 0 && <p className="text-sm text-on-surface-variant">Chưa có bài chuyên đề nào được xuất bản.</p>}
           </div>
        </section>

        {/* WHY CHOOSE CARHUB */}
        <section className="py-32 px-6 md:px-margin-desktop max-w-container-max mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                 <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200" 
                      className="w-full h-full object-cover opacity-80" 
                      alt="Enthusiasts"
                    />
                 </div>
                 <div className="absolute -bottom-10 -right-10 bg-primary p-10 rounded-[3rem] shadow-2xl hidden md:block">
                    <Star className="w-12 h-12 text-on-primary fill-current" />
                 </div>
              </div>

              <div className="space-y-12">
                 <div className="space-y-6">
                    <h3 className="font-display text-4xl md:text-5xl font-bold tracking-tighter leading-tight">Trusted by 100k+ global enthusiasts.</h3>
                    <p className="text-on-surface-variant text-lg leading-relaxed opacity-80">Our platform is built on trust, verification, and passion. We're not just about transactions; we're about the stories behind every mile.</p>
                 </div>

                 <div className="space-y-8">
                    {[
                      { icon: ShieldCheck, title: 'Verified History', desc: 'Every premium listing undergoes a community-sourced verification process.' },
                      { icon: Globe, title: 'Global Network', desc: 'Connect with experts from Tokyo to Tokyo specializing in every niche.' },
                      { icon: MessageSquare, title: 'Active Conversations', desc: 'Real-time discussions on the topics that matter most to drivers.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6">
                         <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <item.icon className="w-6 h-6 text-primary" />
                         </div>
                         <div>
                            <h4 className="font-bold mb-1">{item.title}</h4>
                            <p className="text-sm text-on-surface-variant leading-relaxed opacity-70">{item.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 px-6 md:px-margin-desktop max-w-container-max mx-auto">
           <div className="p-16 md:p-24 rounded-[4rem] bg-primary relative overflow-hidden text-center group">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
              
              <h2 className="relative z-10 font-display text-5xl md:text-7xl font-bold text-on-primary tracking-tighter mb-8 max-w-3xl mx-auto">
                Ready to join the <br /> automotive revolution?
              </h2>
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Link to="/login" className="bg-white text-primary px-12 py-5 rounded-2xl text-lg font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                    Get Started Free
                 </Link>
                 <Link to={gatedPath('/market')} className="border-2 border-white/30 text-white px-12 py-5 rounded-2xl text-lg font-bold hover:bg-white hover:text-primary transition-all w-full sm:w-auto">
                    List Your Vehicle
                 </Link>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
