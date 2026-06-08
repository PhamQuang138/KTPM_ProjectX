import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import MobileNav from '../components/MobileNav';
import SocialPost, { SocialPostProps } from '../components/SocialPost';
import { Link } from 'react-router-dom';
import { Eye, MessageCircle, TrendingUp, Plus, ChevronRight, Star, Heart, Users, MapPin, Globe, Grid3X3, List, PenTool, Newspaper, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FormEvent, useEffect, useState } from 'react';
import { useSidebarStore } from '../store/useSidebarStore';
import { useAuthStore } from '../store/useAuthStore';
import { apiRequest } from '../lib/api';

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

interface ListingFormState {
  description: string;
  price: string;
  location: string;
  category: string;
  status: string;
}

interface UserRating {
  averageRating: number;
  totalRatings: number;
  myRating: number | null;
}

interface PublicProfileSummary {
  avatar?: string | null;
  bannerImage?: string | null;
  bio?: string | null;
  location?: string | null;
  focusBrands: string[];
  isVerifiedProfessional: boolean;
  social: {
    followers: number;
    following: number;
    posts: number;
    isFollowing: boolean;
  };
}

interface ProfileFormState {
  bio: string;
  location: string;
  focusBrands: string[];
}

const popularCarBrands = [
  'Toyota',
  'Honda',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Porsche',
  'Ferrari',
  'Lamborghini',
  'Ford',
  'Chevrolet',
  'Nissan',
  'Mazda',
  'Hyundai',
  'Kia',
  'Tesla',
  'VinFast',
];

const profileLocations = [
  'Hanoi, Vietnam',
  'Ho Chi Minh City, Vietnam',
  'Da Nang, Vietnam',
  'Can Tho, Vietnam',
  'Hai Phong, Vietnam',
  'Los Angeles, USA',
  'Tokyo, Japan',
  'Seoul, South Korea',
  'Stuttgart, Germany',
  'Maranello, Italy',
  'London, UK',
  'Singapore',
];

const createListingForm = (listing?: DbListing, vehicle?: DbVehicle): ListingFormState => ({
  description: listing?.description ?? vehicle?.description ?? '',
  price: listing?.price ?? '',
  location: listing?.location ?? '',
  category: listing?.category ?? 'Daily',
  status: listing?.status ?? 'Active Listing',
});

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
  const [listingVehicle, setListingVehicle] = useState<DbVehicle | null>(null);
  const [editingListing, setEditingListing] = useState<DbListing | null>(null);
  const [listingForm, setListingForm] = useState<ListingFormState>(createListingForm());
  const [listingFormError, setListingFormError] = useState('');
  const [isSavingListing, setIsSavingListing] = useState(false);
  const [profileRating, setProfileRating] = useState<UserRating | null>(null);
  const [profileStats, setProfileStats] = useState([
    {label: 'Followers', value: '0'},
    {label: 'Following', value: '0'},
    {label: 'Posts', value: '0'},
  ]);
  const [profileBio, setProfileBio] = useState('');
  const [profileBannerImage, setProfileBannerImage] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileFocusBrands, setProfileFocusBrands] = useState<string[]>([]);
  const [isVerifiedProfessional, setIsVerifiedProfessional] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({bio: '', location: '', focusBrands: []});
  const [profileFormError, setProfileFormError] = useState('');
  const [profileMediaError, setProfileMediaError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const { isOpen } = useSidebarStore();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
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
      likes: 0,
      comments: 0,
      shares: 0,
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

    apiRequest<UserRating>(`/users/${user.id}/rating`)
      .then(setProfileRating)
      .catch(() => undefined);

    apiRequest<PublicProfileSummary>(`/users/${user.id}`)
      .then((profile) => {
        if (profile.avatar) updateUser({avatar: profile.avatar});
        setProfileBannerImage(profile.bannerImage ?? '');
        setProfileBio(profile.bio ?? '');
        setProfileLocation(profile.location ?? '');
        setProfileFocusBrands(profile.focusBrands ?? []);
        setIsVerifiedProfessional(profile.isVerifiedProfessional);
        setFollowersCount(profile.social.followers);
        setProfileStats([
          {label: 'Followers', value: profile.social.followers.toString()},
          {label: 'Following', value: profile.social.following.toString()},
          {label: 'Posts', value: profile.social.posts.toString()},
        ]);
      })
      .catch(() => undefined);
  }, [user]);

  const openEditProfile = () => {
    setProfileForm({
      bio: profileBio,
      location: profileLocation,
      focusBrands: profileFocusBrands,
    });
    setProfileFormError('');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileFormError('');
    setIsSavingProfile(true);

    try {
      const updatedProfile = await apiRequest<{bio?: string | null; location?: string | null; focusBrands: string[]}>(
        '/users/me/profile',
        {
          method: 'PATCH',
          body: JSON.stringify({
            bio: profileForm.bio,
            location: profileForm.location,
            focusBrands: profileForm.focusBrands,
          }),
        },
      );

      setProfileBio(updatedProfile.bio ?? '');
      setProfileLocation(updatedProfile.location ?? '');
      setProfileFocusBrands(updatedProfile.focusBrands ?? []);
      setIsEditingProfile(false);
    } catch (error) {
      setProfileFormError(error instanceof Error ? error.message : 'Unable to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const readImageAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please choose an image file.'));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error('Image must be 2MB or smaller.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result?.toString() ?? '');
      reader.onerror = () => reject(new Error('Unable to read this image.'));
      reader.readAsDataURL(file);
    });

  const handleProfileImageUpload = async (file: File | undefined, type: 'avatar' | 'bannerImage') => {
    if (!file) return;

    setProfileMediaError('');
    try {
      const dataUrl = await readImageAsDataUrl(file);
      const updatedProfile = await apiRequest<{avatar?: string | null; bannerImage?: string | null}>('/users/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({[type]: dataUrl}),
      });

      if (type === 'avatar') {
        updateUser({avatar: updatedProfile.avatar ?? dataUrl});
      } else {
        setProfileBannerImage(updatedProfile.bannerImage ?? dataUrl);
      }
    } catch (error) {
      setProfileMediaError(error instanceof Error ? error.message : 'Unable to upload image.');
    }
  };

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

  const openListingModal = (vehicle: DbVehicle) => {
    setListingVehicle(vehicle);
    setEditingListing(null);
    setListingForm(createListingForm(undefined, vehicle));
    setListingFormError('');
  };

  const openEditListingModal = (listing: DbListing) => {
    setEditingListing(listing);
    setListingVehicle(null);
    setListingForm(createListingForm(listing));
    setListingFormError('');
  };

  const closeListingModal = () => {
    setListingVehicle(null);
    setEditingListing(null);
    setListingForm(createListingForm());
    setListingFormError('');
  };

  const handleSaveListing = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setListingFormError('');
    if (!listingForm.price.trim() || !listingForm.location.trim()) {
      setListingFormError('Price and location are required.');
      return;
    }

    setIsSavingListing(true);
    try {
      if (editingListing) {
        const updatedListing = await apiRequest<DbListing>(`/vehicles/${editingListing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            description: listingForm.description,
            price: listingForm.price,
            location: listingForm.location,
            category: listingForm.category,
            status: listingForm.status,
          }),
        });
        setMyListings((listings) => listings.map((listing) => (listing.id === updatedListing.id ? updatedListing : listing)));
      } else if (listingVehicle) {
        const createdListing = await apiRequest<DbListing>('/vehicles', {
          method: 'POST',
          body: JSON.stringify({
            title: listingVehicle.title,
            description: listingForm.description,
            price: listingForm.price,
            location: listingForm.location,
            category: listingForm.category,
            vehicleId: listingVehicle.id,
          }),
        });
        setMyListings((listings) => [createdListing, ...listings]);
        setMyVehicles((vehicles) =>
          vehicles.map((vehicle) =>
            vehicle.id === listingVehicle.id
              ? {...vehicle, listings: [createdListing, ...(vehicle.listings ?? [])]}
              : vehicle,
          ),
        );
        setActiveTab('marketplace');
      }

      closeListingModal();
    } catch (error) {
      setListingFormError(error instanceof Error ? error.message : 'Unable to save marketplace listing.');
    } finally {
      setIsSavingListing(false);
    }
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

  const hasActiveListing = (vehicle: DbVehicle) =>
    (vehicle.listings ?? []).some((listing) => listing.status !== 'Sold') ||
    myListings.some((listing) => listing.vehicle?.id === vehicle.id && listing.status !== 'Sold');

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
          <div className="relative mb-44">
            {/* Banner */}
            <div className="h-48 md:h-64 w-full rounded-[2.5rem] overflow-hidden bg-surface-container-high border border-white/5 relative group">
              <img 
                src={profileBannerImage || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000'} 
                className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000" 
                alt="Banner" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <label className="absolute bottom-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleProfileImageUpload(event.target.files?.[0], 'bannerImage')}
                />
              </label>
            </div>
            {profileMediaError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {profileMediaError}
              </div>
            )}

            {/* Profile Info Overlay */}
            <div className="absolute -bottom-36 left-6 right-6 md:left-12 md:right-12 flex flex-col md:flex-row items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left w-full md:w-auto">
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-[6px] border-background bg-background p-1.5 shadow-2xl">
                    <img src={avatar} className="w-full h-full object-cover rounded-[2rem]" alt="Profile" />
                  </div>
                  <label className="absolute top-3 right-3 bg-black/70 p-2 rounded-xl shadow-lg border border-white/10 cursor-pointer hover:bg-primary hover:text-on-primary transition-all">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleProfileImageUpload(event.target.files?.[0], 'avatar')}
                    />
                  </label>
                  {followersCount >= 5 && (
                    <div className="absolute bottom-4 -right-2 bg-primary p-2 rounded-xl shadow-lg border-2 border-background" title="Popular collector">
                      <Star className="w-4 h-4 text-on-primary fill-current" />
                    </div>
                  )}
                </div>

                <div className="md:mb-4">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="font-display text-4xl font-bold tracking-tight">{displayName}</h1>
                    <span className="badge-primary">Legacy Collector</span>
                    {isVerifiedProfessional && <span className="badge-success">Verified Pro</span>}
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs text-on-surface-variant font-mono uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {profileLocation || 'No location yet'}</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> @{handle}</span>
                    <span className="opacity-30">•</span>
                    {isVerifiedProfessional && <span className="text-primary font-bold">Verified Professional</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-4 w-full md:w-auto justify-center">
                 <div className="flex gap-8 px-8 py-4 glass-card rounded-2xl border-white/5 mr-4 hidden md:flex">
                    {profileStats.map(s => (
                      <div key={s.label} className="text-center">
                        <p className="text-lg font-bold">{s.value}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono uppercase">{s.label}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* Social Stats (Mobile Only) */}
          <div className="grid grid-cols-3 gap-4 md:hidden mb-8 mt-12 bg-white/5 p-4 rounded-2xl">
            {profileStats.map(s => (
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
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">About Collector</h3>
                  <button
                    type="button"
                    onClick={openEditProfile}
                    className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-on-surface leading-loose mb-8">
                  {profileBio || 'Write a short introduction about your garage, your taste in cars, and what kind of collector you are.'}
                </p>
                
                <div className="space-y-4 pt-6 border-t border-white/5">
                   <h4 className="text-[10px] font-mono uppercase text-on-surface-variant tracking-widest mb-4">Focus Brands</h4>
                   <div className="flex flex-wrap gap-2">
                      {(profileFocusBrands.length ? profileFocusBrands : ['Add your brands']).map(b => (
                        <span key={b} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold">{b}</span>
                      ))}
                   </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Seller Rating</h3>
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <Star
                      key={score}
                      className={`w-7 h-7 ${
                        score <= Math.round(profileRating?.averageRating ?? 0)
                          ? 'fill-primary text-primary'
                          : 'text-on-surface-variant'
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-display text-3xl font-bold">
                    {(profileRating?.averageRating ?? 0).toFixed(1)}
                    <span className="text-base text-on-surface-variant"> / 5</span>
                  </p>
                  <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mt-2">
                    Based on {profileRating?.totalRatings ?? 0} user votes
                  </p>
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
                          <button
                            type="button"
                            disabled={hasActiveListing(vehicle)}
                            onClick={() => openListingModal(vehicle)}
                            className="mt-4 btn-primary px-4 py-2 text-[10px] w-fit disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {hasActiveListing(vehicle) ? 'Already Listed' : 'List for Sale'}
                          </button>
                        </div>
                      </div>
                    ))}
                    {myVehicles.length === 0 && (
                      <div className="aspect-[4/3] rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 flex flex-col justify-center text-on-surface-variant">
                        <p className="font-display text-xl font-bold text-on-surface">Your garage is empty</p>
                        <p className="text-sm mt-2">Add your first vehicle, then publish it to Marketplace when you are ready to sell.</p>
                      </div>
                    )}
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
                                 <button onClick={() => openEditListingModal(listing)} className="btn-secondary px-4 py-2 text-[10px]">
                                   Edit
                                 </button>
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
      {(listingVehicle || editingListing) && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <form onSubmit={handleSaveListing} className="w-full max-w-2xl bg-surface-container border border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {editingListing ? 'Edit Marketplace Listing' : `List ${listingVehicle?.title} for Sale`}
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Price, location, category, and description will be shown on Marketplace.
                </p>
              </div>
              <button type="button" onClick={closeListingModal} className="text-on-surface-variant hover:text-on-surface">Cancel</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                required
                placeholder="Sale price, e.g. $65,000"
                value={listingForm.price}
                onChange={(event) => setListingForm({...listingForm, price: event.target.value})}
                className="bg-background border border-white/10 rounded-xl px-4 py-3"
              />
              <input
                required
                placeholder="Location"
                value={listingForm.location}
                onChange={(event) => setListingForm({...listingForm, location: event.target.value})}
                className="bg-background border border-white/10 rounded-xl px-4 py-3"
              />
              <select
                value={listingForm.category}
                onChange={(event) => setListingForm({...listingForm, category: event.target.value})}
                className="bg-background border border-white/10 rounded-xl px-4 py-3"
              >
                <option>Daily</option>
                <option>Classics</option>
                <option>Exotics</option>
                <option>Projects</option>
              </select>
            </div>

            {editingListing && (
              <select
                value={listingForm.status}
                onChange={(event) => setListingForm({...listingForm, status: event.target.value})}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3"
              >
                <option>Active Listing</option>
                <option>Sold</option>
                <option>Hidden</option>
              </select>
            )}

            <textarea
              placeholder="Marketplace description"
              value={listingForm.description}
              onChange={(event) => setListingForm({...listingForm, description: event.target.value})}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 min-h-28"
            />

            {listingFormError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {listingFormError}
              </div>
            )}

            <button disabled={isSavingListing} type="submit" className="btn-primary w-full py-4 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
              {isSavingListing ? 'Saving...' : editingListing ? 'Save Listing Changes' : 'Publish to Marketplace'}
            </button>
          </form>
        </div>
      )}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <form onSubmit={handleSaveProfile} className="w-full max-w-2xl bg-surface-container border border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Edit About Collector</h2>
                <p className="text-sm text-on-surface-variant mt-1">This information is shown on your public profile.</p>
              </div>
              <button type="button" onClick={() => setIsEditingProfile(false)} className="text-on-surface-variant hover:text-on-surface">Cancel</button>
            </div>

            <textarea
              placeholder="Tell the community about yourself..."
              value={profileForm.bio}
              onChange={(event) => setProfileForm({...profileForm, bio: event.target.value})}
              maxLength={1000}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 min-h-36"
            />

            <div>
              <label className="mb-2 block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                Location
              </label>
              <select
                value={profileForm.location}
                onChange={(event) => setProfileForm({...profileForm, location: event.target.value})}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3"
              >
                <option value="">Choose your location</option>
                {profileLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-3 block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                Focus Brands
              </label>
              <div className="flex flex-wrap gap-2">
                {popularCarBrands.map((brand) => {
                  const isSelected = profileForm.focusBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() =>
                        setProfileForm({
                          ...profileForm,
                          focusBrands: isSelected
                            ? profileForm.focusBrands.filter((item) => item !== brand)
                            : [...profileForm.focusBrands, brand],
                        })
                      }
                      className={`rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                        isSelected
                          ? 'border-primary bg-primary text-on-primary'
                          : 'border-white/10 bg-background text-on-surface-variant hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-on-surface-variant">
                Selected: {profileForm.focusBrands.length ? profileForm.focusBrands.join(', ') : 'None'}
              </p>
            </div>

            {profileFormError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {profileFormError}
              </div>
            )}

            <button disabled={isSavingProfile} type="submit" className="btn-primary w-full py-4 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}
      <MobileNav />
    </div>
  );
}
