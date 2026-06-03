import TopNav from '../components/TopNav';
import Sidebar from '../components/Sidebar';
import VehicleCard from '../components/VehicleCard';
import MobileNav from '../components/MobileNav';
import { Search, Flame, Clock, TrendingUp, Filter, ArrowRight, Star, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useSidebarStore } from '../store/useSidebarStore';

interface VehicleData {
  image: string;
  price: string;
  title: string;
  location: string;
  seller: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  condition: string;
  timestamp: string;
  specs: string[];
}

const vehicles: VehicleData[] = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQcQwnFFiEl1uaEzWESRhLrrSmtUEXLk_aTY5GsfuNE2ZwHKMzO0ApXtv6ZwPkBCSYd_iQj3wiCSo9X97Y1dWXHF59FzI8n6gUllE2SVFuTQWAbZepD1t14ugConVJCdPvFt0yCLq7s3c_6O6zt2ufeNM4fRDemBJHX7kram1oxbzUZGRbQN5WZo5cWxgIhSByeJr-7mFte6R4OxB46WfNkHE8ZcGttyVRyHhixX3bz2XEWQJmlJzSDhQKqVvcN4rpxg8kPDDnZw",
    price: "$145,000",
    title: "1972 Porsche 911 Carrera RS",
    location: "Los Angeles, CA",
    seller: {
      name: "Heritage Motors",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuALrnP11mR5J3hDSTFCrB33JVno9FYrLSrWAVteCwwmYOrgn7oE-8h1e8jpF9OiIIAHcF3KREZjBg0gvlwkcyM49Gl0Bb18tpAaVmeQ7FerPdly7woocsNCYOCkHpOR9s99Y2z3JsxWu_QXAWiuSZzTYXo3sPhvWdNryUr9v3F2Nbb0GVJ8hFZzi8YgufHq01ZfBRYraaYgFKE1eMKMeHJCoe3vUX3Mss_2bb23Dfkg2PFpgYPvRrWN01U_zCLdiVUAbG2H5IrA8g",
      isVerified: true
    },
    condition: "Used",
    timestamp: "2H AGO",
    specs: ["Air-cooled", "Manual", "Matching Numbers"]
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOe_0Ua-8kY2iXOnXoZk_sUP6vXfXy1u2-I-zXm_sX5_P6Xy_eI_3iI9I_s_P-1XOxyv7gixYd-PI7FL8vzNt9QJdHESe-6R17DJjTOH3H6R4DUmkIyOLVfr-D1KaRtep5gKSevh6YqL8PFXrzxvFmeQDVvB3q49BY2T7pMTCTXnD4zH54QDb1hXR_YDbzTThG98o6ghoboeH88JMb4ExF1nQDo54veUmUzxNPijdgb2lrdRqqN6oomi1XBOYEqEy5UXAy7K9MQ",
    price: "$2,400,000",
    title: "2024 Rimac Nevera",
    location: "Miami, FL",
    seller: {
      name: "Luxury Curator",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKEFr6NJ-L6vYiisXeAxxPqpYoha_LfgfIWlzkJqrl1Sd2t-Kc2uFJSf9pn73_IWE1EJzzt1qYeL5PepVF0LuT5tuW0Qb5yRCDStoCRUgGckzgmHYeIS8WmddnvjDtrjqhk5iMxLb7vexVix3_Ai5hYE2CnkRU3NOFFAdtJY8Z2tqRWGfagL55bsjFbdYq-poNirIoVEIaEx0qTmozEnLJg-Ter_Vus7uA5B0zlSewbU9WCl0bVKjbA_FLpoKMP0y_3TuH5pA1Hw",
      isVerified: true
    },
    condition: "New",
    timestamp: "5M AGO",
    specs: ["Electric", "1914 HP", "Zero Emissions"]
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzbGc79wRDwQ_momj-3sTjjTroOfr9NwRjTo8-ZNhrSD1vshBO2Ye6i90wVL0QxYHwQLZim9_2tSrvq-FNqmaTo4nIIoaauJ0VDvJj30QUd8kH_DtlxOSNsr2mrG1lYV9G67RNzLsBxUG4k7Uq9Qz63xcBgevyfywKM38Lqk2I6EwHbU4Ruj_yMLFj_y4l8vS4aA0R39eFAL8vvnfja4mKNhYuxM6YaBetUjwHi8P25e2auRCFXSzk6A8kcX3aZ6-arKa4vVnyvg",
    price: "$48,500,000",
    title: "1962 Ferrari 250 GTO",
    location: "London, UK",
    seller: {
      name: "Sotheby's Sealed",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtTyfZN2GLtwxu_E2aO10ac9h6ArDesmlht3mSybvyzasL1neaNXZf5oeHIsoexnoS-CXcR9E7TqTUHZlY0bS7X8nfq9CkUSBl_6EzVL7RRUEitOkoVF6SGVwnhizDoMBNIYx3BI3VC0ZX8a95MzVEJTC-g8r769iHlOC2WUEv75rE5K4AqvOKZACZTU3XfRkLl7bBYy1Itdpopb_hArFIvF-U2T_vFgIni7Btr6yfindNlt5tv1dTwhOOl5IxNieFNEHPfdJPgw",
      isVerified: true
    },
    condition: "Used",
    timestamp: "1D AGO",
    specs: ["V12", "Collector Grade", "Racing History"]
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3aPfyF_LB1tLXUvYqyAtBUp6enYudj5bH7Qe99C9wbCQPS90x7VqFZl55LOjWQzfDB5t7jlU-cYMnRD5GADDqCyC68-g-V-dS69PYiYbJcEx1Y_UHc8D0tw-O8EuEto_SWXp-k485IOGW3K-oV9ws4nJiHq9G88KXfRas3QqB-cv_3iAgvwVwygChjILt-0LrzozC3g4Gh3Tfn9WE7VjBKlokl9LeUnL1nB9yoFr1gQMx3MMgyXrMQ2SXWdoJtbFc4Jl6Gt6ctA",
    price: "$95,000",
    title: "BMW M3 (E30) Evolution II",
    location: "Munich, Germany",
    seller: {
      name: "Bavarian Classics",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtTyfZN2GLtwxu_E2aO10ac9h6ArDesmlht3mSybvyzasL1neaNXZf5oeHIsoexnoS-CXcR9E7TqTUHZlY0bS7X8nfq9CkUSBl_6EzVL7RRUEitOkoVF6SGVwnhizDoMBNIYx3BI3VC0ZX8a95MzVEJTC-g8r769iHlOC2WUEv75rE5K4AqvOKZACZTU3XfRkLl7bBYy1Itdpopb_hArFIvF-U2T_vFgIni7Btr6yfindNlt5tv1dTwhOOl5IxNieFNEHPfdJPgw",
      isVerified: true
    },
    condition: "Used",
    timestamp: "4H AGO",
    specs: ["S14 Engine", "Homologation Special", "Original Paint"]
  }
];

export default function Marketplace() {
  const [filter, setFilter] = useState('All');
  const { isOpen } = useSidebarStore();

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
                className="w-full bg-surface-container h-14 pl-12 pr-4 rounded-2xl text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary/40 border border-white/5"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              {['Exotics', 'Classics', 'Projects', 'Daily'].map(cat => (
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
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <VehicleCard {...v} />
                  </motion.div>
                ))}
              </div>

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
