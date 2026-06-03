import {useEffect, useState} from 'react';
import {Link, Navigate, useParams} from 'react-router-dom';
import {ArrowLeft, CheckCircle2, MapPin, MessageCircle, Share2} from 'lucide-react';
import TopNav from '../components/TopNav';
import MobileNav from '../components/MobileNav';
import {apiRequest} from '../lib/api';

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
  };
  createdAt: string;
}

export default function VehicleDetail() {
  const {id} = useParams();
  const [vehicle, setVehicle] = useState<VehicleDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (!id) return;

    apiRequest<VehicleDetailData>(`/vehicles/${id}`)
      .then((data) => {
        setVehicle(data);
        setSelectedImage(data.vehicle?.image ?? '');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (!id) return <Navigate to="/market" replace />;

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
              <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-surface-container">
                    <img src={selectedImage || vehicle.vehicle?.image} alt={vehicle.title} className="w-full aspect-[4/3] object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[vehicle.vehicle?.image, ...(vehicle.vehicle?.images ?? [])].filter(Boolean).slice(0, 8).map((image, index) => (
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
                <p className="text-sm text-on-surface-variant leading-relaxed mt-5">{vehicle.description}</p>
                {vehicle.vehicle?.description && (
                  <p className="text-sm text-on-surface-variant leading-relaxed mt-3">{vehicle.vehicle.description}</p>
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
                <div className="flex items-center gap-4">
                  <img src={vehicle.seller.avatar ?? 'https://i.pravatar.cc/100?u=seller'} alt={vehicle.seller.name} className="w-14 h-14 rounded-full object-cover border border-white/10" />
                  <div>
                    <p className="font-bold flex items-center gap-2">
                      {vehicle.seller.name}
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    </p>
                    <p className="text-xs text-on-surface-variant">{vehicle.seller.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-8">
                  <button className="btn-primary py-4 rounded-xl flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact
                  </button>
                  <button className="btn-secondary py-4 rounded-xl flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
