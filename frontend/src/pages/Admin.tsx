import {useEffect, useMemo, useState} from 'react';
import {
  Activity,
  BarChart3,
  Car,
  CheckCircle2,
  FileText,
  Gauge,
  MessageSquare,
  Newspaper,
  Star,
  Users,
} from 'lucide-react';
import TopNav from '../components/TopNav';
import {apiRequest} from '../lib/api';
import {Link} from 'react-router-dom';

interface Dashboard {
  users: number;
  posts: number;
  garageVehicles: number;
  vehicleListings: number;
  articles: number;
  comments: number;
  ratings: number;
  follows: number;
  draftPosts: number;
  publishedPosts: number;
  draftArticles: number;
  publishedArticles: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatar?: string | null;
  isVerifiedProfessional: boolean;
  createdAt: string;
  _count: {
    posts: number;
    garageVehicles: number;
    vehicleListings: number;
    postComments: number;
    postLikes: number;
    postShares: number;
    followers: number;
    following: number;
  };
}

interface AdminPost {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  author: {name: string; email: string};
  _count: {likes: number; comments: number; shares: number};
}

interface AdminVehicle {
  id: string;
  title: string;
  price: string;
  status: string;
  createdAt: string;
  seller: {name: string; email: string};
}

interface AdminGarageVehicle {
  id: string;
  title: string;
  status: string;
  condition: string;
  createdAt: string;
  owner: {name: string; email: string};
}

interface AdminArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
  author: string;
}

interface AdminComment {
  id: string;
  content: string;
  createdAt: string;
  user: {name: string; email: string};
  post: {title: string};
}

interface AdminRating {
  id: string;
  score: number;
  createdAt: string;
  rater: {name: string; email: string};
  targetUser: {name: string; email: string};
}

interface AdminFollow {
  id: string;
  createdAt: string;
  follower: {name: string; email: string};
  following: {name: string; email: string};
}

interface ChartPoint {
  label: string;
  value: number;
}

const dayKey = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const shortDay = (date: Date) =>
  new Intl.DateTimeFormat('en', {
    weekday: 'short',
  }).format(date);

const lastSevenDays = () =>
  Array.from({length: 7}, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

const countByDay = (items: {createdAt?: string}[]): ChartPoint[] => {
  const days = lastSevenDays();
  return days.map((date) => {
    const key = dayKey(date);
    return {
      label: shortDay(date),
      value: items.filter((item) => item.createdAt && dayKey(new Date(item.createdAt)) === key).length,
    };
  });
};

const formatDate = (date: string) => new Date(date).toLocaleDateString();

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  note: string;
  icon: typeof Users;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{note}</p>
        </div>
        <div className={`rounded-lg p-3 ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function BarChart({title, subtitle, data, color}: {title: string; subtitle: string; data: ChartPoint[]; color: string}) {
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <BarChart3 className="h-5 w-5 text-slate-400" />
      </div>
      <div className="flex h-56 items-end gap-3 border-b border-slate-100 pb-3">
        {data.map((point) => (
          <div key={point.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-full w-full items-end justify-center">
              <div
                className={`w-full max-w-10 rounded-t-md ${color}`}
                style={{height: `${Math.max(8, (point.value / max) * 100)}%`}}
                title={`${point.label}: ${point.value}`}
              />
            </div>
            <p className="text-[10px] font-bold uppercase text-slate-400">{point.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressRow({label, value, total, color}: {label: string; value: number; total: number; color: string}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-500">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{width: `${percent}%`}} />
      </div>
    </div>
  );
}

function ActionButton({children, onClick, danger = false}: {children: string; onClick: () => void; danger?: boolean}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition ${
        danger
          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function Admin() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [garageVehicles, setGarageVehicles] = useState<AdminGarageVehicle[]>([]);
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [ratings, setRatings] = useState<AdminRating[]>([]);
  const [follows, setFollows] = useState<AdminFollow[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async () => {
    setError('');
    setIsLoading(true);
    try {
      const [
        dashboardData,
        usersData,
        postsData,
        vehiclesData,
        garageData,
        articlesData,
        commentsData,
        ratingsData,
        followsData,
      ] = await Promise.all([
        apiRequest<Dashboard>('/admin/dashboard'),
        apiRequest<AdminUser[]>('/admin/users'),
        apiRequest<AdminPost[]>('/admin/posts'),
        apiRequest<AdminVehicle[]>('/admin/vehicles'),
        apiRequest<AdminGarageVehicle[]>('/admin/garage-vehicles'),
        apiRequest<AdminArticle[]>('/admin/articles'),
        apiRequest<AdminComment[]>('/admin/comments'),
        apiRequest<AdminRating[]>('/admin/ratings'),
        apiRequest<AdminFollow[]>('/admin/follows'),
      ]);

      setDashboard(dashboardData);
      setUsers(usersData);
      setPosts(postsData);
      setVehicles(vehiclesData);
      setGarageVehicles(garageData);
      setArticles(articlesData);
      setComments(commentsData);
      setRatings(ratingsData);
      setFollows(followsData);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const updatePostStatus = async (id: string, status: 'DRAFT' | 'PUBLISHED') => {
    await updateStatus(`/admin/posts/${id}/status`, status);
  };

  const updateUserVerification = async (id: string, isVerifiedProfessional: boolean) => {
    try {
      await apiRequest(`/admin/users/${id}/verification`, {
        method: 'PATCH',
        body: JSON.stringify({isVerifiedProfessional}),
      });
      await loadAdminData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update user verification.');
    }
  };

  const updateStatus = async (path: string, status: string) => {
    try {
      await apiRequest(path, {
        method: 'PATCH',
        body: JSON.stringify({status}),
      });
      await loadAdminData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update status.');
    }
  };

  const deleteResource = async (path: string) => {
    if (!window.confirm('Delete this item permanently?')) return;
    try {
      await apiRequest(path, {method: 'DELETE'});
      await loadAdminData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete the item.');
    }
  };

  const postChart = useMemo(() => countByDay(posts), [posts]);
  const userChart = useMemo(() => countByDay(users), [users]);
  const trafficChart = useMemo(() => {
    const interactions = [
      ...comments,
      ...ratings,
      ...follows,
      ...posts.flatMap((post) =>
        Array.from({length: post._count.likes + post._count.shares}, () => ({createdAt: post.createdAt})),
      ),
    ];
    return countByDay(interactions);
  }, [comments, follows, posts, ratings]);

  const totalContent = (dashboard?.posts ?? 0) + (dashboard?.articles ?? 0) + (dashboard?.vehicleListings ?? 0);
  const totalVehicles = (dashboard?.garageVehicles ?? 0) + (dashboard?.vehicleListings ?? 0);
  const moderationQueue = (dashboard?.draftPosts ?? 0) + (dashboard?.draftArticles ?? 0);
  const latestActivity = [
    ...posts.slice(0, 4).map((post) => ({
      id: `post-${post.id}`,
      title: post.title,
      meta: `Post by ${post.author.name}`,
      date: post.createdAt,
    })),
    ...comments.slice(0, 4).map((comment) => ({
      id: `comment-${comment.id}`,
      title: comment.content,
      meta: `Comment by ${comment.user.name}`,
      date: comment.createdAt,
    })),
  ]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-[#f1f4f6] text-slate-800">
      <TopNav title="Admin" />
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-600">CarHub Control Center</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Operations Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Monitor community content, marketplace listings, user growth, and moderation workload from one admin surface.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => void loadAdminData()} className="rounded-md bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-slate-700">
                Refresh
              </button>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-600">
                {isLoading ? 'Syncing...' : 'Live data'}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Users" value={dashboard?.users ?? 0} note="Registered accounts" icon={Users} tone="bg-blue-50 text-blue-600" />
          <StatCard label="Published Posts" value={dashboard?.publishedPosts ?? 0} note={`${dashboard?.draftPosts ?? 0} drafts waiting`} icon={FileText} tone="bg-emerald-50 text-emerald-600" />
          <StatCard label="Marketplace" value={dashboard?.vehicleListings ?? 0} note={`${totalVehicles} total vehicle records`} icon={Car} tone="bg-amber-50 text-amber-600" />
          <StatCard label="Moderation" value={moderationQueue} note="Draft articles and posts" icon={Gauge} tone="bg-rose-50 text-rose-600" />
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BarChart title="Posts by Day" subtitle="Published and draft posts created over the last 7 days." data={postChart} color="bg-blue-500" />
            <BarChart title="New Users" subtitle="Registered accounts over the last 7 days." data={userChart} color="bg-emerald-500" />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">Community Activity</h2>
                <p className="mt-1 text-xs text-slate-500">Actual comments, follows, ratings and post reactions recorded by the system.</p>
              </div>
              <Activity className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-5">
              <ProgressRow label="Posts" value={dashboard?.posts ?? 0} total={Math.max(totalContent, 1)} color="bg-blue-500" />
              <ProgressRow label="Articles" value={dashboard?.articles ?? 0} total={Math.max(totalContent, 1)} color="bg-purple-500" />
              <ProgressRow label="Listings" value={dashboard?.vehicleListings ?? 0} total={Math.max(totalContent, 1)} color="bg-amber-500" />
              <ProgressRow label="Comments" value={dashboard?.comments ?? 0} total={Math.max((dashboard?.comments ?? 0) + (dashboard?.ratings ?? 0) + (dashboard?.follows ?? 0), 1)} color="bg-emerald-500" />
            </div>
            <div className="mt-7 grid grid-cols-7 items-end gap-2 border-t border-slate-100 pt-5">
              {trafficChart.map((point) => {
                const max = Math.max(...trafficChart.map((item) => item.value), 1);
                return (
                  <div key={point.label} className="flex flex-col items-center gap-2">
                    <div className="h-20 w-3 overflow-hidden rounded-full bg-slate-100 flex items-end">
                      <div className="w-full rounded-full bg-slate-900" style={{height: `${Math.max(8, (point.value / max) * 100)}%`}} />
                    </div>
                    <span className="text-[9px] font-bold uppercase text-slate-400">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">Users & Roles</h2>
                <p className="mt-1 text-xs text-slate-500">Account verification and user moderation.</p>
              </div>
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Activity</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link to={`/profile/${user.id}`} title="Xem hồ sơ người dùng">
                            <img src={user.avatar ?? `https://i.pravatar.cc/120?u=${encodeURIComponent(user.email)}`} alt={user.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-transparent transition hover:ring-blue-500" />
                          </Link>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${user.role === 'ADMIN' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-700'}`}>
                          {user.role}
                        </span>
                        {user.isVerifiedProfessional && <span className="ml-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700">Verified</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {user._count.posts} posts - {user._count.garageVehicles} garage - {user._count.vehicleListings} listings
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <ActionButton onClick={() => updateUserVerification(user.id, !user.isVerifiedProfessional)}>
                            {user.isVerifiedProfessional ? 'Revoke' : 'Verify'}
                          </ActionButton>
                          {user.role !== 'ADMIN' && <ActionButton danger onClick={() => deleteResource(`/admin/users/${user.id}`)}>Delete</ActionButton>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">Recent Activity</h2>
                <p className="mt-1 text-xs text-slate-500">Newest posts and comments.</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="space-y-4">
              {latestActivity.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.meta} - {formatDate(item.date)}</p>
                  </div>
                </div>
              ))}
              {latestActivity.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">Community Posts</h2>
                <p className="mt-1 text-xs text-slate-500">Publish, unpublish, or delete user posts.</p>
              </div>
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100">
              {posts.slice(0, 8).map((post) => (
                <div key={post.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{post.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {post.author.name} - {post.status} - {post._count.likes} likes - {post._count.comments} comments
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{post.content}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <ActionButton onClick={() => updatePostStatus(post.id, post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}>
                        {post.status === 'PUBLISHED' ? 'Hide' : 'Publish'}
                      </ActionButton>
                      <ActionButton danger onClick={() => deleteResource(`/admin/posts/${post.id}`)}>Delete</ActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">Marketplace Listings</h2>
                <p className="mt-1 text-xs text-slate-500">Moderate sale listings and garage records.</p>
              </div>
              <Car className="h-5 w-5 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100">
              {vehicles.slice(0, 8).map((vehicle) => (
                <div key={vehicle.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{vehicle.title} <span className="text-blue-600">{vehicle.price}</span></p>
                      <p className="mt-1 text-xs text-slate-500">Seller: {vehicle.seller.name} - {vehicle.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <ActionButton onClick={() => updateStatus(`/admin/vehicles/${vehicle.id}/status`, vehicle.status === 'Hidden' ? 'Active Listing' : 'Hidden')}>
                        {vehicle.status === 'Hidden' ? 'Show' : 'Hide'}
                      </ActionButton>
                      <ActionButton danger onClick={() => deleteResource(`/admin/vehicles/${vehicle.id}`)}>Delete</ActionButton>
                    </div>
                  </div>
                </div>
              ))}
              {vehicles.length === 0 && <p className="p-5 text-sm text-slate-500">No vehicle listings yet.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">Garage Vehicles</h2>
                <p className="mt-1 text-xs text-slate-500">Personal garage assets owned by users.</p>
              </div>
              <Gauge className="h-5 w-5 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100">
              {garageVehicles.slice(0, 8).map((vehicle) => (
                <div key={vehicle.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{vehicle.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Owner: {vehicle.owner.name} - {vehicle.condition} - {vehicle.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <ActionButton onClick={() => updateStatus(`/admin/garage-vehicles/${vehicle.id}/status`, vehicle.status === 'Hidden' ? 'In Garage' : 'Hidden')}>
                      {vehicle.status === 'Hidden' ? 'Show' : 'Hide'}
                    </ActionButton>
                    <ActionButton danger onClick={() => deleteResource(`/admin/garage-vehicles/${vehicle.id}`)}>Delete</ActionButton>
                  </div>
                </div>
              ))}
              {garageVehicles.length === 0 && <p className="p-5 text-sm text-slate-500">No garage vehicles yet.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">Articles</h2>
                <p className="mt-1 text-xs text-slate-500">Editorial content moderation.</p>
              </div>
              <Newspaper className="h-5 w-5 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100">
              {articles.map((article) => (
                <div key={article.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{article.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{article.author} - {article.category} - {article.status}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{article.excerpt}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <ActionButton onClick={() => updateStatus(`/admin/articles/${article.id}/status`, article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}>
                        {article.status === 'PUBLISHED' ? 'Hide' : 'Publish'}
                      </ActionButton>
                      <ActionButton danger onClick={() => deleteResource(`/admin/articles/${article.id}`)}>Delete</ActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700">
              <MessageSquare className="h-4 w-4" /> Comments
            </h2>
            <div className="space-y-3">
              {comments.slice(0, 6).map((comment) => (
                <div key={comment.id} className="rounded-md bg-slate-50 p-3">
                  <p className="line-clamp-2 text-sm text-slate-700">{comment.content}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">{comment.user.name}</p>
                    <button onClick={() => deleteResource(`/admin/comments/${comment.id}`)} className="text-[10px] font-bold uppercase text-red-500">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700">
              <Star className="h-4 w-4" /> Ratings
            </h2>
            <div className="space-y-3">
              {ratings.slice(0, 6).map((rating) => (
                <div key={rating.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                  <p className="text-sm text-slate-700">{rating.rater.name} rated {rating.targetUser.name}: {rating.score}/5</p>
                  <button onClick={() => deleteResource(`/admin/ratings/${rating.id}`)} className="text-[10px] font-bold uppercase text-red-500">Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700">
              <Users className="h-4 w-4" /> Follows
            </h2>
            <div className="space-y-3">
              {follows.slice(0, 6).map((follow) => (
                <div key={follow.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                  <p className="text-sm text-slate-700">{follow.follower.name} follows {follow.following.name}</p>
                  <button onClick={() => deleteResource(`/admin/follows/${follow.id}`)} className="text-[10px] font-bold uppercase text-red-500">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
