import {useEffect, useState} from 'react';
import TopNav from '../components/TopNav';
import {apiRequest} from '../lib/api';

interface Dashboard {
  users: number;
  posts: number;
  vehicles: number;
  draftPosts: number;
  publishedPosts: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  _count: {posts: number; vehicles: number};
}

interface AdminPost {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  author: {name: string; email: string};
}

interface AdminVehicle {
  id: string;
  title: string;
  price: string;
  status: string;
  seller: {name: string; email: string};
}

export default function Admin() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);

  const loadAdminData = async () => {
    const [dashboardData, usersData, postsData, vehiclesData] = await Promise.all([
      apiRequest<Dashboard>('/admin/dashboard'),
      apiRequest<AdminUser[]>('/admin/users'),
      apiRequest<AdminPost[]>('/admin/posts'),
      apiRequest<AdminVehicle[]>('/admin/vehicles'),
    ]);

    setDashboard(dashboardData);
    setUsers(usersData);
    setPosts(postsData);
    setVehicles(vehiclesData);
  };

  useEffect(() => {
    loadAdminData().catch(() => undefined);
  }, []);

  const updatePostStatus = async (id: string, status: 'DRAFT' | 'PUBLISHED') => {
    await apiRequest(`/admin/posts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({status}),
    });
    await loadAdminData();
  };

  const deleteResource = async (path: string) => {
    await apiRequest(path, {method: 'DELETE'});
    await loadAdminData();
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNav title="Admin" />
      <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-10 space-y-10">
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            ['Users', dashboard?.users ?? 0],
            ['Posts', dashboard?.posts ?? 0],
            ['Vehicles', dashboard?.vehicles ?? 0],
            ['Drafts', dashboard?.draftPosts ?? 0],
            ['Published', dashboard?.publishedPosts ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">{label}</p>
              <p className="font-display text-3xl font-bold mt-2">{value}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Users</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div>
                  <p className="font-bold">{user.name} <span className="text-primary text-xs">{user.role}</span></p>
                  <p className="text-xs text-on-surface-variant">{user.email} · {user._count.posts} posts · {user._count.vehicles} vehicles</p>
                </div>
                {user.role !== 'ADMIN' && <button onClick={() => deleteResource(`/admin/users/${user.id}`)} className="text-red-300 text-xs font-bold">Delete</button>}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Community Posts</h2>
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">{post.title}</p>
                    <p className="text-xs text-on-surface-variant">By {post.author.name} · {post.status}</p>
                    <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{post.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updatePostStatus(post.id, post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')} className="btn-secondary px-4 py-2 text-[10px]">
                      {post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => deleteResource(`/admin/posts/${post.id}`)} className="text-red-300 text-xs font-bold">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Vehicle Listings</h2>
          <div className="space-y-2">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div>
                  <p className="font-bold">{vehicle.title} <span className="text-primary">{vehicle.price}</span></p>
                  <p className="text-xs text-on-surface-variant">Seller: {vehicle.seller.name} · {vehicle.status}</p>
                </div>
                <button onClick={() => deleteResource(`/admin/vehicles/${vehicle.id}`)} className="text-red-300 text-xs font-bold">Delete</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
