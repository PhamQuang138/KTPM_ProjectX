import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShoppingBag, 
  Users, 
  Car,
  ShieldCheck, 
  Database,
  MessageSquare,
  Star,
  ChevronRight
} from 'lucide-react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { apiRequest } from '../lib/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: ShoppingBag,
    title: 'Chợ xe cộng đồng',
    description: 'Tìm kiếm, lọc và xem chi tiết các tin xe đang được thành viên đăng bán trên hệ thống.',
    color: 'bg-blue-500/10 text-blue-400',
    link: '/market',
    image: '/images/carhub/explore/feature-market.jpg'
  },
  {
    icon: Users,
    title: 'Cộng đồng người yêu xe',
    description: 'Đăng bài, chia sẻ nhiều hình ảnh, bình luận, thả tim và theo dõi những thành viên bạn quan tâm.',
    color: 'bg-purple-500/10 text-purple-400',
    link: '/feed',
    image: '/images/carhub/explore/feature-community.jpg'
  },
  {
    icon: Car,
    title: 'Gara cá nhân',
    description: 'Lưu thông tin xe của bạn, quản lý hình ảnh và tạo tin bán trực tiếp từ gara.',
    color: 'bg-orange-500/10 text-orange-400',
    link: '/garage',
    image: '/images/carhub/explore/feature-garage.jpg'
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

interface HomeMarketplaceResponse {
  items: HomeVehicle[];
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
  const pageRef = useRef<HTMLDivElement | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const gatedPath = (path: string) => (isAuthenticated ? path : '/login');
  const [overview, setOverview] = useState<HomeOverview | null>(null);
  const [vehicles, setVehicles] = useState<HomeVehicle[]>([]);
  const [articles, setArticles] = useState<HomeArticle[]>([]);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.explore-hero-media',
        {scale: 1.08, autoAlpha: 0.72},
        {
          scale: 1,
          autoAlpha: 0.95,
          ease: 'none',
          scrollTrigger: {
            trigger: '.explore-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        },
      );

      ScrollTrigger.batch('.explore-reveal', {
        start: 'top 82%',
        once: true,
        onEnter: (elements) => {
          gsap.to(elements, {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power3.out',
            overwrite: true,
          });
        },
      });

      gsap.utils.toArray<HTMLElement>('.explore-image').forEach((image) => {
        gsap.fromTo(
          image,
          {scale: 0.88, autoAlpha: 0.45},
          {
            scale: 1,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: image,
              start: 'top 88%',
              end: 'bottom 28%',
              scrub: 0.7,
            },
          },
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    Promise.all([
      apiRequest<HomeOverview>('/posts/community-overview'),
      apiRequest<HomeMarketplaceResponse>('/vehicles?limit=4&sort=trending'),
      apiRequest<HomeArticle[]>('/articles'),
    ])
      .then(([overviewData, vehicleData, articleData]) => {
        setOverview(overviewData);
        setVehicles(vehicleData.items.slice(0, 4));
        setArticles(articleData.slice(0, 3));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (vehicles.length > 0 || articles.length > 0) {
      const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 80);
      return () => window.clearTimeout(refreshId);
    }
  }, [articles.length, vehicles.length]);

  const stats = [
    {label: 'Thành viên', value: overview?.stats.members ?? 0, suffix: 'Tài khoản'},
    {label: 'Bài cộng đồng', value: overview?.stats.publishedPosts ?? 0, suffix: 'Đã xuất bản'},
    {label: 'Bài mới 7 ngày', value: overview?.stats.recentPosts ?? 0, suffix: 'Hoạt động gần đây'},
    {label: 'Tổng tương tác', value: overview?.stats.interactions ?? 0, suffix: 'Thích, bình luận, chia sẻ'},
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-background text-on-background">
      <TopNav />
      
      <main className="w-full max-w-full overflow-x-hidden">
        {/* HERO SECTION */}
        <section className="explore-hero relative flex min-h-[calc(100vh-76px)] items-center overflow-hidden bg-[#070707] pb-28 pt-20">
          <img
            src="/images/carhub/explore/explore-hero.jpg"
            alt="Cộng đồng ô tô CarHub"
            className="explore-hero-media absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-90 will-change-transform"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,transparent_0%,rgba(7,7,7,0.15)_28%,rgba(7,7,7,0.88)_76%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-background" />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/85 to-transparent" />

          <div className="absolute left-6 top-1/2 z-10 hidden h-44 -translate-y-1/2 flex-col items-center justify-between lg:flex">
            <span className="h-14 w-px bg-gradient-to-b from-primary to-white/15" />
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_rgba(255,255,255,0.45)]" />
            <span className="h-24 w-px bg-gradient-to-b from-white/15 to-transparent" />
          </div>

          <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop relative z-10 text-center">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="mb-8 inline-flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/55"
             >
               <span className="h-px w-12 bg-primary" />
               <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold">Cộng đồng ô tô CarHub</span>
             </motion.div>

             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.1 }}
               className="hero-title mx-auto mb-9 max-w-5xl"
             >
               <span>MUA BÁN, KẾT NỐI</span>
               <span className="hero-title-accent">VÀ CHIA SẺ ĐAM MÊ</span>
             </motion.h1>

             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl leading-relaxed mb-12 opacity-80"
             >
               Một nơi để thành viên chia sẻ bài viết, quản lý gara, đăng bán xe và trao đổi trực tiếp với nhau.
             </motion.p>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="flex flex-col sm:flex-row items-center justify-center gap-4"
             >
               <Link to={gatedPath('/market')} className="btn-primary px-10 py-5 rounded-2xl text-base shadow-2xl shadow-primary/20 group w-full sm:w-auto">
                 Khám phá chợ xe
                 <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link to={gatedPath('/feed')} className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-on-background px-10 py-5 rounded-2xl text-base transition-all w-full sm:w-auto">
                 Tham gia cộng đồng
               </Link>
             </motion.div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/25 backdrop-blur-sm">
            <div className="mx-auto grid max-w-container-max gap-3 px-6 py-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 sm:grid-cols-3 md:px-margin-desktop lg:grid-cols-5">
              {[
                ['Bộ sưu tập', 'Garage'],
                ['Kết nối', 'Community'],
                ['Tin mua bán', 'Marketplace'],
                ['Tương tác', `${overview?.stats.interactions ?? 0}`],
                ['Thành viên', `${overview?.stats.members ?? 0}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-white/10 sm:border-r sm:pr-4 last:border-r-0">
                  <span>{label}</span>
                  <span className="text-white/80">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-24 md:py-32 border-y border-white/5 bg-white/[0.02]">
           <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                 {stats.map((stat, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0 }}
                     whileInView={{ opacity: 1 }}
                     viewport={{ once: true }}
                     className="explore-reveal text-center opacity-0 translate-y-8"
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
        <section className="py-32 md:py-44 px-6 md:px-margin-desktop max-w-container-max mx-auto">
           <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
              <motion.div
                 initial={{opacity: 0, y: 28}}
                 whileInView={{opacity: 1, y: 0}}
                 viewport={{once: true, amount: 0.45}}
                 transition={{duration: 0.65, ease: [0.22, 1, 0.36, 1]}}
                 className="explore-reveal max-w-3xl opacity-0 translate-y-8"
              >
                 <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary font-bold mb-4">Chức năng chính</h2>
                 <h3 className="font-display text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
                    Mọi hoạt động về xe. <br /> Trong cùng một hệ thống.
                 </h3>
              </motion.div>
              <p className="text-on-surface-variant max-w-sm opacity-70">
                 Các nội dung bên dưới được lấy từ tài khoản, bài viết và tin xe đang lưu trong cơ sở dữ liệu CarHub.
              </p>
           </div>

           <div className="grid grid-flow-dense grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8 }}
                  initial={{opacity: 0, y: 28}}
                  whileInView={{opacity: 1, y: 0}}
                  viewport={{once: true, amount: 0.35}}
                  transition={{duration: 0.55, delay: i * 0.08}}
                  className="explore-reveal overflow-hidden rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all group opacity-0 translate-y-8"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-black">
                     <img src={f.image} alt={f.title} className="explore-image h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90 will-change-transform" />
                     <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                     <div className={`absolute left-5 top-5 w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center border border-white/10 backdrop-blur-md`}>
                        <f.icon className="w-6 h-6" />
                     </div>
                  </div>
                  <h4 className="px-7 pt-7 text-xl font-bold mb-4">{f.title}</h4>
                  <p className="px-7 text-sm text-on-surface-variant leading-relaxed mb-8 opacity-80">{f.description}</p>
                  <Link to={gatedPath(f.link)} className="mx-7 mb-7 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-primary font-bold group-hover:gap-4 transition-all">
                     Mở chức năng <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
           </div>
        </section>

        {/* MARKETPLACE PREVIEW */}
        <section className="py-32 md:py-44 bg-surface-container/30">
           <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
              <div className="flex items-center justify-between mb-12">
                 <motion.div
                    initial={{opacity: 0, y: 24}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1]}}
                    className="explore-reveal opacity-0 translate-y-8"
                 >
                    <h3 className="font-display text-3xl font-bold tracking-tight">Tin xe được quan tâm</h3>
                    <p className="text-sm text-on-surface-variant mt-2">Sắp xếp từ dữ liệu lượt lưu và bình luận thực tế</p>
                 </motion.div>
                 <Link to={gatedPath('/market')} className="btn-secondary px-6">Xem toàn bộ tin xe</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {vehicles.map((vehicle) => (
                   <motion.div
                     key={vehicle.id}
                     initial={{opacity: 0, y: 24}}
                     whileInView={{opacity: 1, y: 0}}
                     viewport={{once: true, amount: 0.25}}
                     transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
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
        <section className="py-32 md:py-44 px-6 md:px-margin-desktop max-w-container-max mx-auto">
           <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
              <motion.div
                 initial={{opacity: 0, y: 28}}
                 whileInView={{opacity: 1, y: 0}}
                 viewport={{once: true, amount: 0.45}}
                 transition={{duration: 0.65, ease: [0.22, 1, 0.36, 1]}}
              >
                 <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary font-bold mb-4">Chuyên đề CarHub</h2>
                 <h3 className="font-display text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
                    Kiến thức ô tô thực tế. <br /> Được biên tập đầy đủ.
                 </h3>
              </motion.div>
              <p className="max-w-sm text-sm leading-relaxed text-on-surface-variant">
                Chọn một bài viết bên dưới để đọc toàn bộ nội dung, kinh nghiệm và hướng dẫn chi tiết.
              </p>
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
                  to={`/articles/${article.id}`}
                />
              ))}
              {articles.length === 0 && <p className="text-sm text-on-surface-variant">Chưa có bài chuyên đề nào được xuất bản.</p>}
           </div>
        </section>

        {/* WHY CHOOSE CARHUB */}
        <section className="py-32 px-6 md:px-margin-desktop max-w-container-max mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                 <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <img 
                      src="/images/carhub/explore/feature-garage.jpg" 
                      className="explore-image w-full h-full object-cover opacity-80 will-change-transform" 
                      alt="Enthusiasts"
                    />
                 </div>
                 <div className="absolute -bottom-10 -right-10 bg-primary p-10 rounded-[3rem] shadow-2xl hidden md:block">
                    <Star className="w-12 h-12 text-on-primary fill-current" />
                 </div>
              </div>

              <div className="space-y-12">
                 <motion.div
                    initial={{opacity: 0, y: 28}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.45}}
                    transition={{duration: 0.65, ease: [0.22, 1, 0.36, 1]}}
                    className="explore-reveal space-y-6 opacity-0 translate-y-8"
                 >
                    <h3 className="font-display text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
                      {overview?.stats.members ?? 0} thành viên đang xây dựng cộng đồng CarHub.
                    </h3>
                    <p className="text-on-surface-variant text-lg leading-relaxed opacity-80">
                      Dữ liệu tài khoản, bài cộng đồng, gara, tin bán xe và hội thoại đều được lưu trong hệ thống để người dùng tiếp tục công việc trên mọi thiết bị.
                    </p>
                 </motion.div>

                 <div className="space-y-8">
                    {[
                      { icon: ShieldCheck, title: 'Tài khoản và quyền quản lý', desc: 'Quản trị viên và tài khoản đã xác thực được nhận diện rõ ràng; người dùng chỉ sửa hoặc xóa nội dung thuộc quyền của mình.' },
                      { icon: Database, title: 'Dữ liệu được lưu tập trung', desc: `${overview?.stats.publishedPosts ?? 0} bài cộng đồng và ${overview?.stats.interactions ?? 0} lượt tương tác đang được ghi nhận trong cơ sở dữ liệu.` },
                      { icon: MessageSquare, title: 'Trao đổi trực tiếp', desc: 'Người mua có thể nhắn tin cho người bán và cuộc trò chuyện được gắn với đúng tin xe đang quan tâm.' }
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
              <h2 className="relative z-10 font-display text-5xl md:text-7xl font-bold text-on-primary tracking-tighter mb-8 max-w-3xl mx-auto">
                Bắt đầu hành trình <br /> của bạn trên CarHub
              </h2>
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Link to="/login" className="bg-white text-primary px-12 py-5 rounded-2xl text-lg font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                    Đăng nhập hoặc đăng ký
                 </Link>
                 <Link to={gatedPath('/garage?addVehicle=1')} className="border-2 border-white/30 text-white px-12 py-5 rounded-2xl text-lg font-bold hover:bg-white hover:text-primary transition-all w-full sm:w-auto">
                    Đăng bán xe
                 </Link>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
