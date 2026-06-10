import {useEffect, useState} from 'react';
import {ArrowLeft, CalendarDays, Clock, User} from 'lucide-react';
import {Link, Navigate, useParams} from 'react-router-dom';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import {apiRequest} from '../lib/api';

interface ArticleDetailData {
  id: string;
  title: string;
  excerpt: string;
  content?: string | null;
  author: string;
  readTime?: string | null;
  image?: string | null;
  category: string;
  publishedAt?: string | null;
  createdAt: string;
}

export default function ArticleDetail() {
  const {id} = useParams();
  const [article, setArticle] = useState<ArticleDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setError('');
    apiRequest<ArticleDetailData>(`/articles/${id}`)
      .then(setArticle)
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : 'Không thể tải bài viết.'),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  if (!id) return <Navigate to="/" replace />;

  const paragraphs = (article?.content || article?.excerpt || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopNav title="Chuyên đề ô tô" />
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-12 md:py-16">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Quay lại Explore
        </Link>

        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-on-surface-variant">
            Đang tải bài viết...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200">
            {error}
          </div>
        )}

        {article && (
          <article>
            <header className="mb-10">
              <span className="badge-primary">{article.category}</span>
              <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">
                {article.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
                {article.excerpt}
              </p>
              <div className="mt-7 flex flex-wrap gap-5 text-xs text-on-surface-variant">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> {article.author}</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {article.readTime || 'Đang cập nhật'}</span>
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(article.publishedAt ?? article.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </header>

            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="mb-12 aspect-[16/9] w-full rounded-3xl border border-white/10 object-cover"
              />
            )}

            <div className="mx-auto max-w-3xl space-y-7">
              {paragraphs.map((paragraph, index) => (
                <p key={`${article.id}-${index}`} className="text-base leading-8 text-on-surface md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
