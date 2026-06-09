import {useEffect, useMemo, useState} from 'react';
import {ChevronLeft, ChevronRight, Filter, Search, TrendingUp, Users} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import MobileNav from '../components/MobileNav';
import VehicleCard from '../components/VehicleCard';
import {apiRequest} from '../lib/api';
import {useAuthStore} from '../store/useAuthStore';

interface Listing {
  id: string;
  title: string;
  price: string;
  location: string;
  category: string;
  isFavorite: boolean;
  seller: {
    id: string;
    name: string;
    avatar?: string | null;
    isVerifiedProfessional?: boolean;
  };
  vehicle?: {
    image: string;
    condition: string;
    specs: string[];
    make?: string;
    model?: string;
    year?: number;
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
  } | null;
  _count: {favorites: number; comments: number};
}

interface MarketplaceResponse {
  items: Listing[];
  pagination: {page: number; total: number; totalPages: number; limit: number};
  stats: {
    activeCount: number;
    newThisWeek: number;
    verifiedSellers: number;
    daily: {date: string; count: number}[];
  };
}

const categories = ['', 'Daily', 'Exotics', 'Classics', 'Projects'];
const conditions = ['', 'New', 'Used', 'Project'];
const bodyTypes = ['', 'Coupe', 'Sedan', 'SUV', 'Convertible', 'Crossover', 'Hatchback', 'Pickup'];
const fuelTypes = ['', 'Gasoline', 'Diesel', 'Hybrid', 'Electric'];
const transmissions = ['', 'Automatic', 'Manual'];

export default function Marketplace() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<MarketplaceResponse | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [make, setMake] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(Boolean(user?.isVerifiedProfessional));

  useEffect(() => {
    if (!user) return;
    apiRequest<{isVerifiedProfessional: boolean}>(`/users/${user.id}`)
      .then((profile) => setIsVerified(profile.isVerifiedProfessional))
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, category, condition, make, bodyType, fuelType, transmission, minYear, maxYear, sort]);

  const query = useMemo(() => {
    const params = new URLSearchParams({page: String(page), limit: '10', sort});
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (make) params.set('make', make);
    if (bodyType) params.set('bodyType', bodyType);
    if (fuelType) params.set('fuelType', fuelType);
    if (transmission) params.set('transmission', transmission);
    if (minYear) params.set('minYear', minYear);
    if (maxYear) params.set('maxYear', maxYear);
    return params.toString();
  }, [page, sort, debouncedSearch, category, condition, make, bodyType, fuelType, transmission, minYear, maxYear]);

  useEffect(() => {
    setIsLoading(true);
    apiRequest<MarketplaceResponse>(`/vehicles?${query}`)
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [query]);

  const toggleFavorite = async (listing: Listing) => {
    const result = await apiRequest<{favorite: boolean; count: number}>(`/vehicles/${listing.id}/favorite`, {method: 'POST'});
    setData((current) => current ? {
      ...current,
      items: current.items.map((item) => item.id === listing.id
        ? {...item, isFavorite: result.favorite, _count: {...item._count, favorites: result.count}}
        : item),
    } : current);
  };

  const maxDaily = Math.max(1, ...(data?.stats.daily.map((item) => item.count) ?? [1]));

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar />
      <main className="pb-24 md:ml-64">
        <TopNav title="Chợ xe" />
        <section className="mx-auto max-w-container-max px-5 py-8 md:px-margin-desktop">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold">Tìm chiếc xe phù hợp</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Tin đăng thật, bộ lọc rõ ràng và xu hướng dựa trên tương tác của cộng đồng.</p>
          </div>

          <div className="sticky top-20 z-30 mb-8 rounded-2xl border border-white/10 bg-background/95 p-4 backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row">
              <label className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo hãng, mẫu xe, địa điểm..." className="h-12 w-full rounded-xl border border-white/10 bg-surface-container pl-11 pr-4 text-sm outline-none focus:border-primary" />
              </label>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-12 rounded-xl border border-white/10 bg-surface-container px-4 text-sm">
                <option value="newest">Mới nhất</option>
                <option value="trending">Xu hướng</option>
                <option value="oldest">Cũ nhất</option>
              </select>
              <button onClick={() => setShowFilters((value) => !value)} className="btn-secondary flex h-12 items-center justify-center gap-2 px-5">
                <Filter className="h-4 w-4" /> Bộ lọc
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 md:grid-cols-4">
                <FilterSelect label="Danh mục" value={category} values={categories} onChange={setCategory} />
                <FilterSelect label="Tình trạng" value={condition} values={conditions} onChange={setCondition} />
                <label className="text-xs text-on-surface-variant">Hãng xe
                  <input value={make} onChange={(event) => setMake(event.target.value)} placeholder="Ví dụ: Ferrari" className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-surface-container px-3 text-sm text-on-surface" />
                </label>
                <FilterSelect label="Kiểu xe" value={bodyType} values={bodyTypes} onChange={setBodyType} />
                <FilterSelect label="Nhiên liệu" value={fuelType} values={fuelTypes} onChange={setFuelType} />
                <FilterSelect label="Hộp số" value={transmission} values={transmissions} onChange={setTransmission} />
                <label className="text-xs text-on-surface-variant">Từ năm
                  <input type="number" min="1886" max={new Date().getFullYear() + 1} value={minYear} onChange={(event) => setMinYear(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-surface-container px-3 text-sm text-on-surface" />
                </label>
                <label className="text-xs text-on-surface-variant">Đến năm
                  <input type="number" min="1886" max={new Date().getFullYear() + 1} value={maxYear} onChange={(event) => setMaxYear(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-surface-container px-3 text-sm text-on-surface" />
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <section className="lg:col-span-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Xe đang được rao bán</h2>
                {sort === 'trending' && <span className="flex items-center gap-2 text-xs text-primary"><TrendingUp className="h-4 w-4" /> Nhiều lượt lưu và bình luận</span>}
              </div>
              {isLoading ? (
                <div className="py-20 text-center text-on-surface-variant">Đang tải chợ xe...</div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {data?.items.map((listing) => (
                    <VehicleCard
                      key={listing.id}
                      id={listing.id}
                      image={listing.vehicle?.image ?? ''}
                      price={listing.price}
                      title={listing.title}
                      location={listing.location}
                      seller={listing.seller}
                      condition={listing.vehicle?.condition ?? 'Used'}
                      specs={listing.vehicle?.specs ?? []}
                      favoriteCount={listing._count.favorites}
                      commentCount={listing._count.comments}
                      isFavorite={listing.isFavorite}
                      onToggleFavorite={() => void toggleFavorite(listing)}
                    />
                  ))}
                </div>
              )}
              {!isLoading && !data?.items.length && <div className="rounded-2xl border border-white/10 p-12 text-center text-on-surface-variant">Không tìm thấy xe phù hợp với bộ lọc.</div>}

              {(data?.pagination.totalPages ?? 1) > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="interactive-icon disabled:opacity-30"><ChevronLeft /></button>
                  <span className="text-sm">Trang {page} / {data?.pagination.totalPages}</span>
                  <button disabled={page >= (data?.pagination.totalPages ?? 1)} onClick={() => setPage((value) => value + 1)} className="interactive-icon disabled:opacity-30"><ChevronRight /></button>
                </div>
              )}
            </section>

            <aside className="space-y-6 lg:col-span-4">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="flex items-center gap-2 font-bold"><TrendingUp className="h-5 w-5 text-primary" /> Nhịp thị trường</h3>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <Stat value={data?.stats.activeCount ?? 0} label="Đang bán" />
                  <Stat value={data?.stats.newThisWeek ?? 0} label="Mới 7 ngày" />
                  <Stat value={data?.stats.verifiedSellers ?? 0} label="Người bán xác thực" />
                </div>
                <div className="mt-7 flex h-28 items-end gap-2 border-t border-white/10 pt-5">
                  {data?.stats.daily.map((item) => (
                    <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t bg-primary/80" style={{height: `${Math.max(6, item.count / maxDaily * 76)}px`}} title={`${item.count} tin`} />
                      <span className="text-[9px] text-on-surface-variant">{new Date(item.date).toLocaleDateString('vi-VN', {weekday: 'short'})}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!isVerified && (
                <div className="rounded-2xl border border-white/10 bg-surface-container-high p-6">
                  <Users className="mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-display text-lg font-bold">Xác thực người bán</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">Hoàn thiện hồ sơ để tăng độ tin cậy khi đăng xe và giao dịch.</p>
                  <button className="btn-primary mt-5 w-full py-3">Gửi yêu cầu xác thực</button>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}

function FilterSelect({label, value, values, onChange}: {label: string; value: string; values: string[]; onChange: (value: string) => void}) {
  return (
    <label className="text-xs text-on-surface-variant">{label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-surface-container px-3 text-sm text-on-surface">
        {values.map((item) => <option key={item || 'all'} value={item}>{item || 'Tất cả'}</option>)}
      </select>
    </label>
  );
}

function Stat({value, label}: {value: number; label: string}) {
  return <div><p className="font-display text-2xl font-bold">{value}</p><p className="mt-1 text-[9px] uppercase text-on-surface-variant">{label}</p></div>;
}
