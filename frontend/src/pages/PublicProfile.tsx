import {useEffect, useState} from 'react';
import {Link, Navigate, useParams} from 'react-router-dom';
import {ArrowLeft, Car, List, MapPin, Star} from 'lucide-react';
import TopNav from '../components/TopNav';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';
import {apiRequest} from '../lib/api';
import {useAuthStore} from '../store/useAuthStore';
import {useSidebarStore} from '../store/useSidebarStore';
import {motion} from 'motion/react';

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
  _count: {
    posts: number;
    garageVehicles: number;
    vehicleListings: number;
  };
  social: {
    followers: number;
    following: number;
    posts: number;
    isFollowing: boolean;
  };
}

export default function PublicProfile() {
  const {id} = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const {isOpen} = useSidebarStore();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingError, setRatingError] = useState('');
  const [followError, setFollowError] = useState('');
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    apiRequest<PublicProfileData>(`/users/${id}`)
      .then(setProfile)
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
      setRatingError(error instanceof Error ? error.message : 'Unable to rate this user.');
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
      setFollowError(error instanceof Error ? error.message : 'Unable to update follow status.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (!id) return <Navigate to="/market" replace />;

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar />
      <motion.main animate={{marginLeft: isOpen ? '16rem' : '0rem'}} className="pb-24 transition-all duration-300">
        <TopNav title="Public Profile" />
        <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-10">
          <Link to="/market" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to marketplace
          </Link>

          {isLoading && <div className="text-on-surface-variant">Loading profile...</div>}

          {!isLoading && !profile && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">Profile not found.</div>
          )}

          {profile && (
            <div className="space-y-10">
              <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
                <div className="relative -m-8 md:-m-10 mb-8 h-48 overflow-hidden rounded-t-[2.5rem] bg-surface-container-high">
                  <img
                    src={profile.bannerImage || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000'}
                    alt={`${profile.name} banner`}
                    className="h-full w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                </div>
                <div className="flex flex-col md:flex-row gap-8 md:items-end justify-between">
                  <div className="flex flex-col md:flex-row gap-6 md:items-end">
                    <img
                      src={profile.avatar ?? `https://i.pravatar.cc/200?u=${encodeURIComponent(profile.email)}`}
                      alt={profile.name}
                      className="w-32 h-32 rounded-[2rem] object-cover border border-white/10"
                    />
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-2">Community Profile</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">{profile.name}</h1>
                        {profile.social.followers >= 5 && <Star className="w-6 h-6 fill-primary text-primary" />}
                        {profile.isVerifiedProfessional && <span className="badge-success">Verified Pro</span>}
                      </div>
                      <p className="text-sm text-on-surface-variant mt-2">@{profile.email.split('@')[0]}</p>
                      <p className="text-sm text-on-surface-variant mt-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {profile.location || 'No location yet'}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-3">
                        Member since {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                      {currentUser?.id !== profile.id && (
                        <div className="mt-5">
                          <button
                            type="button"
                            disabled={isFollowLoading}
                            onClick={handleToggleFollow}
                            className={profile.social.isFollowing ? 'btn-secondary px-8 py-3 rounded-2xl' : 'btn-primary px-8 py-3 rounded-2xl'}
                          >
                            {isFollowLoading ? 'Please wait...' : profile.social.isFollowing ? 'Following' : 'Follow'}
                          </button>
                          {followError && <p className="text-xs text-red-300 mt-3">{followError}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-surface-container p-6 min-w-72">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-3">Seller Rating</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((score) => {
                        const filledScore = profile.rating.myRating ?? Math.round(profile.rating.averageRating);
                        const disabled = currentUser?.id === profile.id;
                        return (
                          <button
                            key={score}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleRateUser(score)}
                            title={disabled ? 'You cannot rate yourself' : `Rate ${score} stars`}
                          >
                            <Star className={`w-6 h-6 ${score <= filledScore ? 'fill-primary text-primary' : 'text-on-surface-variant'}`} />
                          </button>
                        );
                      })}
                    </div>
                    <p className="font-display text-3xl font-bold mt-4">
                      {profile.rating.averageRating.toFixed(1)}
                      <span className="text-base text-on-surface-variant"> / 5</span>
                    </p>
                    <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mt-1">
                      {profile.rating.totalRatings} user votes
                    </p>
                    {profile.rating.myRating && currentUser?.id !== profile.id && (
                      <p className="text-xs text-primary mt-3">Your vote: {profile.rating.myRating} stars</p>
                    )}
                    {currentUser?.id === profile.id && (
                      <p className="text-xs text-on-surface-variant mt-3">This is your profile, so you cannot rate yourself.</p>
                    )}
                    {ratingError && <p className="text-xs text-red-300 mt-3">{ratingError}</p>}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-3">About Collector</p>
                    <p className="text-sm text-on-surface leading-loose">
                      {profile.bio || 'This collector has not written an introduction yet.'}
                    </p>
                  </div>
                  <div className="md:col-span-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-3">Focus Brands</p>
                    <div className="flex flex-wrap gap-2">
                      {(profile.focusBrands.length ? profile.focusBrands : ['No brands yet']).map((brand) => (
                        <span key={brand} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold">
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                  {[
                    ['Followers', profile.social.followers],
                    ['Following', profile.social.following],
                    ['Posts', profile.social.posts],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 text-center">
                      <p className="font-display text-2xl font-bold">{value}</p>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Public Garage
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {profile.garageVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.03]">
                      <img src={vehicle.image} alt={vehicle.title} className="aspect-[4/3] w-full object-cover" />
                      <div className="p-5">
                        <p className="text-[10px] font-mono uppercase text-primary font-bold">{vehicle.condition}</p>
                        <h3 className="font-display text-xl font-bold mt-1">{vehicle.title}</h3>
                        {vehicle.description && <p className="text-xs text-on-surface-variant mt-3 line-clamp-2">{vehicle.description}</p>}
                      </div>
                    </div>
                  ))}
                  {profile.garageVehicles.length === 0 && (
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-on-surface-variant">
                      This user has not added public garage vehicles yet.
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <List className="w-5 h-5 text-primary" />
                  Marketplace Listings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {profile.vehicleListings.map((listing) => (
                    <Link key={listing.id} to={`/market/${listing.id}`} className="rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.03] hover:border-primary/30 transition-all">
                      <img src={listing.vehicle?.image ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200'} alt={listing.title} className="aspect-[4/3] w-full object-cover" />
                      <div className="p-5">
                        <p className="text-[10px] font-mono uppercase text-primary font-bold">{listing.status}</p>
                        <h3 className="font-display text-xl font-bold mt-1">{listing.title}</h3>
                        <p className="font-mono text-primary mt-2">{listing.price}</p>
                        <p className="flex items-center gap-1 text-xs text-on-surface-variant mt-2">
                          <MapPin className="w-3 h-3" />
                          {listing.location}
                        </p>
                      </div>
                    </Link>
                  ))}
                  {profile.vehicleListings.length === 0 && (
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-on-surface-variant">
                      This user has no active marketplace listings.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </main>
      </motion.main>
      <MobileNav />
    </div>
  );
}
