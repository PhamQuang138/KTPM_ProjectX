import {useEffect, useState} from 'react';
import {Link, Navigate, useParams} from 'react-router-dom';
import {ArrowLeft, CheckCircle2, Heart, MapPin, MessageCircle, Star, ZoomIn} from 'lucide-react';
import TopNav from '../components/TopNav';
import MobileNav from '../components/MobileNav';
import {apiRequest} from '../lib/api';
import {useAuthStore} from '../store/useAuthStore';
import {useMessageStore} from '../store/useMessageStore';
import ImageLightbox from '../components/ImageLightbox';

interface VehicleDetailData {
  id: string;
  title: string;
  description?: string;
  price: string;
  location: string;
  category: string;
  status: string;
  vehicle?: {
    title: string;
    description?: string;
    image: string;
    images: string[];
    condition: string;
    specs: string[];
    status: string;
  } | null;
  seller: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role?: 'USER' | 'ADMIN';
    isVerifiedProfessional?: boolean;
  };
  createdAt: string;
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {id: string; name: string; email: string; avatar?: string | null};
  }[];
  _count: {favorites: number; comments: number};
}

interface UserRating {
  averageRating: number;
  totalRatings: number;
  myRating: number | null;
}

const normalizeDescription = (value?: string) =>
  value?.replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi-VN') ?? '';

export default function VehicleDetail() {
  const {id} = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const startContact = useMessageStore((state) => state.startContact);
  const [vehicle, setVehicle] = useState<VehicleDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [sellerRating, setSellerRating] = useState<UserRating | null>(null);
  const [ratingError, setRatingError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [commentContent, setCommentContent] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    apiRequest<VehicleDetailData>(`/vehicles/${id}`)
      .then((data) => {
        setVehicle(data);
        setSelectedImage(data.vehicle?.image ?? '');
        setFavoriteCount(data._count.favorites);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!vehicle?.seller.id) return;

    apiRequest<UserRating>(`/users/${vehicle.seller.id}/rating`)
      .then(setSellerRating)
      .catch(() => undefined);
  }, [vehicle?.seller.id]);

  const handleRateSeller = async (score: number) => {
    if (!vehicle) return;

    setRatingError('');
    try {
      const rating = await apiRequest<UserRating>(`/users/${vehicle.seller.id}/rating`, {
        method: 'POST',
        body: JSON.stringify({score}),
      });
      setSellerRating(rating);
    } catch (error) {
      setRatingError(error instanceof Error ? error.message : 'Unable to rate seller.');
    }
  };

  const toggleFavorite = async () => {
    if (!vehicle) return;
    const result = await apiRequest<{favorite: boolean; count: number}>(`/vehicles/${vehicle.id}/favorite`, {method: 'POST'});
    setIsFavorite(result.favorite);
    setFavoriteCount(result.count);
  };

  const addComment = async () => {
    if (!vehicle || !commentContent.trim()) return;
    const result = await apiRequest<{comment: VehicleDetailData['comments'][number]; count: number}>(`/vehicles/${vehicle.id}/comments`, {
      method: 'POST',
      body: JSON.stringify({content: commentContent.trim()}),
    });
    setVehicle({...vehicle, comments: [...vehicle.comments, result.comment], _count: {...vehicle._count, comments: result.count}});
    setCommentContent('');
  };

  if (!id) return <Navigate to="/market" replace />;
  const gallery = vehicle
    ? [...new Set([vehicle.vehicle?.image, ...(vehicle.vehicle?.images ?? [])].filter((image): image is string => Boolean(image)))]
    : [];
  const selectedIndex = Math.max(0, gallery.indexOf(selectedImage));
  const listingDescription = vehicle?.description?.trim() ?? '';
  const garageDescription = vehicle?.vehicle?.description?.trim() ?? '';
  const showGarageDescription =
    Boolean(garageDescription) &&
    normalizeDescription(garageDescription) !== normalizeDescription(listingDescription);

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNav title="Vehicle Detail" />
      <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-10 pb-28">
        <Link to="/market" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to marketplace
        </Link>

        {isLoading && <div className="text-on-surface-variant">Loading listing...</div>}

        {!isLoading && !vehicle && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            Listing not found.
          </div>
        )}

        {vehicle && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <section className="lg:col-span-7 space-y-4">
              <button type="button" onClick={() => setLightboxIndex(selectedIndex)} className="group relative block w-full overflow-hidden rounded-[2rem] border border-white/10 bg-surface-container">
                <img src={selectedImage || vehicle.vehicle?.image} alt={vehicle.title} className="w-full aspect-[4/3] object-cover" />
                <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-xs text-white opacity-0 transition group-hover:opacity-100"><ZoomIn className="h-4 w-4" /> Phóng to</span>
              </button>
              <div className="grid grid-cols-4 gap-3">
                {gallery.slice(0, 12).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(image)}
                    className={`rounded-xl overflow-hidden border ${selectedImage === image ? 'border-primary' : 'border-white/10'}`}
                  >
                    <img src={image} alt={`${vehicle.title} ${index + 1}`} className="aspect-video w-full object-cover" />
                  </button>
                ))}
              </div>
            </section>

            <aside className="lg:col-span-5 space-y-6">
              <div className="border border-white/10 bg-white/[0.03] rounded-[2rem] p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="badge-primary">{vehicle.status}</span>
                  <span className="badge-secondary">{vehicle.vehicle?.condition ?? 'Used'}</span>
                </div>
                <h1 className="font-display text-4xl font-bold tracking-tight">{vehicle.title}</h1>
                <p className="font-mono text-primary text-2xl font-bold mt-4">{vehicle.price}</p>
                {listingDescription && (
                  <p className="whitespace-pre-line text-sm text-on-surface-variant leading-relaxed mt-5">{listingDescription}</p>
                )}
                {showGarageDescription && (
                  <p className="whitespace-pre-line text-sm text-on-surface-variant leading-relaxed mt-3">{garageDescription}</p>
                )}
                <p className="flex items-center gap-2 text-sm text-on-surface-variant mt-3">
                  <MapPin className="w-4 h-4" />
                  {vehicle.location}
                </p>

                <div className="flex flex-wrap gap-2 mt-8">
                  {(vehicle.vehicle?.specs ?? []).map((spec) => (
                    <span key={spec} className="px-3 py-2 rounded-xl bg-surface-container-high text-[10px] font-mono uppercase text-on-surface-variant">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 bg-white/[0.03] rounded-[2rem] p-8">
                <h2 className="font-display text-xl font-bold mb-5">Seller</h2>
                <Link to={`/profile/${vehicle.seller.id}`} className="flex items-center gap-4 group">
                  <img src={vehicle.seller.avatar ?? 'https://i.pravatar.cc/100?u=seller'} alt={vehicle.seller.name} className="w-14 h-14 rounded-full object-cover border border-white/10" />
                  <div>
                    <p className="font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                      {vehicle.seller.name}
                      {(vehicle.seller.role === 'ADMIN' || vehicle.seller.isVerifiedProfessional) && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </p>
                    <p className="text-xs text-on-surface-variant">{vehicle.seller.email}</p>
                  </div>
                </Link>
                <div className="grid grid-cols-2 gap-3 mt-8">
                  <button
                    type="button"
                    disabled={currentUser?.id === vehicle.seller.id}
                    onClick={() =>
                      startContact({
                        listingId: vehicle.id,
                        listingTitle: vehicle.title,
                        listingPrice: vehicle.price,
                        listingImage: vehicle.vehicle?.image,
                        sellerName: vehicle.seller.name,
                      })
                    }
                    className="btn-primary py-4 rounded-xl flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Liên hệ
                  </button>
                  <button onClick={toggleFavorite} className="btn-secondary py-4 rounded-xl flex items-center justify-center gap-2">
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-400' : ''}`} />
                    Lưu ({favoriteCount})
                  </button>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-3">
                    Seller Rating
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((score) => {
                      const filledScore = sellerRating?.myRating ?? Math.round(sellerRating?.averageRating ?? 0);
                      const disabled = currentUser?.id === vehicle.seller.id;
                      return (
                        <button
                          key={score}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleRateSeller(score)}
                          className="disabled:cursor-not-allowed"
                          title={disabled ? 'You cannot rate yourself' : `Rate ${score} stars`}
                        >
                          <Star className={`w-6 h-6 ${score <= filledScore ? 'fill-primary text-primary' : 'text-on-surface-variant'}`} />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-sm text-on-surface-variant">
                      {(sellerRating?.averageRating ?? 0).toFixed(1)} / 5 · {sellerRating?.totalRatings ?? 0} votes
                    </span>
                  </div>
                  {sellerRating?.myRating && currentUser?.id !== vehicle.seller.id && (
                    <p className="text-xs text-primary mt-3">Your vote: {sellerRating.myRating} stars</p>
                  )}
                  {currentUser?.id === vehicle.seller.id && (
                    <p className="text-xs text-on-surface-variant mt-3">This is your listing, so you cannot rate yourself.</p>
                  )}
                  {ratingError && <p className="text-xs text-red-300 mt-3">{ratingError}</p>}
                </div>
              </div>

              <div className="border border-white/10 bg-white/[0.03] rounded-[2rem] p-8">
                <h2 className="font-display text-xl font-bold">Trao đổi về xe ({vehicle._count.comments})</h2>
                <div className="mt-5 space-y-4">
                  {vehicle.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Link to={`/profile/${comment.user.id}`}>
                        <img src={comment.user.avatar ?? `https://i.pravatar.cc/80?u=${comment.user.email}`} className="h-9 w-9 rounded-full object-cover" alt={comment.user.name} />
                      </Link>
                      <div className="flex-1 rounded-xl bg-surface-container p-3">
                        <Link to={`/profile/${comment.user.id}`} className="text-xs font-bold hover:text-primary">{comment.user.name}</Link>
                        <p className="mt-1 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex gap-2">
                  <input value={commentContent} onChange={(event) => setCommentContent(event.target.value)} placeholder="Hỏi người bán hoặc trao đổi về xe..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-background px-4 py-3 text-sm" />
                  <button onClick={() => void addComment()} disabled={!commentContent.trim()} className="btn-primary px-5 disabled:opacity-50">Gửi</button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <ImageLightbox images={gallery} activeIndex={lightboxIndex} onChange={(index) => {setLightboxIndex(index); setSelectedImage(gallery[index] ?? '');}} onClose={() => setLightboxIndex(null)} alt={vehicle?.title ?? 'Ảnh xe'} />
      <MobileNav />
    </div>
  );
}
