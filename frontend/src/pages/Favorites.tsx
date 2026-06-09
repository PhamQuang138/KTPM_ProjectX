import {useEffect, useState} from 'react';
import {Bookmark, Heart} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import MobileNav from '../components/MobileNav';
import SocialPost, {SocialPostProps} from '../components/SocialPost';
import {apiRequest} from '../lib/api';

export default function Favorites({mode}: {mode: 'liked' | 'saved'}) {
  const [posts, setPosts] = useState<SocialPostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isLiked = mode === 'liked';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');
    apiRequest<SocialPostProps[]>(isLiked ? '/posts/liked' : '/posts/bookmarked')
      .then((data) => {
        if (isMounted) setPosts(data);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError instanceof Error ? requestError.message : 'Không thể tải bài viết.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [isLiked]);

  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 md:pb-0">
      <Sidebar />
      <TopNav title={isLiked ? 'Bài viết đã thích' : 'Bài viết đã lưu'} />
      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <section className="mb-8 flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${isLiked ? 'border-red-400/20 bg-red-500/10 text-red-300' : 'border-primary/20 bg-primary/10 text-primary'}`}>
            {isLiked ? <Heart className="h-5 w-5 fill-current" /> : <Bookmark className="h-5 w-5 fill-current" />}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">{isLiked ? 'Bài viết đã thích' : 'Bài viết đã lưu'}</h1>
            <p className="text-sm text-on-surface-variant">{isLiked ? 'Những bài bạn đã thả tim.' : 'Những bài bạn lưu để xem lại.'}</p>
          </div>
        </section>

        {isLoading && <div className="rounded-2xl border border-white/10 bg-surface-container p-8 text-center text-sm text-on-surface-variant">Đang tải bài viết...</div>}
        {error && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-200">{error}</div>}
        {!isLoading && !error && posts.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-surface-container p-10 text-center">
            <p className="font-display text-xl font-bold">Chưa có bài viết</p>
            <p className="mt-2 text-sm text-on-surface-variant">Các bài bạn {isLiked ? 'thả tim' : 'lưu'} sẽ xuất hiện tại đây.</p>
          </div>
        )}
        {!isLoading && !error && posts.map((post) => <SocialPost key={post.id} {...post} />)}
      </main>
      <MobileNav />
    </div>
  );
}
