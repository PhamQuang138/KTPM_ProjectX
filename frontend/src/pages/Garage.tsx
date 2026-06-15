import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import MobileNav from '../components/MobileNav';
import SocialPost from '../components/SocialPost';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, MessageCircle, TrendingUp, Plus, Star, Heart, Users, MapPin, Globe, Grid3X3, List, PenTool, Camera, LoaderCircle, BadgeCheck, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FormEvent, useEffect, useState } from 'react';
import { useSidebarStore } from '../store/useSidebarStore';
import { useAuthStore } from '../store/useAuthStore';
import { apiRequest } from '../lib/api';
import {uploadImage} from '../lib/imageUpload';

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
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
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

const createVehicleForm = (vehicle?: DbVehicle) => ({
  title: vehicle?.title ?? '',
  description: vehicle?.description ?? '',
  listingDescription: '',
  price: '',
  location: '',
  images: vehicle?.images?.length ? vehicle.images : vehicle?.image ? [vehicle.image] : [],
  condition: vehicle?.condition ?? 'Used',
  make: vehicle?.make ?? '',
  model: vehicle?.model ?? '',
  year: vehicle?.year?.toString() ?? '',
  mileage: vehicle?.mileage?.toString() ?? '',
  bodyType: vehicle?.bodyType ?? 'Coupe',
  fuelType: vehicle?.fuelType ?? 'Gasoline',
  transmission: vehicle?.transmission ?? 'Automatic',
  category: 'Daily',
  specs: vehicle?.specs.join(', ') ?? '',
});

const conditionLabel = (condition: string) =>
  ({
    New: 'Mới',
    Used: 'Đã qua sử dụng',
    Project: 'Xe dự án',
  })[condition] ?? condition;

const listingStatusLabel = (status: string) =>
  ({
    'Active Listing': 'Đang bán',
    Sold: 'Đã bán',
    Hidden: 'Đã ẩn',
  })[status] ?? status;

const categoryLabel = (category: string) =>
  ({
    Daily: 'Xe hằng ngày',
    Classics: 'Xe cổ',
    Exotics: 'Xe hiệu năng cao',
    Projects: 'Xe dự án',
  })[category] ?? category;

const fuelTypeLabel = (fuelType: string) =>
  ({
    Gasoline: 'Xăng',
    Diesel: 'Dầu',
    Hybrid: 'Hybrid',
    Electric: 'Điện',
  })[fuelType] ?? fuelType;

const transmissionLabel = (transmission: string) =>
  ({
    Automatic: 'Tự động',
    Manual: 'Số sàn',
  })[transmission] ?? transmission;

export default function Garage() {
  const [activeTab, setActiveTab] = useState('garage');
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [myPosts, setMyPosts] = useState<DbPost[]>([]);
  const [myVehicles, setMyVehicles] = useState<DbVehicle[]>([]);
  const [myListings, setMyListings] = useState<DbListing[]>([]);
  const [publishToMarketplace, setPublishToMarketplace] = useState(true);
  const [vehicleFormError, setVehicleFormError] = useState('');
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [isUploadingVehicleImage, setIsUploadingVehicleImage] = useState(false);
  const [vehicleForm, setVehicleForm] = useState(createVehicleForm());
  const [editingVehicle, setEditingVehicle] = useState<DbVehicle | null>(null);
  const [listingVehicle, setListingVehicle] = useState<DbVehicle | null>(null);
  const [editingListing, setEditingListing] = useState<DbListing | null>(null);
  const [listingForm, setListingForm] = useState<ListingFormState>(createListingForm());
  const [listingFormError, setListingFormError] = useState('');
  const [isSavingListing, setIsSavingListing] = useState(false);
  const [profileRating, setProfileRating] = useState<UserRating | null>(null);
  const [profileStats, setProfileStats] = useState([
    {label: 'Người theo dõi', value: '0'},
    {label: 'Đang theo dõi', value: '0'},
    {label: 'Bài viết', value: '0'},
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOpen } = useSidebarStore();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const displayName = user?.name ?? 'Khách';
  const avatar = avatarPreview || user?.avatar || `https://i.pravatar.cc/200?u=${encodeURIComponent(user?.email ?? 'guest')}`;
  const handle = user?.email.split('@')[0] ?? 'guest';
  useEffect(() => {
    if (!user) return;

    apiRequest<DbPost[]>(`/posts?authorId=${user.id}`)
      .then(setMyPosts)
      .catch(() => undefined);

    apiRequest<DbVehicle[]>(`/garage/vehicles?ownerId=${user.id}`)
      .then(setMyVehicles)
      .catch(() => undefined);

    apiRequest<{items: DbListing[]}>(`/vehicles?sellerId=${user.id}&limit=50`)
      .then((result) => setMyListings(result.items))
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
          {label: 'Người theo dõi', value: profile.social.followers.toString()},
          {label: 'Đang theo dõi', value: profile.social.following.toString()},
          {label: 'Bài viết', value: profile.social.posts.toString()},
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
      setProfileFormError(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileImageUpload = async (file: File | undefined, type: 'avatar' | 'bannerImage') => {
    if (!file) return;

    setProfileMediaError('');
    const previewUrl = URL.createObjectURL(file);
    if (type === 'avatar') {
      setAvatarPreview(previewUrl);
      setIsUploadingAvatar(true);
    }
    try {
      const uploaded = await uploadImage(file);
      const updatedProfile = await apiRequest<{avatar?: string | null; bannerImage?: string | null}>('/users/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({[type]: uploaded.url}),
      });

      if (type === 'avatar') {
        updateUser({avatar: updatedProfile.avatar ?? uploaded.url});
        setAvatarPreview('');
      } else {
        setProfileBannerImage(updatedProfile.bannerImage ?? uploaded.url);
      }
    } catch (error) {
      if (type === 'avatar') setAvatarPreview('');
      setProfileMediaError(error instanceof Error ? error.message : 'Không thể tải ảnh lên.');
    } finally {
      URL.revokeObjectURL(previewUrl);
      if (type === 'avatar') setIsUploadingAvatar(false);
    }
  };

  const handleVehicleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    setVehicleFormError('');
    const selectedFiles = Array.from(files);
    const availableSlots = 12 - vehicleForm.images.length;
    if (availableSlots <= 0) {
      setVehicleFormError('Bạn có thể tải tối đa 12 ảnh cho mỗi xe.');
      return;
    }

    setIsUploadingVehicleImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles.slice(0, availableSlots)) {
        const uploaded = await uploadImage(file);
        uploadedUrls.push(uploaded.url);
      }
      setVehicleForm((current) => ({...current, images: [...current.images, ...uploadedUrls]}));
      if (selectedFiles.length > availableSlots) {
        setVehicleFormError(`Chỉ thêm ${availableSlots} ảnh để không vượt quá giới hạn 12 ảnh.`);
      }
    } catch (error) {
      setVehicleFormError(error instanceof Error ? error.message : 'Không thể tải ảnh xe lên.');
    } finally {
      setIsUploadingVehicleImage(false);
    }
  };

  const handleCreateVehicle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setVehicleFormError('');

    if (!vehicleForm.images.length) {
      setVehicleFormError('Vui lòng tải ảnh xe lên trước khi lưu.');
      return;
    }

    if (!editingVehicle && publishToMarketplace && (!vehicleForm.price.trim() || !vehicleForm.location.trim())) {
      setVehicleFormError('Giá bán và địa điểm là bắt buộc khi đăng lên chợ xe.');
      return;
    }

    setIsSavingVehicle(true);
    try {
      const vehiclePayload = {
        title: vehicleForm.title,
        description: vehicleForm.description,
        image: vehicleForm.images[0],
        images: vehicleForm.images,
        condition: vehicleForm.condition,
        make: vehicleForm.make || undefined,
        model: vehicleForm.model || undefined,
        year: vehicleForm.year ? Number(vehicleForm.year) : undefined,
        mileage: vehicleForm.mileage ? Number(vehicleForm.mileage) : undefined,
        bodyType: vehicleForm.bodyType || undefined,
        fuelType: vehicleForm.fuelType || undefined,
        transmission: vehicleForm.transmission || undefined,
        specs: vehicleForm.specs
          .split(',')
          .map((spec) => spec.trim())
          .filter(Boolean),
      };
      const savedVehicle = await apiRequest<DbVehicle>(
        editingVehicle ? `/garage/vehicles/${editingVehicle.id}` : '/garage/vehicles',
        {
          method: editingVehicle ? 'PATCH' : 'POST',
          body: JSON.stringify({
            ...vehiclePayload,
          }),
        },
      );

      setMyVehicles((vehicles) =>
        editingVehicle
          ? vehicles.map((vehicle) => (vehicle.id === savedVehicle.id ? savedVehicle : vehicle))
          : [savedVehicle, ...vehicles],
      );

      if (!editingVehicle && publishToMarketplace) {
        const createdListing = await apiRequest<DbListing>('/vehicles', {
          method: 'POST',
          body: JSON.stringify({
            title: vehicleForm.title,
            description: vehicleForm.listingDescription || vehicleForm.description,
            price: vehicleForm.price,
            location: vehicleForm.location,
            category: vehicleForm.category,
            vehicleId: savedVehicle.id,
          }),
        });
        setMyListings((listings) => [createdListing, ...listings]);
      }

      setVehicleForm(createVehicleForm());
      setEditingVehicle(null);
      setIsAddingVehicle(false);
      setActiveTab(!editingVehicle && publishToMarketplace ? 'marketplace' : 'garage');
    } catch (error) {
      setVehicleFormError(error instanceof Error ? error.message : 'Không thể lưu xe hoặc tin đăng.');
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const openCreateVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm(createVehicleForm());
    setPublishToMarketplace(true);
    setVehicleFormError('');
    setIsAddingVehicle(true);
  };

  useEffect(() => {
    if (searchParams.get('addVehicle') !== '1') return;

    openCreateVehicle();
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('addVehicle');
    setSearchParams(nextParams, {replace: true});
  }, [searchParams, setSearchParams]);

  const openEditVehicle = (vehicle: DbVehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm(createVehicleForm(vehicle));
    setPublishToMarketplace(false);
    setVehicleFormError('');
    setIsAddingVehicle(true);
  };

  const closeVehicleModal = () => {
    setEditingVehicle(null);
    setVehicleForm(createVehicleForm());
    setVehicleFormError('');
    setIsAddingVehicle(false);
  };

  const handleDeleteVehicle = async (vehicle: DbVehicle) => {
    if (!window.confirm(`Xóa "${vehicle.title}" và các tin bán liên quan?`)) return;
    try {
      await apiRequest(`/garage/vehicles/${vehicle.id}`, {method: 'DELETE'});
      setMyVehicles((vehicles) => vehicles.filter((item) => item.id !== vehicle.id));
      setMyListings((listings) => listings.filter((listing) => listing.vehicle?.id !== vehicle.id));
    } catch (error) {
      setVehicleFormError(error instanceof Error ? error.message : 'Không thể xóa xe.');
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
      setListingFormError(error instanceof Error ? error.message : 'Không thể lưu tin đăng chợ xe.');
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
        animate={{
          marginLeft: isOpen ? '16rem' : '0rem',
          width: isOpen ? 'calc(100% - 16rem)' : '100%',
        }}
        className="w-full pb-24 transition-all duration-300 max-md:!ml-0 max-md:!w-full"
      >
        <TopNav title="Hồ sơ của tôi" />
        
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
                    {isUploadingAvatar && (
                      <div className="absolute inset-1.5 flex items-center justify-center rounded-[2rem] bg-black/55">
                        <LoaderCircle className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <label className={`absolute top-3 right-3 bg-black/70 p-2 rounded-xl shadow-lg border border-white/10 transition-all ${isUploadingAvatar ? 'cursor-wait opacity-70' : 'cursor-pointer hover:bg-primary hover:text-on-primary'}`} title="Đổi ảnh đại diện">
                    {isUploadingAvatar ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={isUploadingAvatar}
                      onChange={(event) => {
                        void handleProfileImageUpload(event.target.files?.[0], 'avatar');
                        event.currentTarget.value = '';
                      }}
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
                    <span className="badge-primary">{user?.role === 'ADMIN' ? 'Admin' : 'Thành viên'}</span>
                    {(isVerifiedProfessional || user?.role === 'ADMIN') && (
                      <BadgeCheck className="h-6 w-6 text-blue-400" aria-label="Tài khoản đã xác thực" />
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs text-on-surface-variant font-mono uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {profileLocation || 'Chưa có địa điểm'}</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> @{handle}</span>
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
                  <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Giới thiệu thành viên</h3>
                  <button
                    type="button"
                    onClick={openEditProfile}
                    className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline"
                  >
                    Chỉnh sửa
                  </button>
                </div>
                <p className="text-sm text-on-surface leading-loose mb-8">
                  {profileBio || 'Viết vài dòng giới thiệu về Garage, gu xe và phong cách sưu tầm của bạn.'}
                </p>
                
                <div className="space-y-4 pt-6 border-t border-white/5">
                   <h4 className="text-[10px] font-mono uppercase text-on-surface-variant tracking-widest mb-4">Hãng quan tâm</h4>
                   <div className="flex flex-wrap gap-2">
                      {(profileFocusBrands.length ? profileFocusBrands : ['Thêm hãng yêu thích']).map(b => (
                        <span key={b} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold">{b}</span>
                      ))}
                   </div>
                </div>
              </div>

              <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Đánh giá người bán</h3>
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
                    Dựa trên {profileRating?.totalRatings ?? 0} lượt đánh giá
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
                  { id: 'posts', label: 'Bài viết', icon: PenTool },
                  { id: 'marketplace', label: 'Chợ xe', icon: List },
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
                          <p className="text-[10px] font-mono text-primary uppercase font-bold mb-1">{conditionLabel(vehicle.condition)}</p>
                          <h4 className="text-xl font-bold text-white mb-1">{vehicle.title}</h4>
                          {vehicle.description && <p className="text-xs text-white/70 line-clamp-2 mb-2">{vehicle.description}</p>}
                          <span className="text-[10px] text-white/60 font-mono uppercase">{listingStatusLabel(vehicle.status)}</span>
                          <button
                            type="button"
                            disabled={hasActiveListing(vehicle)}
                            onClick={() => openListingModal(vehicle)}
                            className="mt-4 btn-primary px-4 py-2 text-[10px] w-fit disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {hasActiveListing(vehicle) ? 'Đã đăng bán' : 'Đăng bán'}
                          </button>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditVehicle(vehicle)}
                              className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-[10px] font-bold text-white hover:bg-white/10"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteVehicle(vehicle)}
                              className="flex items-center gap-1 rounded-lg border border-red-400/30 bg-black/35 px-3 py-2 text-[10px] font-bold text-red-200 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {myVehicles.length === 0 && (
                      <div className="aspect-[4/3] rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 flex flex-col justify-center text-on-surface-variant">
                        <p className="font-display text-xl font-bold text-on-surface">Garage của bạn đang trống</p>
                        <p className="text-sm mt-2">Thêm chiếc xe đầu tiên, sau đó đăng lên chợ xe khi bạn sẵn sàng bán.</p>
                      </div>
                    )}
                    <button
                      onClick={openCreateVehicle}
                      className="aspect-[4/3] border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all"
                    >
                      <Plus className="w-8 h-8" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">Thêm xe</span>
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
                    {myPosts.map((post) => ({
                      id: post.id,
                      author: {
                        id: user?.id,
                        name: displayName,
                        handle,
                        avatar,
                        isVerified: Boolean(isVerifiedProfessional || user?.role === 'ADMIN'),
                        isProUser: Boolean(isVerifiedProfessional || user?.role === 'ADMIN'),
                        role: user?.role,
                      },
                      type: 'story' as const,
                      content: post.content,
                      image: post.images[0]?.url,
                      images: post.images.map((image) => image.url),
                      timestamp: new Date(post.createdAt).toLocaleDateString(),
                      likes: 0,
                      comments: 0,
                      category: post.status,
                    })).map((post, i) => (
                      <SocialPost
                        key={myPosts[i]?.id ?? i}
                        {...post}
                        onDeleted={(postId) => setMyPosts((current) => current.filter((item) => item.id !== postId))}
                        onCaptionUpdated={(postId, content) =>
                          setMyPosts((current) => current.map((item) => (item.id === postId ? {...item, content} : item)))
                        }
                      />
                    ))}
                    {myPosts.length === 0 && (
                      <div className="glass-card rounded-[2rem] border-white/5 p-10 text-center text-on-surface-variant">
                        Bạn chưa đăng bài viết nào.
                      </div>
                    )}
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
                               <p className="text-[10px] font-mono uppercase text-primary font-bold mb-2">{listingStatusLabel(listing.status)}</p>
                               <h3 className="font-display text-xl font-bold">{listing.title}</h3>
                               <p className="font-mono text-primary mt-2">{listing.price}</p>
                               <p className="text-xs text-on-surface-variant mt-2">{listing.location}</p>
                               {listing.description && <p className="text-xs text-on-surface-variant mt-3 line-clamp-2">{listing.description}</p>}
                               <div className="flex flex-wrap gap-2 mt-5">
                                 <Link to={`/market/${listing.id}`} className="btn-secondary px-4 py-2 text-[10px]">Xem</Link>
                                 <button onClick={() => openEditListingModal(listing)} className="btn-secondary px-4 py-2 text-[10px]">
                                   Sửa
                                 </button>
                                 <button onClick={() => handleToggleListingStatus(listing)} className="btn-secondary px-4 py-2 text-[10px]">
                                   {listing.status === 'Sold' ? 'Đăng lại' : 'Đánh dấu đã bán'}
                                 </button>
                                 <button onClick={() => handleDeleteListing(listing.id)} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-300 border border-red-500/20 hover:bg-red-500/10">
                                   Xóa
                                 </button>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                     <div className="glass-card p-12 text-center rounded-[2.5rem] border-white/5 opacity-40">
                        <List className="w-8 h-8 mx-auto mb-4" />
                        <p className="font-display text-lg font-bold">Chưa có tin đang bán</p>
                        <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mt-2">Thêm xe vào Garage để bắt đầu đăng bán</p>
                        <button onClick={openCreateVehicle} className="mt-8 btn-secondary px-8">Thêm tin đăng</button>
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
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm overflow-y-auto px-4 py-6 md:p-8">
          <form onSubmit={handleCreateVehicle} className="mx-auto my-0 md:my-6 w-full max-w-2xl bg-surface-container border border-white/10 rounded-[2rem] p-5 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold">{editingVehicle ? 'Sửa xe' : 'Thêm xe'}</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  {editingVehicle ? 'Cập nhật thông tin và hình ảnh xe trong Garage.' : 'Lưu xe vào Garage, sau đó có thể đăng lên chợ xe.'}
                </p>
              </div>
              <button type="button" onClick={closeVehicleModal} className="text-on-surface-variant hover:text-on-surface">Hủy</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Tên xe" value={vehicleForm.title} onChange={(event) => setVehicleForm({...vehicleForm, title: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
              <select value={vehicleForm.condition} onChange={(event) => setVehicleForm({...vehicleForm, condition: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3">
                <option value="New">Mới</option>
                <option value="Used">Đã qua sử dụng</option>
                <option value="Project">Xe dự án</option>
              </select>
              <input placeholder="Thông số, cách nhau bằng dấu phẩy" value={vehicleForm.specs} onChange={(event) => setVehicleForm({...vehicleForm, specs: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <input required placeholder="Hãng xe" value={vehicleForm.make} onChange={(event) => setVehicleForm({...vehicleForm, make: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
              <input required placeholder="Mẫu xe" value={vehicleForm.model} onChange={(event) => setVehicleForm({...vehicleForm, model: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
              <input required type="number" min="1886" max={new Date().getFullYear() + 1} placeholder="Năm sản xuất" value={vehicleForm.year} onChange={(event) => setVehicleForm({...vehicleForm, year: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
              <input type="number" min="0" placeholder="Số km đã đi" value={vehicleForm.mileage} onChange={(event) => setVehicleForm({...vehicleForm, mileage: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
              <select value={vehicleForm.bodyType} onChange={(event) => setVehicleForm({...vehicleForm, bodyType: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3">
                <option value="Coupe">Coupe</option><option value="Sedan">Sedan</option><option value="SUV">SUV</option><option value="Convertible">Mui trần</option><option value="Hatchback">Hatchback</option><option value="Pickup">Bán tải</option>
              </select>
              <select value={vehicleForm.fuelType} onChange={(event) => setVehicleForm({...vehicleForm, fuelType: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3">
                <option value="Gasoline">Xăng</option><option value="Diesel">Dầu</option><option value="Hybrid">Hybrid</option><option value="Electric">Điện</option>
              </select>
              <select value={vehicleForm.transmission} onChange={(event) => setVehicleForm({...vehicleForm, transmission: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3">
                <option value="Automatic">Tự động</option><option value="Manual">Số sàn</option>
              </select>
            </div>

            <textarea required placeholder="Mô tả xe trong Garage" value={vehicleForm.description} onChange={(event) => setVehicleForm({...vehicleForm, description: event.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 min-h-24" />
            <div className="space-y-4 rounded-2xl border border-white/10 bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">Ảnh xe</p>
                  <p className="text-xs text-on-surface-variant">
                    Ảnh đầu tiên là ảnh bìa. Có thể tải tối đa 12 ảnh.
                  </p>
                </div>
                <label className="btn-secondary w-fit cursor-pointer px-5 py-3 text-[10px]">
                  {isUploadingVehicleImage
                    ? 'Đang tải...'
                    : vehicleForm.images.length
                      ? 'Thêm ảnh'
                      : 'Chọn ảnh'}
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    disabled={isUploadingVehicleImage || vehicleForm.images.length >= 12}
                    className="hidden"
                    onChange={(event) => {
                      void handleVehicleImageUpload(event.target.files);
                      event.target.value = '';
                    }}
                  />
                </label>
              </div>
              {vehicleForm.images.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {vehicleForm.images.map((imageUrl, index) => (
                    <div key={imageUrl} className="relative aspect-video overflow-hidden rounded-xl border border-white/10">
                      <img src={imageUrl} alt={`Ảnh xe ${index + 1}`} className="h-full w-full object-cover" />
                      {index === 0 && (
                        <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-[9px] font-bold text-on-primary">
                          Ảnh bìa
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setVehicleForm((current) => ({
                            ...current,
                            images: current.images.filter((url) => url !== imageUrl),
                          }))
                        }
                        className="absolute right-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[9px] font-bold text-white hover:bg-red-500"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex aspect-[3/1] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03]">
                  <Camera className="h-8 w-8 text-on-surface-variant" />
                </div>
              )}
              <p className="text-right text-[10px] text-on-surface-variant">
                {vehicleForm.images.length}/12 ảnh
              </p>
            </div>

            {!editingVehicle && <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-background px-4 py-3">
              <input
                type="checkbox"
                checked={publishToMarketplace}
                onChange={(event) => setPublishToMarketplace(event.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-bold">Đăng lên chợ xe</span>
            </label>}

            {!editingVehicle && publishToMarketplace && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input required placeholder="Giá bán, ví dụ $65,000" value={vehicleForm.price} onChange={(event) => setVehicleForm({...vehicleForm, price: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
                  <input required placeholder="Địa điểm bán" value={vehicleForm.location} onChange={(event) => setVehicleForm({...vehicleForm, location: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3" />
                  <select value={vehicleForm.category} onChange={(event) => setVehicleForm({...vehicleForm, category: event.target.value})} className="bg-background border border-white/10 rounded-xl px-4 py-3">
                    <option value="Daily">Xe hằng ngày</option>
                    <option value="Classics">Xe cổ</option>
                    <option value="Exotics">Xe hiệu năng cao</option>
                    <option value="Projects">Xe dự án</option>
                  </select>
                </div>
                <textarea placeholder="Mô tả tin đăng, không bắt buộc" value={vehicleForm.listingDescription} onChange={(event) => setVehicleForm({...vehicleForm, listingDescription: event.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 min-h-24" />
              </div>
            )}

            {vehicleFormError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {vehicleFormError}
              </div>
            )}

            <button disabled={isSavingVehicle || isUploadingVehicleImage} type="submit" className="btn-primary w-full py-4 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
              {isUploadingVehicleImage
                ? 'Đang tải ảnh...'
                : isSavingVehicle
                  ? 'Đang lưu...'
                  : editingVehicle
                    ? 'Lưu thay đổi'
                    : publishToMarketplace
                      ? 'Lưu và đăng bán'
                      : 'Lưu vào Garage'}
            </button>
          </form>
        </div>
      )}
      {(listingVehicle || editingListing) && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm overflow-y-auto px-4 py-6 md:p-8">
          <form onSubmit={handleSaveListing} className="mx-auto my-0 md:my-6 w-full max-w-2xl bg-surface-container border border-white/10 rounded-[2rem] p-5 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {editingListing ? 'Sửa tin đăng chợ xe' : `Đăng bán ${listingVehicle?.title}`}
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Giá, địa điểm, danh mục và mô tả sẽ hiển thị trên chợ xe.
                </p>
              </div>
              <button type="button" onClick={closeListingModal} className="text-on-surface-variant hover:text-on-surface">Hủy</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                required
                placeholder="Giá bán, ví dụ $65,000"
                value={listingForm.price}
                onChange={(event) => setListingForm({...listingForm, price: event.target.value})}
                className="bg-background border border-white/10 rounded-xl px-4 py-3"
              />
              <input
                required
                placeholder="Địa điểm"
                value={listingForm.location}
                onChange={(event) => setListingForm({...listingForm, location: event.target.value})}
                className="bg-background border border-white/10 rounded-xl px-4 py-3"
              />
              <select
                value={listingForm.category}
                onChange={(event) => setListingForm({...listingForm, category: event.target.value})}
                className="bg-background border border-white/10 rounded-xl px-4 py-3"
              >
                <option value="Daily">Xe hằng ngày</option>
                <option value="Classics">Xe cổ</option>
                <option value="Exotics">Xe hiệu năng cao</option>
                <option value="Projects">Xe dự án</option>
              </select>
            </div>

            {editingListing && (
              <select
                value={listingForm.status}
                onChange={(event) => setListingForm({...listingForm, status: event.target.value})}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3"
              >
                <option value="Active Listing">Đang bán</option>
                <option value="Sold">Đã bán</option>
                <option value="Hidden">Đã ẩn</option>
              </select>
            )}

            <textarea
              placeholder="Mô tả tin đăng"
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
              {isSavingListing ? 'Đang lưu...' : editingListing ? 'Lưu thay đổi tin đăng' : 'Đăng lên chợ xe'}
            </button>
          </form>
        </div>
      )}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm overflow-y-auto px-4 py-6 md:p-8">
          <form onSubmit={handleSaveProfile} className="mx-auto my-0 md:my-6 w-full max-w-2xl bg-surface-container border border-white/10 rounded-[2rem] p-5 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold">Chỉnh sửa giới thiệu</h2>
                <p className="text-sm text-on-surface-variant mt-1">Thông tin này sẽ hiển thị trên hồ sơ công khai của bạn.</p>
              </div>
              <button type="button" onClick={() => setIsEditingProfile(false)} className="text-on-surface-variant hover:text-on-surface">Hủy</button>
            </div>

            <textarea
              placeholder="Giới thiệu bản thân với cộng đồng..."
              value={profileForm.bio}
              onChange={(event) => setProfileForm({...profileForm, bio: event.target.value})}
              maxLength={1000}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 min-h-36"
            />

            <div>
              <label className="mb-2 block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                Địa điểm
              </label>
              <select
                value={profileForm.location}
                onChange={(event) => setProfileForm({...profileForm, location: event.target.value})}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3"
              >
                <option value="">Chọn địa điểm của bạn</option>
                {profileLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-3 block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                Hãng quan tâm
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
                Đã chọn: {profileForm.focusBrands.length ? profileForm.focusBrands.join(', ') : 'Chưa chọn'}
              </p>
            </div>

            {profileFormError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {profileFormError}
              </div>
            )}

            <button disabled={isSavingProfile} type="submit" className="btn-primary w-full py-4 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
              {isSavingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
          </form>
        </div>
      )}
      <MobileNav />
    </div>
  );
}

