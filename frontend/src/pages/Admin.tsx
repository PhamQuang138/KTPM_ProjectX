import {useEffect, useState} from 'react';
import TopNav from '../components/TopNav';
import {apiRequest} from '../lib/api';

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
  isVerifiedProfessional: boolean;
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
  author: {name: string; email: string};
  _count: {likes: number; comments: number; shares: number};
}

interface AdminVehicle {
  id: string;
  title: string;
  price: string;
  status: string;
  seller: {name: string; email: string};
}

interface AdminGarageVehicle {
  id: string;
  title: string;
  status: string;
  condition: string;
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
  user: {name: string; email: string};
  post: {title: string};
}

interface AdminRating {
  id: string;
  score: number;
  rater: {name: string; email: string};
  targetUser: {name: string; email: string};
}

interface AdminFollow {
  id: string;
  follower: {name: string; email: string};
  following: {name: string; email: string};
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

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNav title="Admin" />
      <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-10 space-y-10">
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {isLoading && <p className="text-sm text-on-surface-variant">Loading admin data...</p>}

        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {[
            ['Users', dashboard?.users ?? 0],
            ['Posts', dashboard?.posts ?? 0],
            ['Listings', dashboard?.vehicleListings ?? 0],
            ['Garage', dashboard?.garageVehicles ?? 0],
            ['Articles', dashboard?.articles ?? 0],
            ['Comments', dashboard?.comments ?? 0],
            ['Ratings', dashboard?.ratings ?? 0],
            ['Follows', dashboard?.follows ?? 0],
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
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div>
                  <p className="font-bold">
                    {user.name} <span className="text-primary text-xs">{user.role}</span>{' '}
                    {user.isVerifiedProfessional && <span className="text-green-300 text-xs">Verified Pro</span>}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {user.email} - {user._count.posts} posts - {user._count.garageVehicles} garage - {user._count.vehicleListings} listings
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => updateUserVerification(user.id, !user.isVerifiedProfessional)}
                    className="btn-secondary px-4 py-2 text-[10px]"
                  >
                    {user.isVerifiedProfessional ? 'Revoke Verified' : 'Verify Pro'}
                  </button>
                  {user.role !== 'ADMIN' && <button onClick={() => deleteResource(`/admin/users/${user.id}`)} className="text-red-300 text-xs font-bold">Delete</button>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Community Posts</h2>
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">{post.title}</p>
                    <p className="text-xs text-on-surface-variant">
                      By {post.author.name} - {post.status} - {post._count.likes} likes - {post._count.comments} comments - {post._count.shares} shares
                    </p>
                    <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{post.content}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
              <div key={vehicle.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div>
                  <p className="font-bold">{vehicle.title} <span className="text-primary">{vehicle.price}</span></p>
                  <p className="text-xs text-on-surface-variant">Seller: {vehicle.seller.name} - {vehicle.status}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => updateStatus(`/admin/vehicles/${vehicle.id}/status`, vehicle.status === 'Hidden' ? 'Active Listing' : 'Hidden')} className="btn-secondary px-4 py-2 text-[10px]">
                    {vehicle.status === 'Hidden' ? 'Show' : 'Hide'}
                  </button>
                  <button onClick={() => deleteResource(`/admin/vehicles/${vehicle.id}`)} className="text-red-300 text-xs font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Garage Vehicles</h2>
          <div className="space-y-2">
            {garageVehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div>
                  <p className="font-bold">{vehicle.title}</p>
                  <p className="text-xs text-on-surface-variant">Owner: {vehicle.owner.name} - {vehicle.condition} - {vehicle.status}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => updateStatus(`/admin/garage-vehicles/${vehicle.id}/status`, vehicle.status === 'Hidden' ? 'In Garage' : 'Hidden')} className="btn-secondary px-4 py-2 text-[10px]">
                    {vehicle.status === 'Hidden' ? 'Show' : 'Hide'}
                  </button>
                  <button onClick={() => deleteResource(`/admin/garage-vehicles/${vehicle.id}`)} className="text-red-300 text-xs font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Articles</h2>
          <div className="space-y-2">
            {articles.map((article) => (
              <div key={article.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">{article.title}</p>
                    <p className="text-xs text-on-surface-variant">{article.author} - {article.category} - {article.status}</p>
                    <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{article.excerpt}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => updateStatus(`/admin/articles/${article.id}/status`, article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')} className="btn-secondary px-4 py-2 text-[10px]">
                      {article.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => deleteResource(`/admin/articles/${article.id}`)} className="text-red-300 text-xs font-bold">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Comments</h2>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div>
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-on-surface-variant">By {comment.user.name} on {comment.post.title}</p>
                </div>
                <button onClick={() => deleteResource(`/admin/comments/${comment.id}`)} className="text-red-300 text-xs font-bold">Delete</button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Ratings</h2>
            <div className="space-y-2">
              {ratings.map((rating) => (
                <div key={rating.id} className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <p className="text-sm">{rating.rater.name} rated {rating.targetUser.name}: {rating.score}/5</p>
                  <button onClick={() => deleteResource(`/admin/ratings/${rating.id}`)} className="text-red-300 text-xs font-bold">Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Follows</h2>
            <div className="space-y-2">
              {follows.map((follow) => (
                <div key={follow.id} className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <p className="text-sm">{follow.follower.name} follows {follow.following.name}</p>
                  <button onClick={() => deleteResource(`/admin/follows/${follow.id}`)} className="text-red-300 text-xs font-bold">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
