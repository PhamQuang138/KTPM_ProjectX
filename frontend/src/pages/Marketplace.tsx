import TopNav from '../components/TopNav';
import Sidebar from '../components/Sidebar';
import VehicleCard from '../components/VehicleCard';
import MobileNav from '../components/MobileNav';
import { Search, Flame, Clock, TrendingUp, Filter, ArrowRight, Star, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { useSidebarStore } from '../store/useSidebarStore';
import { apiRequest } from '../lib/api';
import { Link } from 'react-router-dom';

interface VehicleData {
  id: string;
  description?: string;
  image: string;
  images?: string[];
  price: string;
  title: string;
  location: string;
  seller: {
    name: string;
    avatar?: string | null;
    email?: string;
    isVerified: boolean;
  };
  condition: string;
  timestamp: string;
  specs: string[];
  status?: string;
  category?: string;
  vehicle?: {
    image: string;
    images: string[];
    condition: string;
    specs: string[];
  } | null;
}

export default function Marketplace() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const { isOpen } = useSidebarStore();

  useEffect(() => {
    const query = new URLSearchParams();
    if (filter !== 'All') query.set('category', filter);
    if (search.trim()) query.set('search', search.trim());

    apiRequest<any[]>(`/vehicles${query.toString() ? `?${query.toString()}` : ''}`)
      .then((data) => {
        setVehicles(
          data.map((vehicle) => ({
            ...vehicle,
            image: vehicle.vehicle?.image ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200',
            images: vehicle.vehicle?.images ?? [],
            condition: vehicle.vehicle?.condition ?? 'Used',
            specs: vehicle.vehicle?.specs ?? [],
            timestamp: 'Listed',
            seller: {
              name: vehicle.seller.name,
              avatar: vehicle.seller.avatar,
              email: vehicle.seller.email,
              isVerified: true,
            },
          })),
        );
      })
      .catch(() => setVehicles([]));
  }, [filter, search]);

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar />
      <motion.main 
        animate={{ marginLeft: isOpen ? '16rem' : '0rem' }}
        className="pb-24 transition-all duration-300"
      >
        <TopNav title="Marketplace" />

        {/* Hero Section */}
        <section className="relative px-6 md:px-margin-desktop max-w-container-max mx-auto pt-8 pb-12">
           <div className="relative h-[500px] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000" 
                className="w-full h-full object-cover grayscale opacity-60 transition-all duration-1000 group-hover:grayscale-0"
                alt="Banner"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              
              <div className="absolute bottom-16 left-12 right-12 flex flex-col md:flex-row items-end justify-between gap-8">
                <div className="max-w-2xl">
                   <div className="flex items-center gap-3 mb-6">
                      <span className="badge-primary px-4 py-1.5">Weekly Special</span>
                      <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest border border-white/5">03:45:22 Remaining</span>
                   </div>
                   <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[0.9]">
                      The Art of the <span className="text-primary italic">Daily Driver</span>
                   </h1>
                   <p className="text-on-surface-variant text-lg max-w-md opacity-80 leading-relaxed">
                      Discover curated classic cars that are build to be driven, not just admired. Verified by our community experts.
                   </p>
                </div>
                <div className="flex gap-4">
                   <button className="btn-primary px-12 py-4 rounded-2xl shadow-2xl shadow-primary/20">Explore Hot Drops</button>
                </div>
              </div>
           </div>
        </section>

        {/* Global Search & Filters */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-margin-desktop mb-12">
          <div className="max-w-container-max mx-auto flex flex-col md:flex-row gap-6 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Find your next obsession..." 
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-surface-container h-14 pl-12 pr-4 rounded-2xl text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary/40 border border-white/5"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              {['All', 'Exotics', 'Classics', 'Projects', 'Daily'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 h-14 rounded-2xl text-[10px] font-mono uppercase tracking-widest transition-all border ${
                    filter === cat ? 'bg-primary text-on-primary border-primary' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button className="btn-secondary h-14 w-14 rounded-2xl p-0 flex items-center justify-center">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* Listings Grid */}
           <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="font-display text-2xl font-bold tracking-tight">Verified Inventory</h2>
                 <div className="flex gap-4">
                    <button className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold hover:underline">Newest First</button>
                    <button className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Price: Low to High</button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
                {vehicles.map((v, i) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={`/market/${v.id}`} className="block h-full">
                      <VehicleCard {...v} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {vehicles.length === 0 && (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-12 text-center text-on-surface-variant">
                  No listings found. Add a vehicle from My Garage to publish it here.
                </div>
              )}

              {/* Pagination/Load more */}
              <div className="pt-12 border-t border-white/5 flex justify-center">
                 <button className="btn-secondary px-12 py-4 flex items-center gap-2 group rounded-2xl">
                    Show More Listings
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>

           {/* Market Sidebar */}
           <aside className="lg:col-span-4 space-y-12">
              
              {/* Market Health Card */}
              <div className="glass-card p-8 rounded-[2.5rem] border-primary/10 overflow-hidden relative group">
                 <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                 <h3 className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest mb-6 font-bold">
                    <TrendingUp className="w-4 h-4" /> Market Pulse
                 </h3>
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between items-end mb-2">
                          <p className="text-xl font-bold font-display">Bullish Market</p>
                          <span className="text-green-400 text-xs font-mono font-bold">+18.2%</span>
                       </div>
                       <p className="text-xs text-on-surface-variant leading-relaxed">
                          911 Carrera demand has peaked this month. Sellers represent a 3:1 ratio to active collectors.
                       </p>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                       <div className="text-center">
                          <p className="text-lg font-bold">1.2k</p>
                          <p className="text-[10px] text-on-surface-variant font-mono uppercase">Live Bids</p>
                       </div>
                       <div className="text-center">
                          <p className="text-lg font-bold">428</p>
                          <p className="text-[10px] text-on-surface-variant font-mono uppercase">Sold Today</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Community Activity Hot List */}
              <div className="space-y-6">
                 <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-4 text-on-surface-variant">Hot Community Activity</h3>
                 {[
                   { user: "Sarah J.", avatar: "https://i.pravatar.cc/100?u=1", action: "listed for auction", item: "1982 Alpine A310", comments: 42, likes: 156 },
                   { user: "Maikel V.", avatar: "https://i.pravatar.cc/100?u=2", action: "sold to a community member", item: "Ferrari F40", comments: 89, likes: 1205 },
                   { user: "GarageX", avatar: "https://i.pravatar.cc/100?u=3", action: "verified a new listing", item: "Lancia Delta Evo II", comments: 12, likes: 67 }
                 ].map((act, i) => (
                   <div key={i} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-all">
                      <img src={act.avatar} className="w-10 h-10 rounded-full border border-white/10" alt={act.user} />
                      <div className="flex-grow pt-1">
                         <p className="text-sm leading-snug">
                            <span className="font-bold text-on-surface">{act.user}</span>
                            <span className="text-on-surface-variant"> {act.action} </span>
                            <span className="text-primary font-medium">{act.item}</span>
                         </p>
                         <div className="flex gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-mono text-on-surface-variant uppercase"><MessageSquare className="w-3 h-3" /> {act.comments}</span>
                            <span className="flex items-center gap-1.5 text-[10px] font-mono text-on-surface-variant uppercase"><Star className="w-3 h-3" /> {act.likes}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              {/* Verified Seller CTA */}
              <div className="p-8 rounded-[2.5rem] bg-surface-container-high border border-white/5 shadow-2xl">
                 <Users className="w-10 h-10 text-primary mb-6" />
                 <h3 className="font-display text-xl font-bold mb-4">Become a Pro Seller</h3>
                 <p className="text-sm text-on-surface-variant leading-relaxed opacity-70 mb-8">
                    Gain the 'Verified Pro' badge, priority listing placement, and access to private community auctions.
                 </p>
                 <button className="btn-primary w-full py-4 rounded-2xl font-bold">Apply for Verification</button>
              </div>

           </aside>
        </div>
      </motion.main>
      <MobileNav />
    </div>
  );
}
