import {FormEvent, useEffect, useRef, useState} from 'react';
import {Bot, Camera, ExternalLink, LoaderCircle, Send, Sparkles, Trash2, X} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import {apiRequest} from '../lib/api';
import {uploadImage} from '../lib/imageUpload';
import {useAuthStore} from '../store/useAuthStore';
import {useMessageStore} from '../store/useMessageStore';
import {useSettingsStore} from '../store/useSettingsStore';

interface AiListing {
  id: string;
  title: string;
  description?: string | null;
  price: string;
  location: string;
  image: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  condition?: string | null;
  seller: {
    id: string;
    name: string;
    avatar?: string | null;
    role: 'USER' | 'ADMIN';
    isVerifiedProfessional: boolean;
  };
}

interface AiResponse {
  answer: string;
  listings: AiListing[];
  imageAnalysis?: {
    make?: string | null;
    model?: string | null;
    bodyType?: string | null;
    confidence?: number | null;
  } | null;
}

interface ChatItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imagePreview?: string;
  listings?: AiListing[];
}

const welcomeMessage: ChatItem = {
  id: 'welcome',
  role: 'assistant',
  content: 'Chào bạn, tôi có thể tìm xe theo ngân sách VND, ghi nhớ các câu hỏi nối tiếp hoặc nhận diện xe bằng ảnh. Ví dụ: “Tìm SUV giá tốt”, rồi hỏi tiếp “còn xe Nhật thì sao?”.',
};

export default function ChatbotDock() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isMessageDockOpen = useMessageStore((state) => state.isOpen);
  const closeMessageDock = useMessageStore((state) => state.close);
  const autoOpenChatbot = useSettingsStore((state) => state.settings.autoOpenChatbot);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [items, setItems] = useState<ChatItem[]>([welcomeMessage]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isMessageDockOpen) setIsOpen(false);
  }, [isMessageDockOpen]);

  useEffect(() => {
    if (!isAuthenticated || !autoOpenChatbot) return;
    const sessionKey = 'carhub_chatbot_auto_opened';
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      setIsOpen(true);
    }
  }, [autoOpenChatbot, isAuthenticated]);

  useEffect(() => {
    scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight, behavior: 'smooth'});
  }, [items, isSending]);

  useEffect(() => () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const chooseImage = (file?: File) => {
    if (!file) return;
    if (imagePreview && !items.some((item) => item.imagePreview === imagePreview)) {
      URL.revokeObjectURL(imagePreview);
      previewUrlsRef.current.delete(imagePreview);
    }
    const nextPreview = URL.createObjectURL(file);
    previewUrlsRef.current.add(nextPreview);
    setSelectedImage(file);
    setImagePreview(nextPreview);
    setError('');
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      previewUrlsRef.current.delete(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextMessage = message.trim();
    if ((!nextMessage && !selectedImage) || isSending) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const pendingPreview = imagePreview;
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: nextMessage || 'Tìm xe tương tự ảnh này',
        imagePreview: pendingPreview,
      },
    ]);
    setMessage('');
    setError('');
    setIsSending(true);

    try {
      const uploaded = selectedImage ? await uploadImage(selectedImage) : undefined;
      const history = items
        .filter((item) => item.id !== welcomeMessage.id)
        .slice(-10)
        .map((item) => ({role: item.role, content: item.content}));
      const result = await apiRequest<AiResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: nextMessage,
          imageUrl: uploaded?.url,
          history,
        }),
      });
      setItems((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.answer,
          listings: result.listings,
        },
      ]);
      setSelectedImage(null);
      setImagePreview('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể hỏi trợ lý CarHub.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {!isOpen && !isMessageDockOpen && (
        <button
          type="button"
          onClick={() => {
            closeMessageDock();
            setIsOpen(true);
          }}
          className="fixed bottom-24 right-5 z-[75] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl shadow-primary/30 transition hover:scale-105 md:bottom-6 md:right-6"
          title="Trợ lý tìm xe"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <section className="fixed bottom-20 right-3 z-[90] flex h-[min(680px,calc(100vh-7rem))] w-[min(430px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-container shadow-2xl md:bottom-6 md:right-6">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-bold">Trợ lý tìm xe</h2>
              <p className="text-[10px] text-on-surface-variant">Nex AI + dữ liệu chợ xe</p>
            </div>
            <button
              type="button"
              onClick={() => setItems([welcomeMessage])}
              className="interactive-icon"
              title="Xóa cuộc trò chuyện"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className="interactive-icon" title="Đóng">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {items.map((item) => (
              <div key={item.id} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] space-y-3 ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      item.role === 'user'
                        ? 'rounded-br-md bg-primary text-on-primary'
                        : 'rounded-bl-md bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {item.imagePreview && (
                      <img src={item.imagePreview} alt="Ảnh tìm kiếm" className="mb-3 max-h-40 w-full rounded-xl object-cover" />
                    )}
                    <p className="whitespace-pre-wrap">{item.content}</p>
                  </div>

                  {item.listings?.map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/market/${listing.id}`}
                      className="block overflow-hidden rounded-xl border border-white/10 bg-background transition hover:border-primary/40"
                    >
                      {listing.image && (
                        <img src={listing.image} alt={listing.title} className="aspect-[16/8] w-full object-cover" />
                      )}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{listing.title}</p>
                            <p className="mt-1 text-xs text-on-surface-variant">
                              {[listing.make, listing.model, listing.year, listing.condition].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 shrink-0 text-on-surface-variant" />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-sm font-bold text-primary">{listing.price}</span>
                          <span className="truncate text-[10px] text-on-surface-variant">{listing.location}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                Đang phân tích và tìm trong chợ xe...
              </div>
            )}
          </div>

          {imagePreview && (
            <div className="mx-3 mb-2 flex items-center gap-3 rounded-xl border border-white/10 bg-background p-2">
              <img src={imagePreview} alt="Ảnh đã chọn" className="h-14 w-16 rounded-lg object-cover" />
              <p className="min-w-0 flex-1 truncate text-xs">{selectedImage?.name}</p>
              <button type="button" onClick={removeImage} className="interactive-icon" title="Bỏ ảnh">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && <p className="mx-3 mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>}

          <form onSubmit={submit} className="flex shrink-0 items-end gap-2 border-t border-white/10 p-3">
            <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-background text-on-surface-variant hover:text-primary">
              <Camera className="h-5 w-5" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isSending}
                onChange={(event) => {
                  chooseImage(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={1}
              maxLength={2000}
              placeholder="Ví dụ: Tìm SUV giá tốt khoảng 500 triệu đến 1 tỷ..."
              className="max-h-28 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-white/10 bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={(!message.trim() && !selectedImage) || isSending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-50"
              title="Gửi"
            >
              {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
