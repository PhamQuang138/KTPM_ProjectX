import {useEffect, useState} from 'react';
import {Link, Navigate, useParams} from 'react-router-dom';
import {ArrowLeft, BadgeCheck, Camera, Globe, Grid3X3, List, LoaderCircle, MapPin, MessageCircle, PenTool, Star} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import TopNav from '../components/TopNav';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';
import SocialPost, {SocialPostProps} from '../components/SocialPost';
import {apiRequest} from '../lib/api';
import {useAuthStore} from '../store/useAuthStore';
import {useSidebarStore} from '../store/useSidebarStore';
import {useMessageStore} from '../store/useMessageStore';
import {uploadImage} from '../lib/imageUpload';

interface PublicPost {
  id: string;
  title: string;
  content: string;
  summary?: string;
  status: 'DRAFT' | 'PUBLISHED';
  images: {url: string; caption?: string}[];
  createdAt: string;
}

interface PublicProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bannerImage?: string | null;
  bio?: string | null;
  location?: string | null;
  focusBrands: string[];
  isVerifiedProfessional: boolean;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  rating: {
    averageRating: number;
    totalRatings: number;
    myRating: number | null;
  };
  garageVehicles: {
    id: string;
    title: string;
    description?: string;
    image: string;
    condition: string;
    status: string;
    specs: string[];
  }[];
  vehicleListings: {
    id: string;
    title: string;
    description?: string;
    price: string;
    location: string;
    status: string;
    vehicle?: {
      image: string;
      condition: string;
    } | null;
  }[];
  social: {
    followers: number;
    following: number;
    posts: number;
    isFollowing: boolean;
  };
}

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
    'In Garage': 'Trong gara',
  })[status] ?? status;

export default function PublicProfile() {
  const {id} = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const {isOpen} = useSidebarStore();
  const startDirect = useMessageStore((state) => state.startDirect);
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [activeTab, setActiveTab] = useState('garage');
  const [isLoading, setIsLoading] = useState(true);
  const [ratingError, setRatingError] = useState('');
  const [followError, setFollowError] = useState('');
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    Promise.all([
      apiRequest<PublicProfileData>(`/users/${id}`),
      apiRequest<PublicPost[]>(`/posts?authorId=${id}`),
    ])
      .then(([profileData, postData]) => {
        setProfile(profileData);
        setPosts(postData.filter((post) => post.status === 'PUBLISHED'));
      })
      .catch(() => setProfile(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleRateUser = async (score: number) => {
    if (!profile) return;

    setRatingError('');
    try {
      const rating = await apiRequest<PublicProfileData['rating']>(`/users/${profile.id}/rating`, {
        method: 'POST',
        body: JSON.stringify({score}),
      });
      setProfile({...profile, rating});
    } catch (error) {
      setRatingError(error instanceof Error ? error.message : 'Không thể đánh giá người dùng này.');
    }
  };

  const handleToggleFollow = async () => {
    if (!profile || currentUser?.id === profile.id || isFollowLoading) return;

    setFollowError('');
    setIsFollowLoading(true);
    try {
      const social = await apiRequest<Pick<PublicProfileData['social'], 'followers' | 'following' | 'isFollowing'>>(
        `/users/${profile.id}/follow`,
        {method: profile.social.isFollowing ? 'DELETE' : 'POST'},
      );
      setProfile({
        ...profile,
        social: {
          ...profile.social,
          ...social,
        },
      });
    } catch (error) {
      setFollowError(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái theo dõi.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleAvatarUpload = async (file?: File) => {
    if (!file || !profile || currentUser?.id !== profile.id || isUploadingAvatar) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarError('');
    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadImage(file);
      const updated = await apiRequest<{avatar?: string | null}>('/users/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({avatar: uploaded.url}),
      });
      const nextAvatar = updated.avatar ?? uploaded.url;
      updateUser({avatar: nextAvatar});
      setProfile((current) => current ? {...current, avatar: nextAvatar} : current);
      setAvatarPreview('');
    } catch (error) {
      setAvatarPreview('');
      setAvatarError(error instanceof Error ? error.message : 'Không thể cập nhật ảnh đại diện.');
    } finally {
      URL.revokeObjectURL(previewUrl);
      setIsUploadingAvatar(false);
    }
  };

  if (!id) return <Navigate to="/market" replace />;

  const handle = profile?.email.split('@')[0] ?? 'collector';
  const avatar = avatarPreview || profile?.avatar || `https://i.pravatar.cc/200?u=${encodeURIComponent(profile?.email ?? 'collector')}`;
  const banner =
    profile?.bannerImage ||
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000';
  const profileStats = profile
    ? [
        {label: 'Người theo dõi', value: profile.social.followers.toString()},
        {label: 'Đang theo dõi', value: profile.social.following.toString()},
        {label: 'Bài viết', value: profile.social.posts.toString()},
      ]
    : [];

  const socialPosts: SocialPostProps[] = profile
    ? posts.map((post) => ({
        id: post.id,
        author: {
          id: profile.id,
          name: profile.name,
          handle,
          avatar,
          isVerified: profile.isVerifiedProfessional || profile.role === 'ADMIN',
          isProUser: profile.isVerifiedProfessional || profile.role === 'ADMIN',
          role: profile.role,
        },
        type: 'story' as const,
        content: post.content,
        image: post.images[0]?.url,
        images: post.images.map((image) => image.url),
        timestamp: new Date(post.createdAt).toLocaleDateString(),
        likes: 0,
        comments: 0,
        shares: 0,
        category: post.status,
      }))
    : [];

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar />
      <motion.main
        animate={{
          marginLeft: isOpen ? '16rem' : '0rem',
          width: isOpen ? 'calc(100% - 16rem)' : '100%',
        }}
        className="w-full pb-24 transition-all duration-300 max-lg:!ml-0 max-lg:!w-full"
      >
        <TopNav title="Hồ sơ" />

        <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop py-4 overflow-hidden">
          <Link to="/market" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" />
            Quay lại chợ xe
          </Link>

          {isLoading && <div className="text-on-surface-variant">Đang tải hồ sơ...</div>}

          {!isLoading && !profile && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">Không tìm thấy hồ sơ.</div>
          )}

          {profile && (
            <>
              <div className="relative mb-44">
                <div className="h-48 md:h-64 w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-surface-container-high border border-white/5 relative group">
                  <img
                    src={banner}
                    className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
                    alt={`Ảnh bìa của ${profile.name}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                <div className="absolute -bottom-36 left-4 right-4 md:left-12 md:right-12 flex flex-col md:flex-row items-end justify-between gap-6 min-w-0">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left w-full md:w-auto min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-[6px] border-background bg-background p-1.5 shadow-2xl">
                        <img src={avatar} className="w-full h-full object-cover rounded-[2rem]" alt={profile.name} />
                        {isUploadingAvatar && (
                          <div className="absolute inset-1.5 flex items-center justify-center rounded-[2rem] bg-black/55">
                            <LoaderCircle className="h-8 w-8 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      {currentUser?.id === profile.id && (
                        <label
                          className={`absolute right-2 top-2 rounded-xl border border-white/10 bg-black/70 p-2 shadow-lg transition ${isUploadingAvatar ? 'cursor-wait opacity-70' : 'cursor-pointer hover:bg-primary hover:text-on-primary'}`}
                          title="Đổi ảnh đại diện"
                        >
                          {isUploadingAvatar ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={isUploadingAvatar}
                            onChange={(event) => {
                              void handleAvatarUpload(event.target.files?.[0]);
                              event.currentTarget.value = '';
                            }}
                          />
                        </label>
                      )}
                      {profile.social.followers >= 5 && (
                        <div className="absolute bottom-4 -right-2 bg-primary p-2 rounded-xl shadow-lg border-2 border-background" title="Nhà sưu tầm nổi bật">
                          <Star className="w-4 h-4 text-on-primary fill-current" />
                        </div>
                      )}
                      {avatarError && (
                        <p className="absolute left-0 top-full mt-2 w-56 text-left text-xs text-red-300">{avatarError}</p>
                      )}
                    </div>

                    <div className="md:mb-4 min-w-0">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2 min-w-0">
                        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight break-words min-w-0">{profile.name}</h1>
                        <span className="badge-primary">{profile.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}</span>
                        {(profile.isVerifiedProfessional || profile.role === 'ADMIN') && (
                          <BadgeCheck className="h-6 w-6 text-blue-400" aria-label="Tài khoản đã xác thực" />
                        )}
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs text-on-surface-variant font-mono uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="break-words">{profile.location || 'Chưa có địa điểm'}</span>
                        </span>
                        <span className="opacity-30 hidden sm:inline">-</span>
                        <span className="flex items-center gap-1.5 min-w-0">
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span className="break-all">@{handle}</span>
                        </span>
                      </div>
                      {currentUser?.id !== profile.id && (
                        <div className="mt-5 flex flex-col items-center md:items-start">
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              disabled={isFollowLoading}
                              onClick={handleToggleFollow}
                              className={profile.social.isFollowing ? 'btn-secondary px-8 py-3 rounded-2xl' : 'btn-primary px-8 py-3 rounded-2xl'}
                            >
                              {isFollowLoading ? 'Vui lòng chờ...' : profile.social.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                            </button>
                            <button type="button" onClick={() => startDirect({userId: profile.id, userName: profile.name})} className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-2xl">
                              <MessageCircle className="h-4 w-4" /> Nhắn tin
                            </button>
                          </div>
                          {followError && <p className="text-xs text-red-300 mt-3">{followError}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mb-4 w-full md:w-auto justify-center">
                    <div className="hidden md:flex gap-8 px-8 py-4 glass-card rounded-2xl border-white/5">
                      {profileStats.map((stat) => (
                        <div key={stat.label} className="text-center">
                          <p className="text-lg font-bold">{stat.value}</p>
                          <p className="text-[10px] text-on-surface-variant font-mono uppercase">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 md:hidden mb-8 mt-12 bg-white/5 p-4 rounded-2xl">
                {profileStats.map((stat) => (
                  <div key={stat.label} className="text-center min-w-0">
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-tighter">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 md:mt-24">
                <aside className="lg:col-span-4 space-y-8 min-w-0">
                  <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5 min-w-0">
                    <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-6">Giới thiệu thành viên</h3>
                    <p className="text-sm text-on-surface leading-loose mb-8 break-words">
                      {profile.bio || 'Thành viên này chưa viết phần giới thiệu.'}
                    </p>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <h4 className="text-[10px] font-mono uppercase text-on-surface-variant tracking-widest mb-4">Hãng quan tâm</h4>
                      <div className="flex flex-wrap gap-2">
                        {(profile.focusBrands.length ? profile.focusBrands : ['Chưa chọn hãng']).map((brand) => (
                          <span key={brand} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold">
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5">
                    <h3 className="font-display text-xs font-bold uppercase tracking-[0.2em] mb-6 text-on-surface-variant">Đánh giá người bán</h3>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {[1, 2, 3, 4, 5].map((score) => {
                        const filledScore = profile.rating.myRating ?? Math.round(profile.rating.averageRating);
                        const disabled = currentUser?.id === profile.id;
                        return (
                          <button
                            key={score}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleRateUser(score)}
                            title={disabled ? 'Bạn không thể tự đánh giá' : `Đánh giá ${score} sao`}
                          >
                            <Star className={`w-7 h-7 ${score <= filledScore ? 'fill-primary text-primary' : 'text-on-surface-variant'}`} />
                          </button>
                        );
                      })}
                    </div>
                    <div>
                      <p className="font-display text-3xl font-bold">
                        {profile.rating.averageRating.toFixed(1)}
                        <span className="text-base text-on-surface-variant"> / 5</span>
                      </p>
                      <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mt-2">
                        Dựa trên {profile.rating.totalRatings} lượt đánh giá
                      </p>
                      {profile.rating.myRating && currentUser?.id !== profile.id && (
                        <p className="text-xs text-primary mt-3">Đánh giá c?a b?n: {profile.rating.myRating} sao</p>
                      )}
                      {currentUser?.id === profile.id && (
                        <p className="text-xs text-on-surface-variant mt-3">Đây là hồ sơ của bạn nên bạn không thể tự đánh giá.</p>
                      )}
                      {ratingError && <p className="text-xs text-red-300 mt-3">{ratingError}</p>}
                    </div>
                  </div>
                </aside>

                <div className="lg:col-span-8 space-y-8 min-w-0">
                  <div className="flex gap-8 border-b border-white/10 pb-4 overflow-x-auto scrollbar-hide">
                    {[
                      {id: 'garage', label: 'Gara', icon: Grid3X3},
                      {id: 'posts', label: 'Bài viết', icon: PenTool},
                      {id: 'marketplace', label: 'Chợ xe', icon: List},
                    ].map((tab) => (
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
                          <motion.div layoutId="publicProfileTab" className="absolute -bottom-4 left-0 right-0 h-[2px] bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'garage' && (
                      <motion.div
                        key="garage"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        {profile.garageVehicles.map((vehicle) => (
                          <div key={vehicle.id} className="group relative rounded-[2rem] overflow-hidden border border-white/5">
                            <img src={vehicle.image} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700" alt={vehicle.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                              <p className="text-[10px] font-mono text-primary uppercase font-bold mb-1">{conditionLabel(vehicle.condition)}</p>
                              <h4 className="text-xl font-bold text-white mb-1 break-words">{vehicle.title}</h4>
                              {vehicle.description && <p className="text-xs text-white/70 line-clamp-2 mb-2">{vehicle.description}</p>}
                              <span className="text-[10px] text-white/60 font-mono uppercase">{listingStatusLabel(vehicle.status)}</span>
                            </div>
                          </div>
                        ))}
                        {profile.garageVehicles.length === 0 && (
                          <div className="aspect-[4/3] rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 flex flex-col justify-center text-on-surface-variant">
                            <p className="font-display text-xl font-bold text-on-surface">Gara đang trống</p>
                            <p className="text-sm mt-2">Thành viên này chưa thêm xe công khai trong gara.</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'posts' && (
                      <motion.div
                        key="posts"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        className="space-y-6"
                      >
                        {socialPosts.map((post) => (
                          <SocialPost
                            key={post.id}
                            {...post}
                            onDeleted={(postId) => setPosts((current) => current.filter((item) => item.id !== postId))}
                            onCaptionUpdated={(postId, content) =>
                              setPosts((current) => current.map((item) => (item.id === postId ? {...item, content} : item)))
                            }
                          />
                        ))}
                        {socialPosts.length === 0 && (
                          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-on-surface-variant">
                            Thành viên này chưa đăng bài viết nào.
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'marketplace' && (
                      <motion.div
                        key="marketplace"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        className="space-y-4"
                      >
                        {profile.vehicleListings.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profile.vehicleListings.map((listing) => (
                              <div key={listing.id} className="rounded-[2rem] border border-white/5 bg-white/[0.03] overflow-hidden">
                                <img
                                  src={listing.vehicle?.image ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200'}
                                  alt={listing.title}
                                  className="aspect-[4/3] w-full object-cover"
                                />
                                <div className="p-6">
                                  <p className="text-[10px] font-mono uppercase text-primary font-bold mb-2">{listingStatusLabel(listing.status)}</p>
                                  <h3 className="font-display text-xl font-bold break-words">{listing.title}</h3>
                                  <p className="font-mono text-primary mt-2">{listing.price}</p>
                                  <p className="text-xs text-on-surface-variant mt-2">{listing.location}</p>
                                  {listing.description && <p className="text-xs text-on-surface-variant mt-3 line-clamp-2">{listing.description}</p>}
                                  <Link to={`/market/${listing.id}`} className="btn-secondary px-4 py-2 text-[10px] inline-flex mt-5">
                                    Xem
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="glass-card p-12 text-center rounded-[2.5rem] border-white/5 opacity-60">
                            <List className="w-8 h-8 mx-auto mb-4" />
                            <p className="font-display text-lg font-bold">Chưa có tin đang bán</p>
                            <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mt-2">Thành viên này chưa có tin bán xe đang hoạt động.</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}
        </section>
      </motion.main>
      <MobileNav />
    </div>
  );
}
