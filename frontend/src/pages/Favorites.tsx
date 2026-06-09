import {useEffect, useState} from 'react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import MobileNav from '../components/MobileNav';
import SocialPost, {SocialPostProps} from '../components/SocialPost';
import {apiRequest} from '../lib/api';
import {Heart} from 'lucide-react';

export default function Favorites() {
  const [posts, setPosts] = useState<SocialPostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    apiRequest<SocialPostProps[]>('/posts/liked')
      .then((data) => {
        if (isMounted) setPosts(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Không thể tải bài viết đã thích.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 md:pb-0">
      <Sidebar />
      <TopNav title="Bài viết đã thích" />

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <section className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-400/20 flex items-center justify-center text-red-300">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-on-surface">Bài viết đã thích</h1>
              <p className="text-sm text-on-surface-variant">Những bài trong cộng đồng mà bạn đã thả tim sẽ xuất hiện ở đây.</p>
            </div>
          </div>
        </section>

        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-surface-container p-8 text-center text-sm text-on-surface-variant">
            Đang tải danh sách bài viết...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-surface-container p-10 text-center">
            <p className="font-display text-xl font-bold text-on-surface">Chưa có bài viết đã thích</p>
            <p className="mt-2 text-sm text-on-surface-variant">Hãy thả tim một bài trong mục Cộng đồng để lưu vào danh sách này.</p>
          </div>
        )}

        {!isLoading && !error && posts.map((post) => <SocialPost key={post.id} {...post} />)}
      </main>

      <MobileNav />
    </div>
  );
}
