import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import MobileNav from '../components/MobileNav';
import SocialPost, { SocialPostProps } from '../components/SocialPost';
import { Link } from 'react-router-dom';
import { Eye, MessageCircle, TrendingUp, Plus, Settings, ChevronRight, Star, Heart, Users, MapPin, Globe, Share2, Grid3X3, List, PenTool, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FormEvent, useEffect, useState } from 'react';
import { useSidebarStore } from '../store/useSidebarStore';
import { useAuthStore } from '../store/useAuthStore';
import { apiRequest } from '../lib/api';

const stats = [
  { label: 'Followers', value: '2,402' },
  { label: 'Following', value: '891' },
  { label: 'Posts', value: '156' },
];

const garageVehicles = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhXzdYWUDb9uSF_XICrL6QjdBIy65L1NKzx_L0_olfHkY61T5rPO4sUI3bc1E-38ctMqHi7DrbeRtg42wLDKUbpjX2vT2xWjgvR-NYhkJuEjhNyRRlIer8vFPHupURQ6oKSV8ntzi5l0tdCTkb7-hG3ASpzeIX1lMOxLiiN3Cf6AsjoR2qdTP8HD-ZbEV-0Nb_2ZdBRFYS-h5obLwzoRkYdIbuMRUiwvRqlmj0FobH0394RODsTZh4Zwsx6pKjdOCbHObEgf13Ag",
    title: "1974 GT Heritage",
    role: "Restoration Project",
    status: "In Garage"
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3aPfyF_LB1tLXUvYqyAtBUp6enYudj5bH7Qe99C9wbCQPS90x7VqFZl55LOjWQzfDB5t7jlU-cYMnRD5GADDqCyC68-g-V-dS69PYiYbJcEx1Y_UHc8D0tw-O8EuEto_SWXp-k485IOGW3K-oV9ws4nJiHq9G88KXfRas3QqB-cv_3iAgvwVwygChjILt-0LrzozC3g4Gh3Tfn9WE7VjBKlokl9LeUnL1nB9yoFr1gQMx3MMgyXrMQ2SXWdoJtbFc4Jl6Gt6ctA",
    title: "2023 Vanguard S",
    role: "Daily Driver",
    status: "Active Listing"
  }
];

interface DbPost {
  id: string;
  title: string;
  content: string;
  summary?: string;
  status: 'DRAFT' | 'PUBLISHED';
  images: {url: string; caption?: string}[];
  createdAt: string;
}

interface DbVehicle {
  id: string;
  image: string;
  images: string[];
  title: string;
  description?: string;
  condition: string;
  status: string;
  specs: string[];
  listings?: DbListing[];
}

interface DbListing {
  id: string;
  title: string;
  description?: string;
  price: string;
  location: string;
  category: string;
  status: string;
  vehicle?: DbVehicle | null;
}

const userArticles = [
  {
    title: 'The Art of the Air-Cooled 911 Restoration',
    excerpt: 'A deep dive into why these machines still capture the heart of every true enthusiast.',
    date: 'Oct 24, 2026',
    readTime: '12 min',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800'
  }
];

export default function Garage() {
  const [activeTab, setActiveTab] = useState('garage');
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [myPosts, setMyPosts] = useState<DbPost[]>([]);
  const [myVehicles, setMyVehicles] = useState<DbVehicle[]>([]);
  const [myListings, setMyListings] = useState<DbListing[]>([]);
  const [publishToMarketplace, setPublishToMarketplace] = useState(true);
  const [vehicleFormError, setVehicleFormError] = useState('');
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    title: '',
    description: '',
    listingDescription: '',
    price: '',
    location: '',
    image: '',
    condition: 'Used',
    category: 'Daily',
    specs: '',
  });
  const { isOpen } = useSidebarStore();
  const user = useAuthStore((state) => state.user);
  const displayName = user?.name ?? 'Guest Driver';
  const avatar = user?.avatar ?? `https://i.pravatar.cc/200?u=${encodeURIComponent(user?.email ?? 'guest')}`;
  const handle = user?.email.split('@')[0] ?? 'guest';
  const currentUserPosts: SocialPostProps[] = [
    {
      author: {
        name: displayName,
        handle,
        avatar,
        isVerified: true,
        isProUser: true,
      },
      type: 'garage',
      content: "Golden hour with the Vanguard. Still can't believe the engineering that went into this aero package. #Vanguard #Supercar",
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800",
      timestamp: "2d ago",
      likes: 542,
      comments: 89,
      category: "Photography",
    },
  ];

  useEffect(() => {
    if (!user) return;

    apiRequest<DbPost[]>(`/posts?authorId=${user.id}`)
      .then(setMyPosts)
      .catch(() => undefined);

    apiRequest<DbVehicle[]>(`/garage/vehicles?ownerId=${user.id}`)
      .then(setMyVehicles)
      .catch(() => undefined);

    apiRequest<DbListing[]>(`/vehicles?sellerId=${user.id}`)
      .then(setMyListings)
      .catch(() => undefined);
  }, [user]);

  const handleCreateVehicle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setVehicleFormError('');

    if (publishToMarketplace && (!vehicleForm.price.trim() || !vehicleForm.location.trim())) {
      setVehicleFormError('Price and location are required when publishing to marketplace.');
      return;
    }

    setIsSavingVehicle(true);
    try {
      const createdVehicle = await apiRequest<DbVehicle>('/garage/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          title: vehicleForm.title,
          description: vehicleForm.description,
          image: vehicleForm.image,
          images: [vehicleForm.image],
          condition: vehicleForm.condition,
          specs: vehicleForm.specs
            .split(',')
            .map((spec) => spec.trim())
            .filter(Boolean),
          ownerId: user.id,
        }),
      });

      setMyVehicles((vehicles) => [createdVehicle, ...vehicles]);

      if (publishToMarketplace) {
        const createdListing = await apiRequest<DbListing>('/vehicles', {
          method: 'POST',
          body: JSON.stringify({
            title: vehicleForm.title,
            description: vehicleForm.listingDescription || vehicleForm.description,
            price: vehicleForm.price,
            location: vehicleForm.location,
            category: vehicleForm.category,
            sellerId: user.id,
            vehicleId: createdVehicle.id,
          }),
        });
        setMyListings((listings) => [createdListing, ...listings]);
      }

      setVehicleForm({
        title: '',
        description: '',
        listingDescription: '',
        price: '',
        location: '',
        image: '',
        condition: 'Used',
        category: 'Daily',
        specs: '',
      });
      setIsAddingVehicle(false);
      setActiveTab(publishToMarketplace ? 'marketplace' : 'garage');
    } catch (error) {
      setVehicleFormError(error instanceof Error ? error.message : 'Unable to save vehicle listing.');
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const handleCreateListingFromGarage = async (vehicle: DbVehicle) => {
    if (!user) return;
    const price = window.prompt('Sale price, e.g. $65,000');
    const location = window.prompt('Listing location');
    const description = window.prompt('Marketplace description') ?? vehicle.description ?? '';
    if (!price || !location) return;

    const createdListing = await apiRequest<DbListing>('/vehicles', {
      method: 'POST',
      body: JSON.stringify({
        title: vehicle.title,
        description,
        price,
        location,
        category: 'Daily',
        sellerId: user.id,
        vehicleId: vehicle.id,
      }),
    });
    setMyListings((listings) => [createdListing, ...listings]);
    setActiveTab('marketplace');
  };

  const handleToggleListingStatus = async (listing: DbListing) => {
    const nextStatus = listing.status === 'Sold' ? 'Active Listing' : 'Sold';
    const updatedListing = await apiRequest<DbListing>(`/vehicles/${listing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({status: nextStatus}),
    });

    setMyListings((listings) => listings.map((item) => (item.id === listing.id ? updatedListing : item)));
  };

  const handleDeleteListing = async (listingId: string) => {
    await apiRequest(`/vehicles/${listingId}`, {method: 'DELETE'});
    setMyListings((listings) => listings.filter((listing) => listing.id !== listingId));
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar />
      <motion.main 
        animate={{ marginLeft: isOpen ? '16rem' : '0rem' }}
        className="pb-24 transition-all duration-300"
      >
        <TopNav title="Profile" />
        
        <section className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-4">
          
          {/* Profile Hero section */}
          <div className="relative mb-32">
            {/* Banner */}
            <div className="h-48 md:h-64 w-full rounded-[2.5rem] overflow-hidden bg-surface-container-high border border-white/5 relative group">
              <img 
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000" 
                className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000" 
                alt="Banner" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <button className="absolute bottom-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Overlay */}
            <div className="absolute -bottom-24 left-6 right-6 md:left-12 md:right-12 flex flex-col md:flex-row items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left w-full md:w-auto">
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-[6px] border-background bg-background p-1.5 shadow-2xl">
                    <img src={avatar} className="w-full h-full object-cover rounded-[2rem]" alt="Profile" />
                  </div>
                  <div className="absolute bottom-4 -right-2 bg-primary p-2 rounded-xl shadow-lg border-2 border-background">
                    <Star className="w-4 h-4 text-on-primary fill-current" />
                  </div>
                </div>

                <div className="md:mb-4">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="font-display text-4xl font-bold tracking-tight">{displayName}</h1>
                    <span className="badge-primary">Legacy Collector</span>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs text-on-surface-variant font-mono uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Monaco</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> @{handle}</span>
                    <span className="opacity-30">•</span>
                    <span className="text-primary font-bold">Verified Professional</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-4 w-full md:w-auto justify-center">
                 <div className="flex gap-8 px-8 py-4 glass-card rounded-2xl border-white/5 mr-4 hidden md:flex">
                    {stats.map(s => (
                      <div key={s.label} className="text-center">
                        <p className="text-lg font-bold">{s.value}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono uppercase">{s.label}</p>
                      </div>
                    ))}
                 </div>
                 <button className="btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Share Post</button>
                 <button className="interactive-icon border border-white/10 w-12 h-12 flex items-center justify-center"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>
          </div>

          {/* Social Stats (Mobile Only) */}
          <div className="grid grid-cols-3 gap-4 md:hidden mb-8 mt-12 bg-white/5 p-4 rounded-2xl">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-tighter">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 md:mt-24">
            
            {/* Left Column: Bio & Badges */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface-variant">About Collector</h3>
                <p className="text-sm text-on-surface leading-loose mb-8">
                  Passionate air-cooled Porsche enthusiast and amateur racer. Currently restoring classic 911s in my private studio. Believes that cars are meant to be driven, not stored.
                </p>
                
                <div className="space-y-4 pt-6 border-t border-white/5">
                   <h4 className="text-[10px] font-mono uppercase text-on-surface-variant tracking-widest mb-4">Focus Brands</h4>
                   <div className="flex flex-wrap gap-2">
                      {['Porsche', 'Ferrari', 'Lancia', 'Alpine'].map(b => (
                        <span key={b} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold">{b}</span>
                      ))}
                   </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Achievements</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-square rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Column: Tabbed Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Tab Navigation */}
              <div className="flex gap-8 border-b border-white/10 pb-4 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'garage', label: 'Garage', icon: Grid3X3 },
                  { id: 'posts', label: 'Social Feed', icon: PenTool },
                  { id: 'blogs', label: 'Blog Posts', icon: Newspaper },
                  { id: 'marketplace', label: 'Marketplace', icon: List },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 py-2 text-xs font-mono uppercase tracking-[0.2em] transition-all shrink-0 ${
                      activeTab === tab.id ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="profileTab" className="absolute -bottom-4 left-0 right-0 h-[2px] bg-primary" />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'blogs' && (
                  <motion.div 
                    key="blogs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 gap-6"
                  >
                    {userArticles.map((article, i) => (
                      <div key={i} className="group relative bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col md:flex-row hover:border-primary/30 transition-all duration-500">
                        <div className="md:w-1/3 aspect-video md:aspect-square overflow-hidden shrink-0">
                           <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={article.title} />
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                           <div className="flex items-center gap-4 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-4">
                             <span>{article.date}</span>
                             <span>•</span>
                             <span>{article.readTime} read</span>
                           </div>
                           <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{article.title}</h3>
                           <p className="text-sm text-on-surface-variant opacity-70 mb-6 line-clamp-2">{article.excerpt}</p>
                           <button className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                             Read More <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'garage' && (
                  <motion.div 
                    key="garage"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {myVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="group relative rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer">
                        <img src={vehicle.image} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700" alt={vehicle.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                          <p className="text-[10px] font-mono text-primary uppercase font-bold mb-1">{vehicle.condition}</p>
                          <h4 className="text-xl font-bold text-white mb-1">{vehicle.title}</h4>
                          {vehicle.description && <p className="text-xs text-white/70 line-clamp-2 mb-2">{vehicle.description}</p>}
                          <span className="text-[10px] text-white/60 font-mono uppercase">{vehicle.status}</span>
                          <button onClick={() => handleCreateListingFromGarage(vehicle)} className="mt-4 btn-primary px-4 py-2 text-[10px] w-fit">List for Sale</button>
                        </div>
                      </div>
                    ))}
                    {garageVehicles.map((v, i) => (
                      <div key={i} className="group relative rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer">
                        <img src={v.image} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700" alt={v.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                          <p className="text-[10px] font-mono text-primary uppercase font-bold mb-1">{v.role}</p>
                          <h4 className="text-xl font-bold text-white mb-1">{v.title}</h4>
                          <span className="text-[10px] text-white/60 font-mono uppercase">{v.status}</span>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setIsAddingVehicle(true)}
                      className="aspect-[4/3] border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all"
                    >
                      <Plus className="w-8 h-8" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">Add Vehicle</span>
                    </button>
                  </motion.div>
                )}

                {activeTab === 'posts' && (
                  <motion.div 
                    key="posts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {[...myPosts.map((post) => ({
                      author: {
                        name: displayName,
                        handle,
                        avatar,
                        isVerified: true,
                        isProUser: true,
                      },
                      type: 'story' as const,
                      content: post.content,
                      image: post.images[0]?.url,
                      images: post.images.map((image) => image.url),
                      timestamp: new Date(post.createdAt).toLocaleDateString(),
                      likes: 0,
                      comments: 0,
                      category: post.status,
                    })), ...currentUserPosts].map((post, i) => (
                      <SocialPost key={i} {...post} />
                    ))}
                  </motion.div>
                )}

                {activeTab === 'marketplace' && (
                  <motion.div 
                    key="market"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                     {myListings.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {myListings.map((listing) => (
                           <div key={listing.id} className="rounded-[2rem] border border-white/5 bg-white/[0.03] overflow-hidden">
                             <img src={listing.vehicle?.image ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200'} alt={listing.title} className="aspect-[4/3] w-full object-cover" />
                             <div className="p-6">
                               <p className="text-[10px] font-mono uppercase text-primary font-bold mb-2">{listing.status}</p>
                               <h3 className="font-display text-xl font-bold">{listing.title}</h3>
                               <p className="font-mono text-primary mt-2">{listing.price}</p>
                               <p className="text-xs text-on-surface-variant mt-2">{listing.location}</p>
                               {listing.description && <p className="text-xs text-on-surface-variant mt-3 line-clamp-2">{listing.description}</p>}
                               <div className="flex flex-wrap gap-2 mt-5">
                                 <Link to={`/market/${listing.id}`} className="btn-secondary px-4 py-2 text-[10px]">View</Link>
                                 <button onClick={() => handleToggleListingStatus(listing)} className="btn-secondary px-4 py-2 text-[10px]">
                                   {listing.status === 'Sold' ? 'Relist' : 'Mark Sold'}
                                 </button>
                                 <button onClick={() => handleDeleteListing(listing.id)} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-300 border border-red-500/20 hover:bg-red-500/10">
                                   Delete
                                 </button>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                     <div className="glass-card p-12 text-center rounded-[2.5rem] border-white/5 opacity-40">
                        <List className="w-8 h-8 mx-auto mb-4" />
                        <p className="font-display text-lg font-bold">No Active Listings</p>
                        <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mt-2">Check back soon for upcoming auctions</p>
                        <button onClick={() => setIsAddingVehicle(true)} className="mt-8 btn-secondary px-8">Add Listing</button>
                     </div>
                     )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </section>
      </motion.main>
      {isAddingVehicle && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <form onSubmit={handleCreateVehicle} className="w-full max-w-2xl bg-surface-container border border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Add Vehicle</h2>
                <p className="text-sm text-on-surface-variant mt-1">Save the vehicle to Garage, then optionally publish it to Marketplace.</p>
              </div>
              <button type="button" onClick={() => setIsAddingVehicle(false)} className="text-on-surface-variant hover:text-on-surface">Cancel</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Vehicle title" value={vehicleForm.title} onChange={(event) => setVehicleForm({...vehicleForm, title: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
              <select value={vehicleForm.condition} onChange={(event) => setVehicleForm({...vehicleForm, condition: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3">
                <option>New</option>
                <option>Used</option>
                <option>Project</option>
              </select>
              <input placeholder="Specs, comma separated" value={vehicleForm.specs} onChange={(event) => setVehicleForm({...vehicleForm, specs: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
            </div>

            <textarea required placeholder="Garage description" value={vehicleForm.description} onChange={(event) => setVehicleForm({...vehicleForm, description: event.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 min-h-24" />
            <input required type="url" placeholder="Image URL" value={vehicleForm.image} onChange={(event) => setVehicleForm({...vehicleForm, image: event.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3" />

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-background px-4 py-3">
              <input
                type="checkbox"
                checked={publishToMarketplace}
                onChange={(event) => setPublishToMarketplace(event.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-bold">Publish to Marketplace</span>
            </label>

            {publishToMarketplace && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input required placeholder="Sale price, e.g. $65,000" value={vehicleForm.price} onChange={(event) => setVehicleForm({...vehicleForm, price: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
                  <input required placeholder="Marketplace location" value={vehicleForm.location} onChange={(event) => setVehicleForm({...vehicleForm, location: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
                  <select value={vehicleForm.category} onChange={(event) => setVehicleForm({...vehicleForm, category: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3">
                    <option>Daily</option>
                    <option>Classics</option>
                    <option>Exotics</option>
                    <option>Projects</option>
                  </select>
                </div>
                <textarea placeholder="Marketplace description, optional" value={vehicleForm.listingDescription} onChange={(event) => setVehicleForm({...vehicleForm, listingDescription: event.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 min-h-24" />
              </div>
            )}

            {vehicleFormError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {vehicleFormError}
              </div>
            )}

            <button disabled={isSavingVehicle} type="submit" className="btn-primary w-full py-4 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
              {isSavingVehicle ? 'Saving...' : publishToMarketplace ? 'Save and Publish Listing' : 'Save to Garage'}
            </button>
          </form>
        </div>
      )}
      <MobileNav />
    </div>
  );
}
